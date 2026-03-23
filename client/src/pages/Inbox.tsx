import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useSupabaseAuth } from '../components/SupabaseAuthContext';
import UserAvatar from '../components/UserAvatar';
import {
  Conversation,
  getConversations,
  getTotalUnreadCount,
  subscribeToConversationUpdates,
} from '../lib/dm-api';

function formatTimeAgo(dateStr: string): string {
  const now = Date.now();
  const then = new Date(dateStr).getTime();
  const diff = now - then;
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (mins < 1) return 'now';
  if (mins < 60) return `${mins}m`;
  if (hours < 24) return `${hours}h`;
  if (days < 7) return `${days}d`;
  return new Date(dateStr).toLocaleDateString();
}

export default function Inbox() {
  const { user } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadConversations = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const data = await getConversations(user.id);
      setConversations(data);
    } catch (err) {
      console.error('Error loading conversations:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, [user?.id]);

  // Subscribe to real-time conversation updates
  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = subscribeToConversationUpdates(user.id, () => {
      loadConversations();
    });
    return unsubscribe;
  }, [user?.id]);

  return (
    <div style={{ paddingBottom: '80px', backgroundColor: '#f9fafb', minHeight: '100vh' }}>
      {/* Header */}
      <div style={{
        position: 'sticky',
        top: 0,
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e5e7eb',
        padding: '16px 20px',
        zIndex: 40,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setLocation('/')}
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
          <h1 style={{
            fontSize: '20px',
            fontWeight: '700',
            color: '#111827',
            margin: 0,
          }}>Messages</h1>
        </div>

        <button
          onClick={() => setLocation('/messages/new')}
          style={{
            background: 'linear-gradient(135deg, #C671FF, #FF61A6)',
            border: 'none',
            borderRadius: '50%',
            width: '36px',
            height: '36px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            boxShadow: '0 2px 8px rgba(198, 113, 255, 0.4)',
          }}
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{
            width: '32px',
            height: '32px',
            border: '3px solid #e5e7eb',
            borderTopColor: '#7c3aed',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : conversations.length === 0 ? (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px 40px',
          textAlign: 'center',
        }}>
          <svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginTop: '16px' }}>
            No messages yet
          </h3>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px', lineHeight: '1.5' }}>
            Start a conversation by visiting someone's profile and tapping the message button.
          </p>
        </div>
      ) : (
        <div>
          {conversations.map((convo) => (
            <button
              key={convo.id}
              onClick={() => setLocation(`/messages/${convo.id}`)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                width: '100%',
                padding: '16px 20px',
                backgroundColor: convo.unread_count && convo.unread_count > 0 ? '#faf5ff' : '#ffffff',
                border: 'none',
                borderBottom: '1px solid #f3f4f6',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background-color 0.15s',
              }}
              onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f9fafb'}
              onMouseLeave={(e) => e.currentTarget.style.backgroundColor = convo.unread_count && convo.unread_count > 0 ? '#faf5ff' : '#ffffff'}
            >
              <UserAvatar
                userId={convo.other_user?.id || ''}
                size={48}
                imageUrl={convo.other_user?.profile_image_url || undefined}
              />

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                  <span style={{
                    fontSize: '15px',
                    fontWeight: convo.unread_count && convo.unread_count > 0 ? '700' : '600',
                    color: '#111827',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {convo.other_user?.first_name || 'Unknown'} {convo.other_user?.last_name || ''}
                  </span>
                  {convo.last_message && (
                    <span style={{
                      fontSize: '12px',
                      color: convo.unread_count && convo.unread_count > 0 ? '#7c3aed' : '#9ca3af',
                      fontWeight: convo.unread_count && convo.unread_count > 0 ? '600' : '400',
                      flexShrink: 0,
                      marginLeft: '8px',
                    }}>
                      {formatTimeAgo(convo.last_message.created_at)}
                    </span>
                  )}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{
                    fontSize: '13px',
                    color: convo.unread_count && convo.unread_count > 0 ? '#374151' : '#9ca3af',
                    fontWeight: convo.unread_count && convo.unread_count > 0 ? '500' : '400',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    flex: 1,
                  }}>
                    {convo.last_message
                      ? (convo.last_message.sender_id === user?.id ? 'You: ' : '') + convo.last_message.content
                      : 'No messages yet'}
                  </span>

                  {convo.unread_count != null && convo.unread_count > 0 && (
                    <span style={{
                      backgroundColor: '#7c3aed',
                      color: 'white',
                      fontSize: '11px',
                      fontWeight: '700',
                      borderRadius: '10px',
                      minWidth: '20px',
                      height: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: '0 6px',
                      flexShrink: 0,
                    }}>
                      {convo.unread_count > 99 ? '99+' : convo.unread_count}
                    </span>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
