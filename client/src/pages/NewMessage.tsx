import { useState } from 'react';
import { useLocation } from 'wouter';
import { useSupabaseAuth } from '../components/SupabaseAuthContext';
import UserAvatar from '../components/UserAvatar';
import { getOrCreateConversation } from '../lib/dm-api';
import { supabase } from '../lib/supabase';

interface UserResult {
  id: string;
  first_name: string;
  last_name: string;
  handle: string;
  custom_handle: string | null;
  profile_image_url: string | null;
}

export default function NewMessage() {
  const { user } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<UserResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim().length < 2) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    try {
      const searchTerm = `%${query.trim()}%`;
      const { data, error } = await supabase
        .from('users')
        .select('id, first_name, last_name, handle, custom_handle, profile_image_url')
        .neq('id', user?.id || '')
        .or(`first_name.ilike.${searchTerm},last_name.ilike.${searchTerm},handle.ilike.${searchTerm},custom_handle.ilike.${searchTerm}`)
        .limit(20);

      if (!error && data) {
        setResults(data);
      }
    } catch (err) {
      console.error('Error searching users:', err);
    } finally {
      setIsSearching(false);
    }
  };

  const handleSelectUser = async (selectedUser: UserResult) => {
    if (!user?.id || isCreating) return;
    setIsCreating(true);

    try {
      const conversationId = await getOrCreateConversation(user.id, selectedUser.id);
      if (conversationId) {
        setLocation(`/messages/${conversationId}`);
      } else {
        alert('Unable to start conversation. This user may have blocked you.');
      }
    } catch (err) {
      console.error('Error creating conversation:', err);
      alert('Failed to start conversation. Please try again.');
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <div style={{ backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
      }}>
        <button
          onClick={() => setLocation('/messages')}
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            padding: '4px',
            display: 'flex',
          }}
        >
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" />
            <polyline points="12 19 5 12 12 5" />
          </svg>
        </button>
        <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>
          New Message
        </h1>
      </div>

      {/* Search */}
      <div style={{ padding: '16px 20px' }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          backgroundColor: '#ffffff',
          border: '2px solid #e5e7eb',
          borderRadius: '12px',
          padding: '0 14px',
          transition: 'border-color 0.2s',
        }}>
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name or handle..."
            autoFocus
            style={{
              flex: 1,
              padding: '14px 0',
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              backgroundColor: 'transparent',
            }}
          />
        </div>
      </div>

      {/* Results */}
      <div>
        {isSearching ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div style={{
              width: '24px',
              height: '24px',
              border: '3px solid #e5e7eb',
              borderTopColor: '#7c3aed',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : searchQuery.length >= 2 && results.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            color: '#9ca3af',
            fontSize: '14px',
          }}>
            No users found matching "{searchQuery}"
          </div>
        ) : (
          results.map((userResult) => (
            <button
              key={userResult.id}
              onClick={() => handleSelectUser(userResult)}
              disabled={isCreating}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '14px 20px',
                backgroundColor: '#ffffff',
                border: 'none',
                borderBottom: '1px solid #f3f4f6',
                cursor: isCreating ? 'wait' : 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.15s',
                opacity: isCreating ? 0.6 : 1,
              }}
              onMouseEnter={(e) => { if (!isCreating) e.currentTarget.style.backgroundColor = '#f9fafb'; }}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#ffffff'}
            >
              <UserAvatar
                userId={userResult.id}
                size={44}
                imageUrl={userResult.profile_image_url || undefined}
              />
              <div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>
                  {userResult.first_name} {userResult.last_name || ''}
                </div>
                <div style={{ fontSize: '13px', color: '#9ca3af' }}>
                  @{userResult.custom_handle || userResult.handle}
                </div>
              </div>
            </button>
          ))
        )}

        {searchQuery.length < 2 && results.length === 0 && (
          <div style={{
            textAlign: 'center',
            padding: '60px 40px',
            color: '#9ca3af',
            fontSize: '14px',
            lineHeight: '1.6',
          }}>
            Search for a user to start a conversation
          </div>
        )}
      </div>
    </div>
  );
}
