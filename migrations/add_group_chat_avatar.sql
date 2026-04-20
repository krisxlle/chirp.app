-- Migration: Group chat avatar / profile picture
-- Date: April 20, 2026
--
-- Adds an avatar_url column to group_chats, a SECURITY DEFINER RPC
-- `update_group_chat_avatar` that lets any member of a group change its
-- avatar (and posts a system message), and a dedicated `group-avatars`
-- Storage bucket with RLS policies restricting writes to group members.
--
-- The existing `avatars` bucket is not reused because its RLS is hardcoded
-- for profile pictures named like `profile-{uuid}.jpg` and would reject
-- group paths.
--
-- Run this in the Supabase SQL Editor.

BEGIN;

ALTER TABLE group_chats
  ADD COLUMN IF NOT EXISTS avatar_url TEXT;

COMMENT ON COLUMN group_chats.avatar_url IS
  'Public URL of the group chat''s avatar image (null = use the default group icon).';

CREATE OR REPLACE FUNCTION update_group_chat_avatar(p_group_id UUID, p_avatar_url TEXT)
RETURNS VOID AS $$
DECLARE
  trimmed_url TEXT := NULLIF(btrim(p_avatar_url), '');
  old_url     TEXT;
  is_member   BOOLEAN;
  system_msg  TEXT;
BEGIN
  IF trimmed_url IS NOT NULL AND length(trimmed_url) > 2048 THEN
    RAISE EXCEPTION 'Avatar URL is too long';
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM group_members
    WHERE group_id = p_group_id
      AND user_id = auth.uid()
  )
  INTO is_member;

  IF NOT is_member THEN
    RAISE EXCEPTION 'You must be a member of this group to change its photo';
  END IF;

  SELECT avatar_url INTO old_url FROM group_chats WHERE id = p_group_id;

  -- No-op if it didn't actually change.
  IF old_url IS NOT DISTINCT FROM trimmed_url THEN
    RETURN;
  END IF;

  UPDATE group_chats
  SET avatar_url = trimmed_url
  WHERE id = p_group_id;

  IF trimmed_url IS NULL THEN
    system_msg := 'removed the group photo';
  ELSIF old_url IS NULL THEN
    system_msg := 'set the group photo';
  ELSE
    system_msg := 'updated the group photo';
  END IF;

  INSERT INTO group_messages (group_id, sender_id, content, message_type)
  VALUES (p_group_id, auth.uid(), system_msg, 'system');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Dedicated Storage bucket for group avatars. Public read, image uploads up
-- to 5MB. Writes are gated by the policies below so only current group
-- members can upload/replace/delete an avatar for their group.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'group-avatars',
  'group-avatars',
  true,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO UPDATE SET
  public = EXCLUDED.public,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- Drop any stale versions of these policies so this migration is idempotent.
DROP POLICY IF EXISTS "Group avatars are publicly readable"        ON storage.objects;
DROP POLICY IF EXISTS "Group members can upload group avatars"     ON storage.objects;
DROP POLICY IF EXISTS "Group members can update group avatars"     ON storage.objects;
DROP POLICY IF EXISTS "Group members can delete group avatars"     ON storage.objects;

-- Anyone (including unauthenticated) can read – the bucket is public.
CREATE POLICY "Group avatars are publicly readable"
ON storage.objects FOR SELECT
USING (bucket_id = 'group-avatars');

-- For every write policy the first path segment of the object name MUST be
-- the group's UUID, and the caller MUST be a member of that group. The
-- client uploads to `{groupId}/{timestamp}.{ext}` so `(storage.foldername(name))[1]`
-- yields the group id.
CREATE POLICY "Group members can upload group avatars"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'group-avatars'
  AND EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id::text = (storage.foldername(name))[1]
      AND gm.user_id = auth.uid()
  )
);

CREATE POLICY "Group members can update group avatars"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'group-avatars'
  AND EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id::text = (storage.foldername(name))[1]
      AND gm.user_id = auth.uid()
  )
);

CREATE POLICY "Group members can delete group avatars"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'group-avatars'
  AND EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id::text = (storage.foldername(name))[1]
      AND gm.user_id = auth.uid()
  )
);

COMMIT;
