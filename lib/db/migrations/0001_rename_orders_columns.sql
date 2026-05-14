-- Migration: rename orders columns and migrate product_selection values
-- Applied via raw SQL prior to drizzle-kit push so existing rows are preserved.
-- Idempotent guards so re-running is safe.

-- 1. Rename columns
ALTER TABLE orders RENAME COLUMN reference TO order_reference;
ALTER TABLE orders RENAME COLUMN location TO country_city;

-- 2. Map old product_selection values to the new identifiers
UPDATE orders
SET product_selection = CASE product_selection
  WHEN 'bandage' THEN 'bandage_pack'
  WHEN 'device'  THEN 'smart_device'
  WHEN 'kit'     THEN 'complete_package'
  ELSE product_selection
END;

-- 3. New default for product_selection
ALTER TABLE orders ALTER COLUMN product_selection SET DEFAULT 'bandage_pack';

-- 4. Rename the unique constraint to match the new column name
ALTER TABLE orders RENAME CONSTRAINT orders_reference_unique TO orders_order_reference_unique;
