-- Get the building ID
WITH building_data AS (
  SELECT id FROM buildings WHERE name = 'GS타워' LIMIT 1
)
-- Update all profiles to link to this building
UPDATE profiles 
SET building_id = (SELECT id FROM building_data)
WHERE building_id IS NULL;
