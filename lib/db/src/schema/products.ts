import { pgTable, serial, text, numeric, boolean, timestamp } from "drizzle-orm/pg-core";

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  productKey: text("product_key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }),
  currency: text("currency").notNull().default("USD"),
  priceLabel: text("price_label"),
  isActive: boolean("is_active").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ProductRow = typeof productsTable.$inferSelect;
