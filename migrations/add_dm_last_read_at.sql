-- Migration: Per-participant last-read timestamps for DM conversations
-- Date: April 20, 2026
--
-- Context:
--   The inbox unread badge for DMs previously derived from messages.read_at,
--   which also serves as the "Read" receipt shown to the sender. When a user
--   disables read receipts, read_at is never set, so their own inbox keeps
--   showing threads as unread even after they've opened them.
--
--   Group chats solve this with a per-member group_members.last_read_at
--   column that is always updated on view. This migration adds the same
--   concept to conversations via two columns (since conversations are 1:1):
--     - p1_last_read_at: when participant_1 last caught up
--     - p2_last_read_at: when participant_2 last caught up
--
--   These columns are driven by the viewer independent of the read-receipts
--   privacy preference, so the inbox badge always clears on view.
--
-- Run this in the Supabase SQL Editor.

BEGIN;

ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS p1_last_read_at TIMESTAMPTZ,
  ADD COLUMN IF NOT EXISTS p2_last_read_at TIMESTAMPTZ;

-- Backfill existing rows so users don't see a surge of "unread" threads for
-- conversations they've already read. Treat everything currently in the
-- inbox as caught-up at migration time.
UPDATE conversations
SET
  p1_last_read_at = COALESCE(p1_last_read_at, last_message_at, NOW()),
  p2_last_read_at = COALESCE(p2_last_read_at, last_message_at, NOW());

COMMENT ON COLUMN conversations.p1_last_read_at IS
  'When participant_1 last opened this conversation (drives inbox unread count; independent of read-receipt preference).';
COMMENT ON COLUMN conversations.p2_last_read_at IS
  'When participant_2 last opened this conversation (drives inbox unread count; independent of read-receipt preference).';

COMMIT;
