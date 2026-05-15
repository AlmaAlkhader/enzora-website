import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderReference: text("reference").notNull().unique(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  countryCity: text("location").notNull(),
  country: text("country"),
  city: text("city"),
  customerType: text("customer_type").notNull(),
  productSelection: text("product_selection").notNull().default("bandage_pack"),
  quantity: integer("quantity").notNull(),
  productNameSnapshot: text("product_name_snapshot"),
  productPriceSnapshot: numeric("product_price_snapshot", { precision: 12, scale: 2 }),
  productCurrencySnapshot: text("product_currency_snapshot"),
  totalEstimatedPrice: numeric("total_estimated_price", { precision: 14, scale: 2 }),
  message: text("message"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type OrderRow = typeof ordersTable.$inferSelect;
