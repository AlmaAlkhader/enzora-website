import { pgTable, serial, text, boolean, timestamp } from "drizzle-orm/pg-core";

export const paymentMethodsTable = pgTable("payment_methods", {
  id: serial("id").primaryKey(),
  methodKey: text("method_key").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameAr: text("name_ar").notNull(),
  instructionsEn: text("instructions_en").notNull(),
  instructionsAr: text("instructions_ar").notNull(),
  isActive: boolean("is_active").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type PaymentMethodRow = typeof paymentMethodsTable.$inferSelect;
