import { supabase } from './supabase';

export interface Conversation {
  id: string;
  participant_1: string;
  participant_2: string;
  last_message_at: string;
  created_at: string;
  p1_last_read_at?: string | null;
  p2_last_read_at?: string | null;
  other_user?: {
    id: string;
    first_name: string;
    last_name: string;
    handle: string;
    custom_handle: string | null;
    profile_image_url: string | null;
  };
  last_message?: {
    content: string;
    sender_id: string;
    created_at: string;
  };
  unread_count?: number;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  image_url: string | null;
  read_at: string | null;
  created_at: string;
  sender?: {
    id: string;
    first_name: string;
    last_name: string;
    handle: string;
    profile_image_url: string | null;
  };
}

/**
 * Get or create a conversation with another user.
 * Uses a Postgres function to ensure consistent participant ordering.
 */
export async function getOrCreateConversation(currentUserId: string, otherUserId: string): Promise<string | null> {
  // Check if blocked
  const { data: blockCheck } = await supabase
    .from('user_blocks')
    .select('id')
    .or(`and(blocker_id.eq.${currentUserId},blocked_id.eq.${otherUserId}),and(blocker_id.eq.${otherUserId},blocked_id.eq.${currentUserId})`)
    .limit(1);

  if (blockCheck && blockCheck.length > 0) {
    console.error('Cannot message blocked/blocking user');
    return null;
  }

  const { data, error } = await supabase.rpc('get_or_create_conversation', {
    user_a: currentUserId,
    user_b: otherUserId,
  });

  if (error) {
    console.error('Error getting/creating conversation:', error);
    // Fallback: try manual lookup/creation
    return await getOrCreateConversationFallback(currentUserId, otherUserId);
  }

  return data as string;
}

async function getOrCreateConversationFallback(currentUserId: string, otherUserId: string): Promise<string | null> {
  const [p1, p2] = currentUserId < otherUserId
    ? [currentUserId, otherUserId]
    : [otherUserId, currentUserId];

  // Try to find existing
  const { data: existing } = await supabase
    .from('conversations')
    .select('id')
    .eq('participant_1', p1)
    .eq('participant_2', p2)
    .single();

  if (existing) return existing.id;

  // Create new
  const { data: created, error } = await supabase
    .from('conversations')
    .insert({ participant_1: p1, participant_2: p2 })
    .select('id')
    .single();

  if (error) {
    console.error('Error creating conversation:', error);
    return null;
  }

  return created?.id || null;
}

/**
 * Fetch all conversations for the current user, with the other user's info and last message.
 */
export async function getConversations(userId: string): Promise<Conversation[]> {
  const { data: convos, error } = await supabase
    .from('conversations')
    .select('*')
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
    .order('last_message_at', { ascending: false });

  if (error || !convos) {
    console.error('Error fetching conversations:', error);
    return [];
  }

  // Fetch other user info and last message for each conversation
  const enriched = await Promise.all(
    convos.map(async (convo) => {
      const otherUserId = convo.participant_1 === userId ? convo.participant_2 : convo.participant_1;

      // Get other user's profile
      const { data: otherUser } = await supabase
        .from('users')
        .select('id, first_name, last_name, handle, custom_handle, profile_image_url')
        .eq('id', otherUserId)
        .single();

      // Get last message
      const { data: lastMsg } = await supabase
        .from('messages')
        .select('content, sender_id, created_at')
        .eq('conversation_id', convo.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      // Count unread messages using the viewer's per-participant last_read_at.
      // This is independent of the read-receipts privacy toggle, which only
      // controls whether the other user can see a "Read" label on their end.
      const myLastReadAt = convo.participant_1 === userId
        ? convo.p1_last_read_at
        : convo.p2_last_read_at;

      let unreadQuery = supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .eq('conversation_id', convo.id)
        .neq('sender_id', userId);

      if (myLastReadAt) {
        unreadQuery = unreadQuery.gt('created_at', myLastReadAt);
      } else {
        // Fallback for rows that predate the migration.
        unreadQuery = unreadQuery.is('read_at', null);
      }

      const { count: unreadCount } = await unreadQuery;

      return {
        ...convo,
        other_user: otherUser || undefined,
        last_message: lastMsg || undefined,
        unread_count: unreadCount || 0,
      } as Conversation;
    })
  );

  // Filter out conversations with no messages (empty threads)
  return enriched;
}

/**
 * Fetch messages for a conversation with pagination.
 */
export async function getMessages(
  conversationId: string,
  limit = 50,
  before?: string
): Promise<Message[]> {
  let query = supabase
    .from('messages')
    .select('*')
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (before) {
    query = query.lt('created_at', before);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error fetching messages:', error);
    return [];
  }

  return (data || []).reverse();
}

/**
 * Send a message in a conversation.
 */
export async function sendMessage(
  conversationId: string,
  senderId: string,
  content: string,
  imageUrl?: string
): Promise<Message | null> {
  const trimmed = content.trim();
  if (!trimmed && !imageUrl) return null;

  const { data, error } = await supabase
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content: trimmed,
      image_url: imageUrl || null,
    })
    .select('*')
    .single();

  if (error) {
    console.error('Error sending message:', error);
    return null;
  }

  // Update conversation last_message_at
  await supabase
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);

  return data;
}

/**
 * Mark a conversation as caught-up for the current user.
 *
 * This always bumps the viewer's per-participant last_read_at on the
 * conversation row (drives the inbox unread badge), regardless of the
 * read-receipts privacy toggle. If the viewer has opted in to read receipts,
 * it also stamps messages.read_at so the sender sees a "Read" label.
 *
 * Returns true if any state changed (so callers can refresh unread counts).
 */
export async function markConversationRead(conversationId: string, userId: string): Promise<boolean> {
  // Need to know which participant slot the viewer occupies.
  const { data: convo, error: convoError } = await supabase
    .from('conversations')
    .select('participant_1, participant_2')
    .eq('id', conversationId)
    .single();

  if (convoError || !convo) {
    console.error('markConversationRead: could not load conversation', convoError);
    return false;
  }

  const isP1 = convo.participant_1 === userId;
  const isP2 = convo.participant_2 === userId;
  if (!isP1 && !isP2) return false;

  const column = isP1 ? 'p1_last_read_at' : 'p2_last_read_at';
  const now = new Date().toISOString();

  let stateChanged = false;

  // Always update the viewer's local "last read" timestamp so the inbox
  // badge clears even when read receipts are disabled.
  const { error: convUpdateError } = await supabase
    .from('conversations')
    .update({ [column]: now })
    .eq('id', conversationId);

  if (convUpdateError) {
    console.error('Error updating conversation last_read_at:', convUpdateError);
  } else {
    stateChanged = true;
  }

  // Read receipts (letting the sender see "Read") are opt-in.
  const readReceiptsEnabled = localStorage.getItem('chirp_read_receipts');
  if (readReceiptsEnabled === 'false') {
    return stateChanged;
  }

  const { data, error } = await supabase
    .from('messages')
    .update({ read_at: now })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .is('read_at', null)
    .select();

  if (error) {
    console.error('Error marking messages as read:', error);
    return stateChanged;
  }

  return stateChanged || (data?.length ?? 0) > 0;
}

/**
 * Get total unread DM count across all conversations.
 *
 * Uses the viewer's per-participant last_read_at so the badge reflects
 * local read state even when read receipts are disabled.
 */
export async function getTotalUnreadCount(userId: string): Promise<number> {
  const { data: convos } = await supabase
    .from('conversations')
    .select('id, participant_1, participant_2, p1_last_read_at, p2_last_read_at')
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`);

  if (!convos || convos.length === 0) return 0;

  let total = 0;

  for (const convo of convos) {
    const myLastReadAt = convo.participant_1 === userId
      ? convo.p1_last_read_at
      : convo.p2_last_read_at;

    let q = supabase
      .from('messages')
      .select('*', { count: 'exact', head: true })
      .eq('conversation_id', convo.id)
      .neq('sender_id', userId);

    if (myLastReadAt) {
      q = q.gt('created_at', myLastReadAt);
    } else {
      q = q.is('read_at', null);
    }

    const { count, error } = await q;
    if (error) {
      console.error('Error fetching unread count for convo', convo.id, error);
      continue;
    }
    total += count || 0;
  }

  return total;
}

/**
 * Subscribe to new messages and read receipt updates in a conversation.
 */
export function subscribeToMessages(
  conversationId: string,
  onNewMessage: (message: Message) => void,
  onMessageUpdated?: (message: Message) => void
) {
  const channel = supabase
    .channel(`messages:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        onNewMessage(payload.new as Message);
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`,
      },
      (payload) => {
        if (onMessageUpdated) {
          onMessageUpdated(payload.new as Message);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

/**
 * Subscribe to conversation list updates (new messages in any conversation).
 */
export function subscribeToConversationUpdates(
  userId: string,
  onUpdate: () => void
) {
  // Listen on conversations table for last_message_at updates
  const channel = supabase
    .channel(`inbox:${userId}`)
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'conversations',
      },
      (payload) => {
        const convo = payload.new as any;
        if (convo.participant_1 === userId || convo.participant_2 === userId) {
          onUpdate();
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'conversations',
      },
      (payload) => {
        const convo = payload.new as any;
        if (convo.participant_1 === userId || convo.participant_2 === userId) {
          onUpdate();
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
