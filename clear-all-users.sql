-- Delete all users from the database
DELETE FROM users;

-- Reset the sequence if there's an auto-incrementing ID
-- (This is optional, but ensures clean slate for new users)
-- ALTER SEQUENCE users_id_seq RESTART WITH 1;
