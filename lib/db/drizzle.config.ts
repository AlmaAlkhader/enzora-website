import { defineConfig } from "drizzle-kit";
import path from "path";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL, ensure the database is provisioned");
}

export default defineConfig({
  schema: path.join(__dirname, "./src/schema/index.ts"),
  dialect: "postgresql",
  // `schema_migrations` is the bookkeeping table created by our own raw-SQL
  // migration runner (see `src/migrate.ts`). It is intentionally not part of
  // the Drizzle schema, so exclude it from `drizzle-kit push` to prevent
  // interactive "rename or drop?" prompts from blocking automated runs.
  tablesFilter: ["!schema_migrations"],
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
