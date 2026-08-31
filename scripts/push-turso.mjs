import { createClient } from "@libsql/client";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url || !authToken) {
  console.error("TURSO_DATABASE_URL ve TURSO_AUTH_TOKEN gerekli.");
  process.exit(1);
}

const client = createClient({ url, authToken });
const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
const dirs = readdirSync(migrationsDir)
  .filter((name) => name !== "migration_lock.toml")
  .sort();

for (const dir of dirs) {
  const file = path.join(migrationsDir, dir, "migration.sql");
  const sql = readFileSync(file, "utf8");
  console.log(`Applying ${dir}...`);
  await client.executeMultiple(sql);
}

console.log("Turso şeması güncellendi.");
