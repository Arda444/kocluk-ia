import "@/lib/auth-env";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { tursoConfig } from "@/lib/env-value";

const globalForPrisma = globalThis as unknown as {
  prisma?: PrismaClient;
  schemaReady?: Promise<void>;
};

function resolveDatabaseUrl() {
  if (tursoConfig()) {
    return process.env.DATABASE_URL ?? "file:./dev.db";
  }
  if (process.env.VERCEL) {
    process.env.DATABASE_URL = "file:/tmp/kocluk.db";
  }
  return process.env.DATABASE_URL ?? "file:./dev.db";
}

function createPrismaClient() {
  resolveDatabaseUrl();
  const turso = tursoConfig();
  if (turso) {
    const adapter = new PrismaLibSQL({
      url: turso.url,
      authToken: turso.authToken,
    });
    return new PrismaClient({ adapter });
  }
  return new PrismaClient();
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();
globalForPrisma.prisma = prisma;

async function applyMigrations() {
  const dir = path.join(process.cwd(), "prisma", "migrations");
  let folders: string[] = [];
  try {
    folders = readdirSync(dir)
      .filter((name) => name !== "migration_lock.toml")
      .sort();
  } catch {
    return;
  }
  for (const folder of folders) {
    const file = path.join(dir, folder, "migration.sql");
    const sql = readFileSync(file, "utf8");
    const statements = sql
      .split(";")
      .map((part) => part.trim())
      .filter(Boolean);
    for (const statement of statements) {
      try {
        await prisma.$executeRawUnsafe(statement);
      } catch (error) {
        const message = error instanceof Error ? error.message : "";
        if (!/already exists|duplicate/i.test(message)) {
          throw error;
        }
      }
    }
  }
}

export async function ensureSchema() {
  if (!globalForPrisma.schemaReady) {
    globalForPrisma.schemaReady = (async () => {
      try {
        await prisma.$queryRawUnsafe("SELECT 1 FROM User LIMIT 1");
      } catch {
        await applyMigrations();
      }
    })();
  }
  await globalForPrisma.schemaReady;
}

export function dbErrorMessage(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);
  if (/AUTH_SECRET|MissingSecret/i.test(message)) {
    return "AUTH_SECRET Vercel’de yok. Settings → Environment Variables.";
  }
  if (/Unable to (open|require)|SQLITE|no such table|database|Turso|libsql|ECONN/i.test(message)) {
    return "Canlı veritabanı bağlanamadı. TURSO_DATABASE_URL libsql://...turso.io olmalı (app.turso.tech panel linki değil), TURSO_AUTH_TOKEN dolu olsun, sonra Redeploy.";
  }
  return "Giriş/kayıt şu an başarısız. Vercel loguna bak: AUTH_SECRET, AUTH_URL (localhost olmasın), Turso.";
}
