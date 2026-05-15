import { runMigrations } from "@workspace/db";
import app from "./app";
import { logger } from "./lib/logger";
import { seedProducts } from "./lib/seed";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

async function main() {
  const applied = await runMigrations();
  if (applied.length > 0) {
    logger.info({ applied }, "Applied database migrations");
  }

  // Migration-only mode: used by the production deploy command to run the
  // raw-SQL migrator (which safely handles renames and other destructive
  // changes) BEFORE `drizzle-kit push` is invoked. Once migrations are
  // applied, exit so the deploy script can run the schema sync against the
  // already-migrated DB and then start the server normally.
  if (process.env["MIGRATE_ONLY"] === "1") {
    logger.info("MIGRATE_ONLY=1 set; exiting after migrations");
    return;
  }

  await seedProducts();

  app.listen(port, (err) => {
    if (err) {
      logger.error({ err }, "Error listening on port");
      process.exit(1);
    }

    logger.info({ port }, "Server listening");
  });
}

main().catch((err) => {
  logger.error({ err }, "Fatal startup error");
  process.exit(1);
});
