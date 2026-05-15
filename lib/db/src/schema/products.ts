import { pgTable, serial, text, numeric, boolean, timestamp, jsonb } from "drizzle-orm/pg-core";

export type ProductDimension = { label: string; value: string };

export const productsTable = pgTable("products", {
  id: serial("id").primaryKey(),
  productKey: text("product_key").notNull().unique(),
  name: text("name").notNull(),
  description: text("description").notNull(),
  price: numeric("price", { precision: 12, scale: 2 }),
  currency: text("currency").notNull().default("USD"),
  priceLabel: text("price_label"),
  dimensions: jsonb("dimensions").$type<ProductDimension[]>().notNull().default([]),
  isActive: boolean("is_active").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ProductRow = typeof productsTable.$inferSelect;
