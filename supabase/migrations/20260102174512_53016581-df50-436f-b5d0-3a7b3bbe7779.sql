-- Step 0: Drop the existing foreign key constraint first
ALTER TABLE message_queue 
DROP CONSTRAINT IF EXISTS message_queue_business_id_fkey;

-- Step 1: Delete orphan records that reference non-existent businesses
DELETE FROM message_queue 
WHERE business_id IS NOT NULL AND business_id NOT IN (SELECT id FROM businesses);

-- Step 2: Copy any existing data from company_id to business_id if needed
UPDATE message_queue 
SET business_id = company_id 
WHERE business_id IS NULL AND company_id IS NOT NULL;

-- Step 3: Delete any remaining orphans after the copy
DELETE FROM message_queue 
WHERE business_id IS NULL OR business_id NOT IN (SELECT id FROM businesses);

-- Step 4: Make business_id NOT NULL
ALTER TABLE message_queue 
ALTER COLUMN business_id SET NOT NULL;

-- Step 5: Re-add the foreign key constraint
ALTER TABLE message_queue
ADD CONSTRAINT message_queue_business_id_fkey 
FOREIGN KEY (business_id) REFERENCES businesses(id) ON DELETE CASCADE;

-- Step 6: Drop the old company_id column
ALTER TABLE message_queue 
DROP COLUMN IF EXISTS company_id;

-- Step 7: Drop old customer_id and template_key columns (legacy schema)
ALTER TABLE message_queue 
DROP COLUMN IF EXISTS customer_id,
DROP COLUMN IF EXISTS template_key;

-- Step 8: Make other required columns NOT NULL
ALTER TABLE message_queue 
ALTER COLUMN quote_id SET NOT NULL,
ALTER COLUMN step_index SET NOT NULL,
ALTER COLUMN to_phone SET NOT NULL,
ALTER COLUMN from_phone SET NOT NULL,
ALTER COLUMN content SET NOT NULL;