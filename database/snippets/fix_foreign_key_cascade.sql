-- Fix foreign key cascade for auth.users
-- This script lists all foreign keys pointing to auth.users(id) and updates them to CASCADE

-- Step 1: List all foreign keys pointing to auth.users(id)
SELECT
    conrelid::regclass AS referencing_table,
    a.attname AS referencing_column,
    confrelid::regclass AS referenced_table,
    af.attname AS referenced_column,
    c.conname AS constraint_name,
    CASE c.confdeltype
        WHEN 'a' THEN 'NO ACTION'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'c' THEN 'CASCADE'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'd' THEN 'SET DEFAULT'
    END AS on_delete
FROM pg_constraint c
JOIN pg_attribute a
    ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
JOIN pg_attribute af
    ON af.attrelid = c.confrelid AND af.attnum = ANY (c.confkey)
WHERE c.contype = 'f'
    AND c.confrelid = 'auth.users'::regclass
    AND af.attname = 'id'
ORDER BY referencing_table, referencing_column;

-- Step 2: Update foreign key constraints to CASCADE
-- Note: We'll need to drop and recreate each constraint

-- Get the constraint names and update them
DO $$
DECLARE
    constraint_record RECORD;
    alter_sql TEXT;
BEGIN
    -- Loop through all foreign key constraints pointing to auth.users(id)
    FOR constraint_record IN
        SELECT
            c.conname AS constraint_name,
            conrelid::regclass AS referencing_table,
            a.attname AS referencing_column,
            confrelid::regclass AS referenced_table,
            af.attname AS referenced_column
        FROM pg_constraint c
        JOIN pg_attribute a
            ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
        JOIN pg_attribute af
            ON af.attrelid = c.confrelid AND af.attnum = ANY (c.confkey)
        WHERE c.contype = 'f'
            AND c.confrelid = 'auth.users'::regclass
            AND af.attname = 'id'
            AND c.confdeltype != 'c'  -- Only update non-CASCADE constraints
    LOOP
        -- Drop the existing constraint
        alter_sql := 'ALTER TABLE ' || constraint_record.referencing_table || 
                     ' DROP CONSTRAINT ' || constraint_record.constraint_name;
        EXECUTE alter_sql;
        
        RAISE NOTICE 'Dropped constraint: %', constraint_record.constraint_name;
        
        -- Recreate with CASCADE
        alter_sql := 'ALTER TABLE ' || constraint_record.referencing_table || 
                     ' ADD CONSTRAINT ' || constraint_record.constraint_name || 
                     ' FOREIGN KEY (' || constraint_record.referencing_column || 
                     ') REFERENCES ' || constraint_record.referenced_table || 
                     '(' || constraint_record.referenced_column || 
                     ') ON DELETE CASCADE';
        EXECUTE alter_sql;
        
        RAISE NOTICE 'Recreated constraint: % with CASCADE', constraint_record.constraint_name;
    END LOOP;
    
    RAISE NOTICE 'All foreign key constraints updated to CASCADE';
END $$;

-- Step 3: Verify the changes
SELECT
    conrelid::regclass AS referencing_table,
    a.attname AS referencing_column,
    confrelid::regclass AS referenced_table,
    af.attname AS referenced_column,
    c.conname AS constraint_name,
    CASE c.confdeltype
        WHEN 'a' THEN 'NO ACTION'
        WHEN 'r' THEN 'RESTRICT'
        WHEN 'c' THEN 'CASCADE'
        WHEN 'n' THEN 'SET NULL'
        WHEN 'd' THEN 'SET DEFAULT'
    END AS on_delete
FROM pg_constraint c
JOIN pg_attribute a
    ON a.attrelid = c.conrelid AND a.attnum = ANY (c.conkey)
JOIN pg_attribute af
    ON af.attrelid = c.confrelid AND af.attnum = ANY (c.confkey)
WHERE c.contype = 'f'
    AND c.confrelid = 'auth.users'::regclass
    AND af.attname = 'id'
ORDER BY referencing_table, referencing_column;

-- Step 4: Test user deletion (optional - uncomment to test)
-- DO $$
-- DECLARE
--     user_email TEXT := 'kriselle.t@gmail.com';
--     user_id UUID;
-- BEGIN
--     -- Get the user ID
--     SELECT id INTO user_id 
--     FROM auth.users 
--     WHERE email = user_email;
--     
--     IF user_id IS NOT NULL THEN
--         -- Delete from auth.users (should cascade to all related tables)
--         DELETE FROM auth.users WHERE id = user_id;
--         RAISE NOTICE 'User deleted successfully with CASCADE';
--     ELSE
--         RAISE NOTICE 'User not found';
--     END IF;
-- END $$;

-- Step 5: Status message
SELECT 
    'Status' as step,
    'Foreign key constraints updated to CASCADE' as message,
    'You can now delete users from auth.users and related records will be automatically deleted' as instruction;

