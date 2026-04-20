import { useState } from 'react';
import { useLocation } from 'wouter';
import { useSupabaseAuth } from '../components/SupabaseAuthContext';
import UserAvatar from '../components/UserAvatar';
import { supabase } from '../lib/supabase';
import { createGroupChat } from '../lib/group-api';

interface UserResult {
  id: string;
  first_name: string;
  last_name: string;
  handle: string;
  custom_handle: string | null;
  profile_image_url: string | null;
}

export default function NewGroupChat() {
  const { user } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<UserResult[]>([]);
  const [selected, setSelected] = useState<UserResult[]>([]);
  const [groupName, setGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [step, setStep] = useState<'pick' | 'name'>('pick');

  const handleSearch = async (q: string) => {
    setSearchQuery(q);
    if (q.length < 2) { setSearchResults([]); return; }
    const ids = new Set(selected.map((m) => m.id));
    const { data } = await supabase
      .from('users')
      .select('id, first_name, last_name, handle, custom_handle, profile_image_url')
      .or(`first_name.ilike.%${q}%,last_name.ilike.%${q}%,handle.ilike.%${q}%,custom_handle.ilike.%${q}%`)
      .neq('id', user?.id || '')
      .limit(20);
    setSearchResults((data || []).filter((u) => !ids.has(u.id)));
  };

  const toggle = (u: UserResult) => {
    setSelected((prev) => prev.find((m) => m.id === u.id) ? prev.filter((m) => m.id !== u.id) : [...prev, u]);
    setSearchResults((prev) => prev.filter((r) => r.id !== u.id));
    setSearchQuery('');
  };

  const handleCreate = async () => {
    if (isCreating) return;
    if (!user?.id || selected.length === 0 || !groupName.trim()) return;
    setIsCreating(true);
    const allIds = [user.id, ...selected.map((m) => m.id)];
    const groupId = await createGroupChat(groupName.trim(), allIds);
    if (groupId) { setLocation(`/group/${groupId}`); }
    else { alert('Failed to create group chat'); setIsCreating(false); }
  };

  return (
    <div style={{ paddingBottom: '80px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      <div style={{
        position: 'sticky', top: 0, backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e5e7eb', padding: '16px 20px', zIndex: 40,
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => step === 'name' ? setStep('pick') : setLocation('/messages')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h1 style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>
            {step === 'pick' ? 'New Group' : 'Name Your Group'}
          </h1>
        </div>
        {step === 'pick' && selected.length > 0 && (
          <button onClick={() => setStep('name')} style={{
            background: 'linear-gradient(135deg, #C671FF, #FF61A6)', border: 'none', borderRadius: '20px',
            padding: '8px 20px', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
          }}>Next</button>
        )}
        {step === 'name' && (
          <button onClick={handleCreate} disabled={!groupName.trim() || isCreating} style={{
            background: groupName.trim() ? 'linear-gradient(135deg, #C671FF, #FF61A6)' : '#e5e7eb',
            border: 'none', borderRadius: '20px', padding: '8px 20px',
            color: groupName.trim() ? 'white' : '#9ca3af', fontSize: '14px', fontWeight: '600',
            cursor: groupName.trim() ? 'pointer' : 'default',
          }}>{isCreating ? 'Creating...' : 'Create'}</button>
        )}
      </div>

      {step === 'pick' ? (
        <div style={{ padding: '16px 20px' }}>
          {selected.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
              {selected.map((m) => (
                <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', backgroundColor: '#f3e8ff', borderRadius: '20px', padding: '4px 12px 4px 4px' }}>
                  <UserAvatar user={{ id: m.id, firstName: m.first_name, lastName: m.last_name, email: '', profileImageUrl: m.profile_image_url || undefined }} size={24} />
                  <span style={{ fontSize: '13px', fontWeight: '500', color: '#7c3aed' }}>{m.first_name}</span>
                  <button onClick={() => setSelected((p) => p.filter((x) => x.id !== m.id))} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontSize: '14px', color: '#9ca3af', lineHeight: 1 }}>x</button>
                </div>
              ))}
            </div>
          )}
          <input type="text" value={searchQuery} onChange={(e) => handleSearch(e.target.value)} placeholder="Search for people to add..."
            style={{ width: '100%', padding: '12px 16px', backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '14px', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#C671FF')} onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')} />
          {searchResults.map((u) => (
            <button key={u.id} onClick={() => toggle(u)} style={{
              display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '12px 16px',
              backgroundColor: '#fff', border: 'none', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', textAlign: 'left',
            }}>
              <UserAvatar user={{ id: u.id, firstName: u.first_name, lastName: u.last_name, email: '', profileImageUrl: u.profile_image_url || undefined }} size={44} />
              <div>
                <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>{u.first_name} {u.last_name || ''}</div>
                <div style={{ fontSize: '13px', color: '#9ca3af' }}>@{u.custom_handle || u.handle}</div>
              </div>
            </button>
          ))}
          {searchQuery.length >= 2 && searchResults.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#9ca3af', fontSize: '14px' }}>No users found</div>
          )}
        </div>
      ) : (
        <div style={{ padding: '24px 20px' }}>
          <label style={{ fontSize: '14px', fontWeight: '600', color: '#374151', display: 'block', marginBottom: '8px' }}>Group Name</label>
          <input type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Enter a name..." maxLength={50} autoFocus
            style={{ width: '100%', padding: '14px 16px', backgroundColor: '#fff', border: '2px solid #e5e7eb', borderRadius: '12px', fontSize: '16px', outline: 'none', boxSizing: 'border-box' }}
            onFocus={(e) => (e.currentTarget.style.borderColor = '#C671FF')} onBlur={(e) => (e.currentTarget.style.borderColor = '#e5e7eb')} />
          <div style={{ fontSize: '12px', color: '#9ca3af', marginTop: '6px', textAlign: 'right' }}>{groupName.length}/50</div>
          <div style={{ fontSize: '14px', fontWeight: '600', color: '#374151', marginTop: '20px', marginBottom: '12px' }}>Members ({selected.length + 1})</div>
          {selected.map((m) => (
            <div key={m.id} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 0', borderBottom: '1px solid #f3f4f6' }}>
              <UserAvatar user={{ id: m.id, firstName: m.first_name, lastName: m.last_name, email: '', profileImageUrl: m.profile_image_url || undefined }} size={40} />
              <div>
                <div style={{ fontSize: '14px', fontWeight: '500', color: '#111827' }}>{m.first_name} {m.last_name || ''}</div>
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>@{m.custom_handle || m.handle}</div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
