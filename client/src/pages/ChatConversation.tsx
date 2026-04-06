import { useEffect, useRef, useState } from 'react';
import { useLocation, useRoute } from 'wouter';
import { useSupabaseAuth } from '../components/SupabaseAuthContext';
import UserAvatar from '../components/UserAvatar';
import {
  Message,
  getMessages,
  markConversationRead,
  sendMessage,
  subscribeToMessages,
} from '../lib/dm-api';
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

export default function ChatConversation() {
  const { user } = useSupabaseAuth();
  const [, setLocation] = useLocation();
  const [, params] = useRoute('/messages/:conversationId');
  const conversationId = params?.conversationId || '';

  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [otherUser, setOtherUser] = useState<any>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Load conversation partner info
  useEffect(() => {
    if (!conversationId || !user?.id) return;

    const loadConversation = async () => {
      const { data: convo } = await supabase
        .from('conversations')
        .select('*')
        .eq('id', conversationId)
        .single();

      if (!convo) {
        setLocation('/messages');
        return;
      }

      const otherUserId = convo.participant_1 === user.id ? convo.participant_2 : convo.participant_1;

      const { data: userData } = await supabase
        .from('users')
        .select('id, first_name, last_name, handle, custom_handle, profile_image_url')
        .eq('id', otherUserId)
        .single();

      setOtherUser(userData);
    };

    loadConversation();
  }, [conversationId, user?.id]);

  // Load messages
  useEffect(() => {
    if (!conversationId) return;

    const loadMessages = async () => {
      setIsLoading(true);
      const data = await getMessages(conversationId, 100);
      setMessages(data);
      setIsLoading(false);

      // Mark as read
      if (user?.id) {
        markConversationRead(conversationId, user.id);
      }
    };

    loadMessages();
  }, [conversationId, user?.id]);

  // Real-time message subscription
  useEffect(() => {
    if (!conversationId || !user?.id) return;

    const unsubscribe = subscribeToMessages(
      conversationId,
      // On new message (INSERT)
      (newMsg) => {
        // Skip our own messages -- they're already shown via optimistic update
        if (newMsg.sender_id === user.id) {
          setMessages((prev) => {
            const hasTemp = prev.some((m) => m.id.startsWith('temp_') && m.content === newMsg.content);
            if (hasTemp) {
              return prev.map((m) =>
                m.id.startsWith('temp_') && m.content === newMsg.content ? newMsg : m
              );
            }
            if (prev.some((m) => m.id === newMsg.id)) return prev;
            return prev;
          });
          return;
        }

        // Incoming message from the other person
        setMessages((prev) => {
          if (prev.some((m) => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });

        markConversationRead(conversationId, user.id);
      },
      // On message updated (UPDATE) -- handles read receipts
      (updatedMsg) => {
        setMessages((prev) =>
          prev.map((m) => m.id === updatedMsg.id ? { ...m, read_at: updatedMsg.read_at } : m)
        );
      }
    );

    return unsubscribe;
  }, [conversationId, user?.id]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!newMessage.trim() || isSending || !user?.id) return;

    const content = newMessage.trim();
    setNewMessage('');
    if (inputRef.current) inputRef.current.style.height = 'auto';
    setIsSending(true);

    // Optimistic update
    const optimisticMsg: Message = {
      id: `temp_${Date.now()}`,
      conversation_id: conversationId,
      sender_id: user.id,
      content,
      image_url: null,
      read_at: null,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    const sent = await sendMessage(conversationId, user.id, content);

    if (sent) {
      // Replace optimistic message with real one
      setMessages((prev) =>
        prev.map((m) => (m.id === optimisticMsg.id ? sent : m))
      );
    } else {
      // Remove optimistic message on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setNewMessage(content);
      alert('Failed to send message. Please try again.');
    }

    setIsSending(false);
    inputRef.current?.focus();
  };

  // Group messages by date for date separators
  const groupedMessages: { date: string; messages: Message[] }[] = [];
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

  const displayHandle = otherUser?.custom_handle || otherUser?.handle || '';

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100dvh',
      maxHeight: '100dvh',
      overflow: 'hidden',
      backgroundColor: '#f9fafb',
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 100,
    }}>
      {/* Header */}
      <div style={{
        backgroundColor: 'rgba(255,255,255,0.95)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid #e5e7eb',
        padding: '12px 16px',
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        flexShrink: 0,
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

        {otherUser && (
          <div
            style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', flex: 1 }}
            onClick={() => setLocation(`/profile/${otherUser.id}`)}
          >
            <UserAvatar
              user={{
                id: otherUser.id,
                firstName: otherUser.first_name,
                lastName: otherUser.last_name,
                email: '',
                profileImageUrl: otherUser.profile_image_url || undefined,
              }}
              size={36}
            />
            <div>
              <div style={{ fontSize: '15px', fontWeight: '600', color: '#111827' }}>
                {otherUser.first_name} {otherUser.last_name || ''}
              </div>
              {displayHandle && (
                <div style={{ fontSize: '12px', color: '#9ca3af' }}>
                  @{displayHandle}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Messages */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        overflowX: 'hidden',
        minHeight: 0,
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px',
      }}>
        {isLoading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <div style={{
              width: '28px',
              height: '28px',
              border: '3px solid #e5e7eb',
              borderTopColor: '#7c3aed',
              borderRadius: '50%',
              animation: 'spin 0.8s linear infinite',
            }} />
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        ) : messages.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '60px 20px',
            textAlign: 'center',
          }}>
            {otherUser && (
              <UserAvatar
                user={{
                  id: otherUser.id,
                  firstName: otherUser.first_name,
                  lastName: otherUser.last_name,
                  email: '',
                  profileImageUrl: otherUser.profile_image_url || undefined,
                }}
                size={64}
              />
            )}
            <p style={{ fontSize: '16px', fontWeight: '600', color: '#374151', marginTop: '16px' }}>
              {otherUser?.first_name || 'User'}
            </p>
            <p style={{ fontSize: '13px', color: '#9ca3af', marginTop: '4px' }}>
              Send a message to start the conversation
            </p>
          </div>
        ) : (
          <>
            {groupedMessages.map((group) => (
              <div key={group.date}>
                {/* Date separator */}
                <div style={{
                  textAlign: 'center',
                  padding: '12px 0',
                }}>
                  <span style={{
                    fontSize: '11px',
                    color: '#9ca3af',
                    backgroundColor: '#f3f4f6',
                    padding: '4px 12px',
                    borderRadius: '12px',
                    fontWeight: '500',
                  }}>
                    {formatDateSeparator(group.messages[0].created_at)}
                  </span>
                </div>

                {/* Messages in group */}
                {group.messages.map((msg, idx) => {
                  const isMe = msg.sender_id === user?.id;
                  const showAvatar = !isMe && (
                    idx === 0 ||
                    group.messages[idx - 1]?.sender_id !== msg.sender_id
                  );

                  return (
                    <div
                      key={msg.id}
                      style={{
                        display: 'flex',
                        justifyContent: isMe ? 'flex-end' : 'flex-start',
                        alignItems: 'flex-end',
                        gap: '8px',
                        marginBottom: '4px',
                      }}
                    >
                      {!isMe && (
                        <div style={{ width: '28px', flexShrink: 0 }}>
                          {showAvatar && otherUser && (
                            <UserAvatar
                              user={{
                                id: otherUser.id,
                                firstName: otherUser.first_name,
                                lastName: otherUser.last_name,
                                email: '',
                                profileImageUrl: otherUser.profile_image_url || undefined,
                              }}
                              size={28}
                            />
                          )}
                        </div>
                      )}

                      <div style={{
                        maxWidth: '75%',
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: isMe ? 'flex-end' : 'flex-start',
                      }}>
                        <div style={{
                          padding: '10px 14px',
                          borderRadius: isMe
                            ? '18px 18px 4px 18px'
                            : '18px 18px 18px 4px',
                          backgroundColor: isMe
                            ? '#7c3aed'
                            : '#ffffff',
                          color: isMe ? '#ffffff' : '#111827',
                          fontSize: '14px',
                          lineHeight: '1.5',
                          boxShadow: isMe
                            ? '0 1px 3px rgba(124, 58, 237, 0.3)'
                            : '0 1px 3px rgba(0, 0, 0, 0.06)',
                          wordBreak: 'break-word',
                        }}>
                          {msg.content}
                        </div>
                        <span style={{
                          fontSize: '10px',
                          color: '#9ca3af',
                          marginTop: '2px',
                          paddingLeft: '4px',
                          paddingRight: '4px',
                        }}>
                          {formatMessageTime(msg.created_at)}
                          {isMe && msg.read_at && (
                            <span style={{ marginLeft: '4px', color: '#7c3aed' }}>
                              Read
                            </span>
                          )}
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
        backgroundColor: '#ffffff',
        borderTop: '1px solid #e5e7eb',
        padding: '12px 16px',
        paddingBottom: '28px',
        display: 'flex',
        alignItems: 'flex-end',
        gap: '10px',
        flexShrink: 0,
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
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault();
              handleSend();
            }
          }}
          placeholder="Type a message..."
          rows={1}
          style={{
            flex: 1,
            padding: '12px 16px',
            backgroundColor: '#f3f4f6',
            border: '2px solid transparent',
            borderRadius: '24px',
            fontSize: '14px',
            outline: 'none',
            transition: 'border-color 0.2s',
            resize: 'none',
            lineHeight: '1.4',
            maxHeight: '25dvh',
            overflowY: 'auto',
            fontFamily: 'inherit',
          }}
          onFocus={(e) => e.currentTarget.style.borderColor = '#C671FF'}
          onBlur={(e) => e.currentTarget.style.borderColor = 'transparent'}
          maxLength={2000}
        />
        <button
          onClick={handleSend}
          disabled={!newMessage.trim() || isSending}
          style={{
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            border: 'none',
            background: newMessage.trim()
              ? 'linear-gradient(135deg, #C671FF, #FF61A6)'
              : '#e5e7eb',
            cursor: newMessage.trim() ? 'pointer' : 'default',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            transition: 'all 0.2s',
            boxShadow: newMessage.trim()
              ? '0 2px 8px rgba(198, 113, 255, 0.4)'
              : 'none',
          }}
        >
          <svg width={18} height={18} viewBox="0 0 24 24" fill="none">
            <path
              d="M22 2L11 13"
              stroke={newMessage.trim() ? 'white' : '#9ca3af'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M22 2L15 22L11 13L2 9L22 2Z"
              stroke={newMessage.trim() ? 'white' : '#9ca3af'}
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
