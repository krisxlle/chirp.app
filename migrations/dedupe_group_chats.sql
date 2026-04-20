-- Migration: Remove duplicate group chats and prevent future duplicates
-- Date: April 20, 2026
--
-- Context:
--   While testing the DM feature, the same group chat was created many times
--   because the web inbox wasn't refreshing and the create_group_chat RPC
--   had no idempotency check. This migration:
--     1. Deletes duplicate group_chats rows (same creator + name + exact member set),
--        keeping the copy with the most text messages (oldest on tie).
--     2. Replaces create_group_chat with an idempotent version that returns
--        the existing group's id when an identical group already exists.
--
-- Run this in the Supabase SQL Editor.

BEGIN;

-- 1. Delete duplicate group chats --------------------------------------------
-- Two groups are considered duplicates if they have:
--   * the same name
--   * the same creator (created_by)
--   * the exact same set of member user_ids
-- The copy with the most text messages is kept; ties are broken by earliest
-- created_at so we preserve the original. Cascades clean up group_members and
-- group_messages automatically.

WITH group_signatures AS (
  SELECT
    gc.id,
    gc.name,
    gc.created_by,
    gc.created_at,
    (
      SELECT array_agg(gm.user_id ORDER BY gm.user_id)
      FROM group_members gm
      WHERE gm.group_id = gc.id
    ) AS member_ids,
    (
      SELECT COUNT(*)
      FROM group_messages gmsg
      WHERE gmsg.group_id = gc.id
        AND gmsg.message_type = 'text'
    ) AS text_msg_count
  FROM group_chats gc
),
ranked AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY created_by, name, member_ids
      ORDER BY text_msg_count DESC, created_at ASC, id ASC
    ) AS rn
  FROM group_signatures
)
DELETE FROM group_chats
WHERE id IN (SELECT id FROM ranked WHERE rn > 1);

-- 2. Make create_group_chat idempotent ---------------------------------------
-- If the caller already created an identical group (same name + same exact
-- member set), return that group's id instead of creating another copy.

CREATE OR REPLACE FUNCTION create_group_chat(p_name TEXT, p_member_ids UUID[])
RETURNS UUID AS $$
DECLARE
  new_group_id UUID;
  existing_id  UUID;
  member_id    UUID;
  sorted_ids   UUID[];
BEGIN
  -- Deduplicate + sort incoming member ids so comparison is order-insensitive.
  SELECT array_agg(DISTINCT x ORDER BY x)
  INTO sorted_ids
  FROM unnest(p_member_ids) AS x;

  IF sorted_ids IS NULL OR array_length(sorted_ids, 1) = 0 THEN
    RAISE EXCEPTION 'create_group_chat requires at least one member';
  END IF;

  -- Look for an existing group owned by this caller with the same name and
  -- the same exact membership set.
  SELECT gc.id
  INTO existing_id
  FROM group_chats gc
  WHERE gc.created_by = auth.uid()
    AND gc.name = p_name
    AND (
      SELECT array_agg(gm.user_id ORDER BY gm.user_id)
      FROM group_members gm
      WHERE gm.group_id = gc.id
    ) = sorted_ids
  LIMIT 1;

  IF existing_id IS NOT NULL THEN
    RETURN existing_id;
  END IF;

  INSERT INTO group_chats (name, created_by)
  VALUES (p_name, auth.uid())
  RETURNING id INTO new_group_id;

  FOREACH member_id IN ARRAY sorted_ids
  LOOP
    INSERT INTO group_members (group_id, user_id)
    VALUES (new_group_id, member_id)
    ON CONFLICT (group_id, user_id) DO NOTHING;
  END LOOP;

  INSERT INTO group_messages (group_id, sender_id, content, message_type)
  VALUES (new_group_id, auth.uid(), 'created this group', 'system');

  RETURN new_group_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMIT;
