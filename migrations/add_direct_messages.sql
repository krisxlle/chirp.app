-- Migration: Add Direct Messaging System
-- Date: February 14, 2026
-- Purpose: Create conversations and messages tables for secure 1:1 DMs

-- Conversations table (each row = a DM thread between two users)
CREATE TABLE IF NOT EXISTS conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  participant_1 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  participant_2 UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_conversation UNIQUE (participant_1, participant_2),
  CONSTRAINT no_self_conversation CHECK (participant_1 != participant_2)
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  image_url TEXT,
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversations_participant_1 ON conversations(participant_1);
CREATE INDEX IF NOT EXISTS idx_conversations_participant_2 ON conversations(participant_2);
CREATE INDEX IF NOT EXISTS idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_messages_sender ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_unread ON messages(conversation_id, read_at) WHERE read_at IS NULL;

-- Enable Row Level Security
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- RLS: Users can only see conversations they participate in
CREATE POLICY conversations_select_policy ON conversations
  FOR SELECT USING (
    auth.uid()::text = participant_1::text 
    OR auth.uid()::text = participant_2::text
  );

-- RLS: Users can create conversations they participate in
CREATE POLICY conversations_insert_policy ON conversations
  FOR INSERT WITH CHECK (
    auth.uid()::text = participant_1::text 
    OR auth.uid()::text = participant_2::text
  );

-- RLS: Users can update conversations they participate in (for last_message_at)
CREATE POLICY conversations_update_policy ON conversations
  FOR UPDATE USING (
    auth.uid()::text = participant_1::text 
    OR auth.uid()::text = participant_2::text
  );

-- RLS: Users can only see messages in their conversations
CREATE POLICY messages_select_policy ON messages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (auth.uid()::text = c.participant_1::text OR auth.uid()::text = c.participant_2::text)
    )
  );

-- RLS: Users can only send messages as themselves in their conversations
CREATE POLICY messages_insert_policy ON messages
  FOR INSERT WITH CHECK (
    auth.uid()::text = sender_id::text
    AND EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (auth.uid()::text = c.participant_1::text OR auth.uid()::text = c.participant_2::text)
    )
  );

-- RLS: Users can update messages in their conversations (for read receipts)
CREATE POLICY messages_update_policy ON messages
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM conversations c
      WHERE c.id = messages.conversation_id
      AND (auth.uid()::text = c.participant_1::text OR auth.uid()::text = c.participant_2::text)
    )
  );

-- Function to get or create a conversation between two users
-- Ensures consistent ordering so we don't get duplicate conversations
CREATE OR REPLACE FUNCTION get_or_create_conversation(user_a UUID, user_b UUID)
RETURNS UUID AS $$
DECLARE
  p1 UUID;
  p2 UUID;
  conv_id UUID;
BEGIN
  -- Always store the smaller UUID as participant_1 for consistency
  IF user_a < user_b THEN
    p1 := user_a;
    p2 := user_b;
  ELSE
    p1 := user_b;
    p2 := user_a;
  END IF;

  -- Try to find existing conversation
  SELECT id INTO conv_id FROM conversations
  WHERE participant_1 = p1 AND participant_2 = p2;

  -- Create if not exists
  IF conv_id IS NULL THEN
    INSERT INTO conversations (participant_1, participant_2)
    VALUES (p1, p2)
    RETURNING id INTO conv_id;
  END IF;

  RETURN conv_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable Realtime on messages table for live chat
ALTER PUBLICATION supabase_realtime ADD TABLE messages;

-- Comments
COMMENT ON TABLE conversations IS 'Direct message conversations between two users';
COMMENT ON TABLE messages IS 'Individual messages within a conversation';
COMMENT ON COLUMN conversations.last_message_at IS 'Timestamp of the most recent message, used for inbox sorting';
COMMENT ON COLUMN messages.read_at IS 'When the recipient read this message (null = unread)';
