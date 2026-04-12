-- Migration: Simple Group Chats
-- Date: February 14, 2026

CREATE TABLE IF NOT EXISTS group_chats (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES users(id) ON DELETE SET NULL,
  last_message_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS group_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES group_chats(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  last_read_at TIMESTAMPTZ,
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_group_member UNIQUE (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES group_chats(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES users(id) ON DELETE SET NULL,
  content TEXT NOT NULL,
  message_type TEXT NOT NULL DEFAULT 'text' CHECK (message_type IN ('text', 'system')),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_gm_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_gm_user ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_gmsg_group ON group_messages(group_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_gc_last_msg ON group_chats(last_message_at DESC);

-- RLS
ALTER TABLE group_chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

-- group_chats: members can read
CREATE POLICY gc_select ON group_chats FOR SELECT USING (
  id IN (SELECT gm.group_id FROM group_members gm WHERE gm.user_id::text = auth.uid()::text)
);

-- group_chats: members can update last_message_at
CREATE POLICY gc_update ON group_chats FOR UPDATE USING (
  id IN (SELECT gm.group_id FROM group_members gm WHERE gm.user_id::text = auth.uid()::text)
);

-- group_members: users can see their own memberships
CREATE POLICY gm_select ON group_members FOR SELECT USING (
  user_id::text = auth.uid()::text
);

-- group_members: members can update their own row (last_read_at)
CREATE POLICY gm_update ON group_members FOR UPDATE USING (user_id::text = auth.uid()::text);

-- group_members: members can delete their own row (leave)
CREATE POLICY gm_delete ON group_members FOR DELETE USING (user_id::text = auth.uid()::text);

-- group_messages: members can read messages
CREATE POLICY gmsg_select ON group_messages FOR SELECT USING (
  group_id IN (SELECT gm.group_id FROM group_members gm WHERE gm.user_id::text = auth.uid()::text)
);

-- group_messages: members can insert as themselves
CREATE POLICY gmsg_insert ON group_messages FOR INSERT WITH CHECK (
  sender_id::text = auth.uid()::text
  AND group_id IN (SELECT gm.group_id FROM group_members gm WHERE gm.user_id::text = auth.uid()::text)
);

-- SECURITY DEFINER function: creates group + all members atomically, bypassing RLS
CREATE OR REPLACE FUNCTION create_group_chat(p_name TEXT, p_member_ids UUID[])
RETURNS UUID AS $$
DECLARE
  new_group_id UUID;
  member_id UUID;
BEGIN
  INSERT INTO group_chats (name, created_by)
  VALUES (p_name, auth.uid())
  RETURNING id INTO new_group_id;

  FOREACH member_id IN ARRAY p_member_ids
  LOOP
    INSERT INTO group_members (group_id, user_id) VALUES (new_group_id, member_id);
  END LOOP;

  INSERT INTO group_messages (group_id, sender_id, content, message_type)
  VALUES (new_group_id, auth.uid(), 'created this group', 'system');

  RETURN new_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE group_messages;
