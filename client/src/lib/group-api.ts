import { supabase } from './supabase';

export interface GroupChat {
  id: string;
  name: string;
  created_by: string;
  last_message_at: string;
  created_at: string;
  last_message?: { content: string; sender_id: string; sender_name?: string; message_type: string; created_at: string };
  unread_count?: number;
}

export interface GroupMessage {
  id: string;
  group_id: string;
  sender_id: string | null;
  content: string;
  message_type: 'text' | 'system';
  created_at: string;
  sender?: { id: string; first_name: string; last_name: string; handle: string; custom_handle: string | null; profile_image_url: string | null };
}

export async function createGroupChat(name: string, memberIds: string[]): Promise<string | null> {
  const { data, error } = await supabase.rpc('create_group_chat', {
    p_name: name,
    p_member_ids: memberIds,
  });

  if (error) {
    console.error('Error creating group chat:', error);
    return null;
  }
  return data as string;
}

export async function getGroupChats(userId: string): Promise<GroupChat[]> {
  const { data: memberships } = await supabase
    .from('group_members')
    .select('group_id, last_read_at')
    .eq('user_id', userId);

  if (!memberships || memberships.length === 0) return [];

  const groupIds = memberships.map((m) => m.group_id);
  const lastReadMap = new Map(memberships.map((m) => [m.group_id, m.last_read_at]));

  const { data: groups } = await supabase
    .from('group_chats')
    .select('*')
    .in('id', groupIds)
    .order('last_message_at', { ascending: false });

  if (!groups) return [];

  const result: GroupChat[] = [];

  for (const g of groups) {
    const { data: lastMsgArr } = await supabase
      .from('group_messages')
      .select('content, sender_id, message_type, created_at')
      .eq('group_id', g.id)
      .order('created_at', { ascending: false })
      .limit(1);

    const lastMsg = lastMsgArr?.[0] || null;
    let senderName: string | undefined;
    if (lastMsg?.sender_id && lastMsg.message_type === 'text') {
      const { data: s } = await supabase.from('users').select('first_name').eq('id', lastMsg.sender_id).single();
      senderName = s?.first_name || undefined;
    }

    let unreadCount = 0;
    const lr = lastReadMap.get(g.id);
    const q = supabase
      .from('group_messages')
      .select('*', { count: 'exact', head: true })
      .eq('group_id', g.id)
      .eq('message_type', 'text')
      .neq('sender_id', userId);

    const { count } = lr ? await q.gt('created_at', lr) : await q;
    unreadCount = count || 0;

    result.push({
      ...g,
      last_message: lastMsg ? { content: lastMsg.content, sender_id: lastMsg.sender_id, sender_name: senderName, message_type: lastMsg.message_type, created_at: lastMsg.created_at } : undefined,
      unread_count: unreadCount,
    });
  }

  return result;
}

export async function getGroupMessages(groupId: string, limit = 200): Promise<GroupMessage[]> {
  const { data, error } = await supabase
    .from('group_messages')
    .select('*')
    .eq('group_id', groupId)
    .order('created_at', { ascending: true })
    .limit(limit);

  if (error || !data) return [];

  const senderIds = [...new Set(data.filter((m) => m.sender_id).map((m) => m.sender_id!))];
  const senderMap = new Map<string, GroupMessage['sender']>();

  if (senderIds.length > 0) {
    const { data: senders } = await supabase
      .from('users')
      .select('id, first_name, last_name, handle, custom_handle, profile_image_url')
      .in('id', senderIds);
    for (const s of senders || []) senderMap.set(s.id, s);
  }

  return data.map((m) => ({ ...m, sender: m.sender_id ? senderMap.get(m.sender_id) : undefined }));
}

export async function sendGroupMessage(groupId: string, senderId: string, content: string): Promise<GroupMessage | null> {
  const { data: msgId, error } = await supabase.rpc('send_group_message', {
    p_group_id: groupId,
    p_content: content,
  });

  if (error) {
    console.error('Error sending group message:', error.message);
    return null;
  }

  return {
    id: msgId as string,
    group_id: groupId,
    sender_id: senderId,
    content,
    message_type: 'text',
    created_at: new Date().toISOString(),
  };
}

export async function markGroupRead(groupId: string, userId: string): Promise<void> {
  await supabase.from('group_members').update({ last_read_at: new Date().toISOString() }).eq('group_id', groupId).eq('user_id', userId);
}

export async function leaveGroup(groupId: string, userId: string): Promise<boolean> {
  const { error } = await supabase.from('group_members').delete().eq('group_id', groupId).eq('user_id', userId);
  if (error) { console.error('Error leaving group:', error); return false; }
  return true;
}

export async function getGroupUnreadCount(userId: string): Promise<number> {
  const { data: memberships } = await supabase.from('group_members').select('group_id, last_read_at').eq('user_id', userId);
  if (!memberships || memberships.length === 0) return 0;

  let total = 0;
  for (const m of memberships) {
    const q = supabase.from('group_messages').select('*', { count: 'exact', head: true }).eq('group_id', m.group_id).eq('message_type', 'text').neq('sender_id', userId);
    const { count } = m.last_read_at ? await q.gt('created_at', m.last_read_at) : await q;
    total += count || 0;
  }
  return total;
}

export function subscribeToGroupMessages(groupId: string, onNewMessage: (msg: GroupMessage) => void) {
  const channel = supabase
    .channel(`group_messages:${groupId}`)
    .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'group_messages', filter: `group_id=eq.${groupId}` }, (payload) => {
      onNewMessage(payload.new as GroupMessage);
    })
    .subscribe();

  return () => { supabase.removeChannel(channel); };
}
