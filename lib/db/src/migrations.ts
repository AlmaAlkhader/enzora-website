export type Migration = { name: string; sql: string };

export const MIGRATIONS: Migration[] = [
  {
    name: "0001_rename_orders_columns.sql",
    sql: `
-- Migration: rename orders columns and migrate product_selection values
-- Skipped automatically if the legacy 'reference' column no longer exists.
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'reference'
  ) THEN
    ALTER TABLE orders RENAME COLUMN reference TO order_reference;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'orders' AND column_name = 'location'
  ) THEN
    ALTER TABLE orders RENAME COLUMN location TO country_city;
  END IF;

  UPDATE orders
  SET product_selection = CASE product_selection
    WHEN 'bandage' THEN 'bandage_pack'
    WHEN 'device'  THEN 'smart_device'
    WHEN 'kit'     THEN 'complete_package'
    ELSE product_selection
  END;

  ALTER TABLE orders ALTER COLUMN product_selection SET DEFAULT 'bandage_pack';

  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'orders' AND constraint_name = 'orders_reference_unique'
  ) THEN
    ALTER TABLE orders RENAME CONSTRAINT orders_reference_unique TO orders_order_reference_unique;
  END IF;
END $$;
`,
  },
  {
    name: "0002_create_social_links.sql",
    sql: `
-- Migration: create social_links table
-- The social_links table is a single-row store (id = 1) backing the
-- public GET /api/social-links endpoint and the admin editor.
-- It was added to the Drizzle schema but never created in the live DB,
-- which caused GET /api/social-links to 500 on every page load.
CREATE TABLE IF NOT EXISTS social_links (
  id integer PRIMARY KEY,
  instagram text,
  facebook text,
  linkedin text,
  tiktok text,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);
`,
  },
];
