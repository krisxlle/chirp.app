import { useEffect, useState } from 'react';
import { useLocation } from 'wouter';
import { useSupabaseAuth } from '../components/SupabaseAuthContext';
import UserAvatar from '../components/UserAvatar';
import { GroupIcon } from '../components/icons';
import {
  Conversation,
  getConversations,
  subscribeToConversationUpdates,
} from '../lib/dm-api';
import { GroupChat, getGroupChats } from '../lib/group-api';
import { C, font } from '../lib/chirpBrand';

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

type InboxItem =
  | { type: 'dm'; data: Conversation; sortTime: number }
  | { type: 'group'; data: GroupChat; sortTime: number };

export default function Inbox() {
  const { user } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const [items, setItems] = useState<InboxItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNewMenu, setShowNewMenu] = useState(false);

  const loadAll = async () => {
    if (!user?.id) return;
    setIsLoading(true);
    try {
      const [convos, groups] = await Promise.all([
        getConversations(user.id),
        getGroupChats(user.id).catch(() => [] as GroupChat[]),
      ]);
      const merged: InboxItem[] = [
        ...convos.map((c) => ({ type: 'dm' as const, data: c, sortTime: c.last_message ? new Date(c.last_message.created_at).getTime() : new Date(c.created_at).getTime() })),
        ...groups.map((g) => ({ type: 'group' as const, data: g, sortTime: new Date(g.last_message_at).getTime() })),
      ];
      merged.sort((a, b) => b.sortTime - a.sortTime);
      setItems(merged);
    } catch (err) {
      console.error('Error loading inbox:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadAll(); }, [user?.id]);

  useEffect(() => {
    if (!user?.id) return;
    const unsubscribe = subscribeToConversationUpdates(user.id, () => { loadAll(); });
    return unsubscribe;
  }, [user?.id]);

  return (
    <div style={{ paddingBottom: '80px', backgroundColor: C.paleLavender, minHeight: '100vh', ...font.body }}>
      {/* Header — match HomePage */}
      <div style={{
        position: 'sticky', top: 0, zIndex: 40,
        backgroundColor: '#ffffff',
        borderBottom: `1px solid ${C.lightBlueGrey}`,
        paddingTop: '12px', paddingBottom: '12px', paddingLeft: '16px', paddingRight: '16px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => setLocation('/')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
            <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke={C.deepPurple} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
            </svg>
          </button>
          <h1 style={{ fontSize: '24px', color: C.deepPurple, margin: 0, ...font.heading }}>Messages</h1>
        </div>

        <div style={{ position: 'relative' }}>
          <button
            onClick={() => setShowNewMenu((v) => !v)}
            style={{
              background: 'linear-gradient(135deg, #C671FF, #FF61A6)', border: 'none',
              borderRadius: '50%', width: '36px', height: '36px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', boxShadow: '0 2px 8px rgba(198, 113, 255, 0.4)',
            }}
          >
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
            </svg>
          </button>

          {showNewMenu && (
            <>
              <div onClick={() => setShowNewMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 49 }} />
              <div style={{
                position: 'absolute', right: 0, top: '44px', backgroundColor: '#fff',
                borderRadius: '12px', boxShadow: '0 4px 20px rgba(0,0,0,0.12)',
                border: '1px solid #e5e7eb', overflow: 'hidden', zIndex: 50, minWidth: '180px',
              }}>
                <button onClick={() => { setShowNewMenu(false); setLocation('/messages/new'); }} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                  padding: '12px 16px', border: 'none', backgroundColor: '#fff', cursor: 'pointer',
                  fontSize: '14px', color: '#111827', textAlign: 'left', borderBottom: '1px solid #f3f4f6',
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
                >
                  <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  New Message
                </button>
                <button onClick={() => { setShowNewMenu(false); setLocation('/group/new'); }} style={{
                  display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                  padding: '12px 16px', border: 'none', backgroundColor: '#fff', cursor: 'pointer',
                  fontSize: '14px', color: '#111827', textAlign: 'left',
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '#fff')}
                >
                  <GroupIcon size={18} color="#7c3aed" />
                  New Group
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      {isLoading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid #e5e7eb', borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      ) : items.length === 0 ? (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '80px 40px', textAlign: 'center' }}>
          <svg width={64} height={64} viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
          <h3 style={{ fontSize: '18px', fontWeight: '600', color: '#374151', marginTop: '16px' }}>No messages yet</h3>
          <p style={{ fontSize: '14px', color: '#9ca3af', marginTop: '8px', lineHeight: '1.5' }}>
            Start a conversation by visiting someone's profile and tapping the message button.
          </p>
        </div>
      ) : (
        <div>
          {items.map((item) => {
            if (item.type === 'dm') {
              const convo = item.data;
              return (
                <button key={`dm-${convo.id}`} onClick={() => setLocation(`/messages/${convo.id}`)} style={{
                  display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '16px 20px',
                  backgroundColor: convo.unread_count && convo.unread_count > 0 ? '#faf5ff' : '#ffffff',
                  border: 'none', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', textAlign: 'left', transition: 'background-color 0.15s',
                }}
                  onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                  onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = convo.unread_count && convo.unread_count > 0 ? '#faf5ff' : '#ffffff')}
                >
                  <UserAvatar user={{ id: convo.other_user?.id || '', firstName: convo.other_user?.first_name, lastName: convo.other_user?.last_name, email: '', profileImageUrl: convo.other_user?.profile_image_url || undefined }} size={48} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                      <span style={{ fontSize: '15px', fontWeight: convo.unread_count && convo.unread_count > 0 ? '700' : '600', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {convo.other_user?.first_name || 'Unknown'} {convo.other_user?.last_name || ''}
                      </span>
                      {convo.last_message && (
                        <span style={{ fontSize: '12px', color: convo.unread_count && convo.unread_count > 0 ? '#7c3aed' : '#9ca3af', fontWeight: convo.unread_count && convo.unread_count > 0 ? '600' : '400', flexShrink: 0, marginLeft: '8px' }}>
                          {formatTimeAgo(convo.last_message.created_at)}
                        </span>
                      )}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '13px', color: convo.unread_count && convo.unread_count > 0 ? '#374151' : '#9ca3af', fontWeight: convo.unread_count && convo.unread_count > 0 ? '500' : '400', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                        {convo.last_message ? (convo.last_message.sender_id === user?.id ? 'You: ' : '') + convo.last_message.content : 'No messages yet'}
                      </span>
                      {convo.unread_count != null && convo.unread_count > 0 && (
                        <span style={{ backgroundColor: '#7c3aed', color: 'white', fontSize: '11px', fontWeight: '700', borderRadius: '10px', minWidth: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', flexShrink: 0 }}>
                          {convo.unread_count > 99 ? '99+' : convo.unread_count}
                        </span>
                      )}
                    </div>
                  </div>
                </button>
              );
            }

            const group = item.data;
            const hasUnread = (group.unread_count || 0) > 0;
            return (
              <button key={`group-${group.id}`} onClick={() => setLocation(`/group/${group.id}`)} style={{
                display: 'flex', alignItems: 'center', gap: '12px', width: '100%', padding: '16px 20px',
                backgroundColor: hasUnread ? '#faf5ff' : '#ffffff',
                border: 'none', borderBottom: '1px solid #f3f4f6', cursor: 'pointer', textAlign: 'left', transition: 'background-color 0.15s',
              }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = hasUnread ? '#faf5ff' : '#ffffff')}
              >
                <div style={{
                  width: '48px', height: '48px', borderRadius: '50%', flexShrink: 0,
                  background: 'linear-gradient(135deg, #C671FF20, #FF61A620)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <GroupIcon size={24} color="#7c3aed" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <span style={{ fontSize: '15px', fontWeight: hasUnread ? '700' : '600', color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {group.name}
                    </span>
                    {group.last_message && (
                      <span style={{ fontSize: '12px', color: hasUnread ? '#7c3aed' : '#9ca3af', fontWeight: hasUnread ? '600' : '400', flexShrink: 0, marginLeft: '8px' }}>
                        {formatTimeAgo(group.last_message.created_at)}
                      </span>
                    )}
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '13px', color: hasUnread ? '#374151' : '#9ca3af', fontWeight: hasUnread ? '500' : '400', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                      {group.last_message
                        ? (group.last_message.message_type === 'system'
                          ? (group.last_message.sender_name || 'Someone') + ' ' + group.last_message.content
                          : (group.last_message.sender_id === user?.id ? 'You' : group.last_message.sender_name || 'Someone') + ': ' + group.last_message.content)
                        : 'No messages yet'}
                    </span>
                    {hasUnread && (
                      <span style={{ backgroundColor: '#7c3aed', color: 'white', fontSize: '11px', fontWeight: '700', borderRadius: '10px', minWidth: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 6px', flexShrink: 0 }}>
                        {(group.unread_count || 0) > 99 ? '99+' : group.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
