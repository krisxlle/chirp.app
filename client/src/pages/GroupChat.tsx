import { useQueryClient } from '@tanstack/react-query';
import { useEffect, useRef, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useSupabaseAuth } from '../components/SupabaseAuthContext';
import UserAvatar from '../components/UserAvatar';
import {
    GroupMessage,
    getGroupMessages,
    leaveGroup,
    markGroupRead,
    renameGroupChat,
    sendGroupMessage,
    subscribeToGroupMessages,
    subscribeToGroupMetaUpdates,
    updateGroupChatAvatar,
} from '../lib/group-api';
import { GroupIcon } from '../components/icons';
import { supabase } from '../lib/supabase';

function formatMessageTime(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
}

function formatDateSeparator(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const isToday = date.toDateString() === now.toDateString();
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  const isYesterday = date.toDateString() === yesterday.toDateString();

  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  const sameYear = date.getFullYear() === now.getFullYear();
  if (sameYear) return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric' });
  return date.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

export default function GroupChat() {
  const { user } = useSupabaseAuth();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/group/:groupId');
  const groupId = params?.groupId || '';

  const [messages, setMessages] = useState<GroupMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [groupName, setGroupName] = useState('');
  const [groupAvatarUrl, setGroupAvatarUrl] = useState<string | null>(null);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [showRename, setShowRename] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);
  const [renameError, setRenameError] = useState<string | null>(null);
  const avatarInputRef = useRef<HTMLInputElement>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesScrollRef = useRef<HTMLDivElement>(null);
  const stickToBottomRef = useRef(true);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    messagesEndRef.current?.scrollIntoView({ behavior });
  };

  const isNearBottom = () => {
    const el = messagesScrollRef.current;
    if (!el) return true;
    return el.scrollHeight - el.scrollTop - el.clientHeight < 120;
  };

  const onMessagesScroll = () => {
    stickToBottomRef.current = isNearBottom();
  };

  useEffect(() => {
    stickToBottomRef.current = true;
  }, [groupId]);

  useEffect(() => {
    if (!groupId) return;
    (async () => {
      const { data } = await supabase.from('group_chats').select('name, avatar_url').eq('id', groupId).single();
      if (data) {
        setGroupName(data.name);
        setGroupAvatarUrl((data as any).avatar_url ?? null);
      }
    })();
  }, [groupId]);

  useEffect(() => {
    if (!groupId || !user?.id) return;
    (async () => {
      setIsLoading(true);
      const data = await getGroupMessages(groupId);
      setMessages(data);
      setIsLoading(false);
      await markGroupRead(groupId, user.id);
      await Promise.all([
        queryClient.refetchQueries({ queryKey: ['dm-unread-count'] }),
        queryClient.refetchQueries({ queryKey: ['group-unread-count'] }),
      ]);
    })();
  }, [groupId, user?.id]);

  useEffect(() => {
    if (!groupId || !user?.id) return;

    const senderCache = new Map<string, GroupMessage['sender']>();
    messages.forEach((m) => { if (m.sender && m.sender_id) senderCache.set(m.sender_id, m.sender); });

    const unsubscribe = subscribeToGroupMessages(groupId, async (newMsg) => {
      if (newMsg.sender_id === user.id) {
        setMessages((prev) => {
          const hasTemp = prev.some((m) => m.id.startsWith('temp_') && m.content === newMsg.content);
          if (hasTemp) return prev.map((m) => m.id.startsWith('temp_') && m.content === newMsg.content ? { ...newMsg, sender: senderCache.get(newMsg.sender_id!) } : m);
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return prev;
        });
        return;
      }

      let sender = senderCache.get(newMsg.sender_id!);
      if (!sender && newMsg.sender_id) {
        const { data } = await supabase.from('users').select('id, first_name, last_name, handle, custom_handle, profile_image_url').eq('id', newMsg.sender_id).single();
        if (data) { sender = data; senderCache.set(data.id, data); }
      }

      setMessages((prev) => {
        if (prev.some((m) => m.id === newMsg.id)) return prev;
        return [...prev, { ...newMsg, sender }];
      });

      await markGroupRead(groupId, user.id);
      queryClient.refetchQueries({ queryKey: ['dm-unread-count'] });
      queryClient.refetchQueries({ queryKey: ['group-unread-count'] });
    });

    return unsubscribe;
  }, [groupId, user?.id]);

  useEffect(() => {
    if (!groupId) return;
    const unsubscribe = subscribeToGroupMetaUpdates(groupId, (group) => {
      if (group?.name) setGroupName(group.name);
      if ('avatar_url' in (group || {})) setGroupAvatarUrl(group.avatar_url ?? null);
    });
    return unsubscribe;
  }, [groupId]);

  useEffect(() => {
    if (isLoading) return;
    if (stickToBottomRef.current) {
      requestAnimationFrame(() => scrollToBottom('smooth'));
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending || !user?.id) return;
    const content = newMessage.trim();
    setNewMessage('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setIsSending(true);

    const optimistic: GroupMessage = {
      id: `temp_${Date.now()}`,
      group_id: groupId,
      sender_id: user.id,
      content,
      message_type: 'text',
      created_at: new Date().toISOString(),
      sender: { id: user.id, first_name: (user as any).user_metadata?.first_name || user.email?.split('@')[0] || '', last_name: '', handle: '', custom_handle: null, profile_image_url: null },
    };
    setMessages((prev) => [...prev, optimistic]);
    stickToBottomRef.current = true;
    requestAnimationFrame(() => scrollToBottom('auto'));

    const sent = await sendGroupMessage(groupId, user.id, content);
    if (sent) {
      setMessages((prev) => prev.map((m) => m.id === optimistic.id ? { ...sent, sender: optimistic.sender } : m));
    } else {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
      setNewMessage(content);
      alert('Failed to send message. Please try again.');
    }

    setIsSending(false);
    inputRef.current?.focus();
  };

  const handleLeave = async () => {
    if (!user?.id) return;
    const ok = await leaveGroup(groupId, user.id);
    if (ok) setLocation('/messages');
    else alert('Failed to leave group');
  };

  const openAvatarPicker = () => {
    if (isUploadingAvatar) return;
    avatarInputRef.current?.click();
  };

  const handleAvatarFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file || !user?.id) return;

    setIsUploadingAvatar(true);
    const result = await updateGroupChatAvatar(groupId, file);
    setIsUploadingAvatar(false);

    if (result.ok) {
      setGroupAvatarUrl(result.avatarUrl ?? null);
    } else {
      alert(result.error || 'Failed to update group photo');
    }
  };

  const handleRemoveAvatar = async () => {
    if (isUploadingAvatar || !groupAvatarUrl) return;
    setIsUploadingAvatar(true);
    const result = await updateGroupChatAvatar(groupId, null);
    setIsUploadingAvatar(false);

    if (result.ok) {
      setGroupAvatarUrl(null);
    } else {
      alert(result.error || 'Failed to remove group photo');
    }
  };

  const openEdit = () => {
    setRenameValue(groupName);
    setRenameError(null);
    setShowRename(true);
  };

  const handleRename = async () => {
    if (isRenaming) return;
    const trimmed = renameValue.trim();
    if (!trimmed) { setRenameError('Group name cannot be empty'); return; }
    if (trimmed === groupName) { setShowRename(false); return; }

    setIsRenaming(true);
    setRenameError(null);
    const result = await renameGroupChat(groupId, trimmed);
    setIsRenaming(false);

    if (result.ok) {
      setGroupName(trimmed);
      setShowRename(false);
    } else {
      setRenameError(result.error || 'Failed to rename group');
    }
  };

  const groupedMessages: { date: string; messages: GroupMessage[] }[] = [];
  let currentDate = '';
  messages.forEach((msg) => {
    const msgDate = new Date(msg.created_at).toLocaleDateString();
    if (msgDate !== currentDate) {
      currentDate = msgDate;
      groupedMessages.push({ date: msgDate, messages: [msg] });
    } else {
      groupedMessages[groupedMessages.length - 1].messages.push(msg);
    }
  });

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100dvh', maxHeight: '100dvh',
      overflow: 'hidden', backgroundColor: '#f9fafb', position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0, zIndex: 100,
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.95)', backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e5e7eb', padding: '12px 16px',
        display: 'flex', alignItems: 'center', gap: '12px', flexShrink: 0,
      }}>
        <button onClick={() => setLocation('/messages')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px', display: 'flex' }}>
          <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="#111827" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5" /><polyline points="12 19 5 12 12 5" />
          </svg>
        </button>

        <input
          ref={avatarInputRef}
          type="file"
          accept="image/*"
          style={{ display: 'none' }}
          onChange={handleAvatarFileChange}
        />

        <div
          aria-label="Group avatar"
          style={{
            width: '36px', height: '36px', borderRadius: '50%',
            background: 'linear-gradient(135deg, #C671FF20, #FF61A620)',
            overflow: 'hidden', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
        >
          {groupAvatarUrl ? (
            <img
              src={groupAvatarUrl}
              alt={groupName || 'Group avatar'}
              style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            />
          ) : (
            <GroupIcon size={20} color="#7c3aed" />
          )}
        </div>

        <div style={{ flex: 1, minWidth: 0, padding: '2px 4px' }}>
          <div style={{
            fontSize: '15px', fontWeight: '600', color: '#111827',
            overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
          }}>
            {groupName || 'Group Chat'}
          </div>
        </div>

        <button
          onClick={openEdit}
          title="Edit group"
          style={{
            background: 'none', border: '1px solid #e5e7eb', borderRadius: '8px',
            padding: '6px 8px', cursor: 'pointer', flexShrink: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = '#f9fafb')}
          onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
        >
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
          </svg>
        </button>

        <button onClick={() => setShowLeaveConfirm(true)} style={{
          background: 'none', border: '1px solid #fca5a5', borderRadius: '8px', padding: '6px 12px',
          fontSize: '12px', color: '#ef4444', cursor: 'pointer', fontWeight: '500', flexShrink: 0,
        }}>
          Leave
        </button>
      </div>

      {/* Rename group overlay */}
      {showRename && (
        <div style={{
          position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '16px', padding: '24px', maxWidth: '360px', width: '100%',
            boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '12px' }}>Edit Group</div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
              <button
                type="button"
                onClick={openAvatarPicker}
                disabled={isUploadingAvatar}
                style={{
                  position: 'relative',
                  width: '56px', height: '56px', borderRadius: '50%',
                  background: 'linear-gradient(135deg, #C671FF20, #FF61A620)',
                  border: 'none', padding: 0, cursor: isUploadingAvatar ? 'default' : 'pointer',
                  overflow: 'hidden', flexShrink: 0,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}
              >
                {groupAvatarUrl ? (
                  <img src={groupAvatarUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                ) : (
                  <GroupIcon size={28} color="#7c3aed" />
                )}
                {isUploadingAvatar && (
                  <div style={{
                    position: 'absolute', inset: 0, backgroundColor: 'rgba(255,255,255,0.7)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <div style={{
                      width: '18px', height: '18px', border: '2px solid #e5e7eb',
                      borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite',
                    }} />
                  </div>
                )}
              </button>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <button
                  type="button"
                  onClick={openAvatarPicker}
                  disabled={isUploadingAvatar}
                  style={{
                    background: 'none', border: 'none', padding: 0, textAlign: 'left',
                    fontSize: '13px', fontWeight: '600', color: '#7c3aed',
                    cursor: isUploadingAvatar ? 'default' : 'pointer',
                  }}
                >{groupAvatarUrl ? 'Change photo' : 'Add photo'}</button>
                {groupAvatarUrl && (
                  <button
                    type="button"
                    onClick={handleRemoveAvatar}
                    disabled={isUploadingAvatar}
                    style={{
                      background: 'none', border: 'none', padding: 0, textAlign: 'left',
                      fontSize: '12px', color: '#ef4444',
                      cursor: isUploadingAvatar ? 'default' : 'pointer',
                    }}
                  >Remove photo</button>
                )}
              </div>
            </div>

            <input
              type="text"
              value={renameValue}
              onChange={(e) => { setRenameValue(e.target.value); if (renameError) setRenameError(null); }}
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleRename(); } }}
              placeholder="Enter a name..."
              maxLength={50}
              autoFocus
              style={{
                width: '100%', padding: '12px 14px', backgroundColor: '#f9fafb',
                border: `2px solid ${renameError ? '#ef4444' : '#e5e7eb'}`, borderRadius: '12px',
                fontSize: '15px', outline: 'none', boxSizing: 'border-box', marginBottom: '6px',
              }}
              onFocus={(e) => { if (!renameError) e.currentTarget.style.borderColor = '#C671FF'; }}
              onBlur={(e) => { if (!renameError) e.currentTarget.style.borderColor = '#e5e7eb'; }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '12px', marginBottom: '18px', minHeight: '16px' }}>
              <span style={{ color: '#ef4444' }}>{renameError || ''}</span>
              <span style={{ color: '#9ca3af' }}>{renameValue.length}/50</span>
            </div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={() => setShowRename(false)}
                disabled={isRenaming}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #e5e7eb',
                  backgroundColor: '#fff', fontSize: '14px', fontWeight: '500',
                  cursor: isRenaming ? 'default' : 'pointer', color: '#374151',
                }}
              >Cancel</button>
              <button
                onClick={handleRename}
                disabled={isRenaming || !renameValue.trim()}
                style={{
                  flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                  background: (isRenaming || !renameValue.trim())
                    ? '#e5e7eb'
                    : 'linear-gradient(135deg, #C671FF, #FF61A6)',
                  color: (isRenaming || !renameValue.trim()) ? '#9ca3af' : '#fff',
                  fontSize: '14px', fontWeight: '500',
                  cursor: (isRenaming || !renameValue.trim()) ? 'default' : 'pointer',
                }}
              >{isRenaming ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Leave confirmation overlay */}
      {showLeaveConfirm && (
        <div style={{
          position: 'absolute', inset: 0, backgroundColor: 'rgba(0,0,0,0.4)', zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px',
        }}>
          <div style={{
            backgroundColor: '#fff', borderRadius: '16px', padding: '24px', maxWidth: '320px', width: '100%',
            textAlign: 'center', boxShadow: '0 10px 40px rgba(0,0,0,0.15)',
          }}>
            <div style={{ fontSize: '16px', fontWeight: '600', color: '#111827', marginBottom: '8px' }}>Leave Group?</div>
            <div style={{ fontSize: '14px', color: '#6b7280', marginBottom: '20px' }}>You won't be able to see messages in this group anymore.</div>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button onClick={() => setShowLeaveConfirm(false)} style={{
                flex: 1, padding: '10px', borderRadius: '10px', border: '1px solid #e5e7eb',
                backgroundColor: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer', color: '#374151',
              }}>Cancel</button>
              <button onClick={handleLeave} style={{
                flex: 1, padding: '10px', borderRadius: '10px', border: 'none',
                backgroundColor: '#ef4444', color: '#fff', fontSize: '14px', fontWeight: '500', cursor: 'pointer',
              }}>Leave</button>
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div
        ref={messagesScrollRef}
        onScroll={onMessagesScroll}
        style={{
        flex: 1, overflowY: 'auto', overflowX: 'hidden', minHeight: 0,
        padding: '16px', display: 'flex', flexDirection: 'column', gap: '4px',
        WebkitOverflowScrolling: 'touch',
      }}
      >
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div style={{
              width: '28px', height: '28px', border: '3px solid #e5e7eb',
              borderTopColor: '#7c3aed', borderRadius: '50%', animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : messages.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '60px 20px', textAlign: 'center' }}>
            <div style={{
              width: '64px', height: '64px', borderRadius: '50%',
              background: 'linear-gradient(135deg, #C671FF20, #FF61A620)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
            }}>
              <svg width={32} height={32} viewBox="0 0 24 24" fill="none" stroke="#C671FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M23 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginTop: '16px' }}>{groupName}</p>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>Send a message to start the conversation</p>
          </div>
        ) : (
          <>
            {groupedMessages.map((group) => (
              <div key={group.date}>
                <div style={{ textAlign: 'center', padding: '12px 0' }}>
                  <span style={{ fontSize: '11px', color: '#9ca3af', backgroundColor: '#f3f4f6', padding: '4px 12px', borderRadius: '12px', fontWeight: '500' }}>
                    {formatDateSeparator(group.messages[0].created_at)}
                  </span>
                </div>
                {group.messages.map((msg, idx) => {
                  if (msg.message_type === 'system') {
                    return (
                      <div key={msg.id} style={{ textAlign: 'center', padding: '8px 0' }}>
                        <span style={{ fontSize: '12px', color: '#9ca3af', fontStyle: 'italic' }}>
                          {msg.sender?.first_name || 'Someone'} {msg.content}
                        </span>
                      </div>
                    );
                  }

                  const isMe = msg.sender_id === user?.id;
                  const showSenderName = !isMe && (idx === 0 || group.messages[idx - 1]?.sender_id !== msg.sender_id || group.messages[idx - 1]?.message_type === 'system');
                  const showAvatar = !isMe && (idx === group.messages.length - 1 || group.messages[idx + 1]?.sender_id !== msg.sender_id || group.messages[idx + 1]?.message_type === 'system');

                  return (
                    <div key={msg.id} style={{ display: 'flex', justifyContent: isMe ? 'flex-end' : 'flex-start', alignItems: 'flex-end', gap: '8px', marginBottom: '2px' }}>
                      {!isMe && (
                        <div style={{ width: '28px', flexShrink: 0 }}>
                          {showAvatar && msg.sender && (
                            <UserAvatar user={{ id: msg.sender.id, firstName: msg.sender.first_name, lastName: msg.sender.last_name, email: '', profileImageUrl: msg.sender.profile_image_url || undefined }} size={28} />
                          )}
                        </div>
                      )}
                      <div style={{ maxWidth: '75%', display: 'flex', flexDirection: 'column', alignItems: isMe ? 'flex-end' : 'flex-start' }}>
                        {showSenderName && msg.sender && (
                          <span style={{ fontSize: '11px', fontWeight: '600', color: '#6b7280', marginBottom: '2px', paddingLeft: '4px' }}>
                            {msg.sender.first_name}
                          </span>
                        )}
                        <div style={{
                          padding: '10px 14px', borderRadius: isMe ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                          backgroundColor: isMe ? '#7c3aed' : '#ffffff', color: isMe ? '#ffffff' : '#111827',
                          fontSize: '14px', lineHeight: '1.5',
                          boxShadow: isMe ? '0 1px 3px rgba(124, 58, 237, 0.3)' : '0 1px 3px rgba(0, 0, 0, 0.06)',
                          wordBreak: 'break-word',
                        }}>
                          {msg.content}
                        </div>
                        <span style={{ fontSize: '10px', color: '#9ca3af', marginTop: '2px', paddingLeft: '4px', paddingRight: '4px' }}>
                          {formatMessageTime(msg.created_at)}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input area */}
      <div style={{
        backgroundColor: '#ffffff', borderTop: '1px solid #e5e7eb',
        padding: '12px 16px', paddingBottom: '28px',
        display: 'flex', alignItems: 'flex-end', gap: '10px', flexShrink: 0,
      }}>
        <textarea
          ref={inputRef}
          value={newMessage}
          onChange={(e) => {
            setNewMessage(e.target.value);
            e.target.style.height = 'auto';
            const maxH = Math.round(window.innerHeight * 0.25);
            e.target.style.height = Math.min(e.target.scrollHeight, maxH) + 'px';
          }}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
          placeholder="Type a message..."
          rows={1}
          style={{
            flex: 1, padding: '12px 16px', backgroundColor: '#f3f4f6',
            border: '2px solid transparent', borderRadius: '24px', fontSize: '14px',
            outline: 'none', transition: 'border-color 0.2s', resize: 'none',
            lineHeight: '1.4', maxHeight: '25dvh', overflowY: 'auto', fontFamily: 'inherit',
          }}
          onFocus={(e) => (e.currentTarget.style.borderColor = '#C671FF')}
          onBlur={(e) => (e.currentTarget.style.borderColor = 'transparent')}
          maxLength={2000}
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || isSending}
          style={{
            width: '42px', height: '42px', borderRadius: '50%', border: 'none',
            background: newMessage.trim() ? 'linear-gradient(135deg, #C671FF, #FF61A6)' : '#e5e7eb',
            cursor: newMessage.trim() ? 'pointer' : 'default',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            transition: 'all 0.2s',
            boxShadow: newMessage.trim() ? '0 2px 8px rgba(198, 113, 255, 0.4)' : 'none',
          }}
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <path d="M22 2L11 13" stroke={newMessage.trim() ? 'white' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke={newMessage.trim() ? 'white' : '#9ca3af'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>
      </div>
    </div>
  );
}
