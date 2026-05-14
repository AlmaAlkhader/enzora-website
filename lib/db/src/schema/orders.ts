import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";

export const ordersTable = pgTable("orders", {
  id: serial("id").primaryKey(),
  orderReference: text("order_reference").notNull().unique(),
  fullName: text("full_name").notNull(),
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  countryCity: text("country_city").notNull(),
  customerType: text("customer_type").notNull(),
  productSelection: text("product_selection").notNull().default("bandage_pack"),
  quantity: integer("quantity").notNull(),
  message: text("message"),
  status: text("status").notNull().default("new"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type OrderRow = typeof ordersTable.$inferSelect;
