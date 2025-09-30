-- Update season name from "Season 1: Genesis" to "Season 1"
-- This fixes any remaining references to the old season name

UPDATE seasons 
SET name = 'Season 1' 
WHERE name = 'Season 1: Genesis' OR name LIKE '%Genesis%';

-- Also update the description to be consistent
UPDATE seasons 
SET description = 'The inaugural season featuring classic profile frames'
WHERE id = 1;
