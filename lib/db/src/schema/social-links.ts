import { pgTable, integer, text, timestamp } from "drizzle-orm/pg-core";

export const SOCIAL_LINKS_ROW_ID = 1;

export const socialLinksTable = pgTable("social_links", {
  id: integer("id").primaryKey(),
  instagram: text("instagram"),
  facebook: text("facebook"),
  linkedin: text("linkedin"),
  tiktok: text("tiktok"),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

export type SocialLinksRow = typeof socialLinksTable.$inferSelect;
