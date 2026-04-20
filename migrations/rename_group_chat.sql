-- Migration: Allow members to rename a group chat
-- Date: April 20, 2026
--
-- Adds a SECURITY DEFINER RPC `rename_group_chat` that:
--   * Verifies the caller is a member of the group.
--   * Validates the new name (1-50 chars after trimming).
--   * Updates group_chats.name and appends a system message to the thread,
--     atomically in a single transaction.
--
-- Also enables Supabase realtime on group_chats so other members see the
-- new name live without needing to refresh.
--
-- Run this in the Supabase SQL Editor.

BEGIN;

CREATE OR REPLACE FUNCTION rename_group_chat(p_group_id UUID, p_name TEXT)
RETURNS VOID AS $$
DECLARE
  trimmed_name TEXT := btrim(p_name);
  old_name     TEXT;
  is_member    BOOLEAN;
BEGIN
  IF trimmed_name IS NULL OR length(trimmed_name) = 0 THEN
    RAISE EXCEPTION 'Group name cannot be empty';
  END IF;

  IF length(trimmed_name) > 50 THEN
    RAISE EXCEPTION 'Group name cannot exceed 50 characters';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = p_group_id
      AND user_id = auth.uid()
  )
  INTO is_member;

  IF NOT is_member THEN
    RAISE EXCEPTION 'You must be a member of this group to rename it';
  END IF;

  SELECT name INTO old_name FROM group_chats WHERE id = p_group_id;

  IF old_name IS NULL THEN
    RAISE EXCEPTION 'Group chat not found';
  END IF;

  -- No-op if the name hasn't actually changed.
  IF old_name = trimmed_name THEN
    RETURN;
  END IF;

  UPDATE group_chats
  SET name = trimmed_name
  WHERE id = p_group_id;

  INSERT INTO group_messages (group_id, sender_id, content, message_type)
  VALUES (
    p_group_id,
    auth.uid(),
    'renamed this group to "' || trimmed_name || '"',
    'system'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Enable realtime on group_chats so members see name changes live.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_publication_tables
    WHERE pubname = 'supabase_realtime'
      AND tablename = 'group_chats'
  ) THEN
    ALTER PUBLICATION supabase_realtime ADD TABLE group_chats;
  END IF;
END $$;

COMMIT;
