import "@/lib/auth-env";
import { PrismaLibSQL } from "@prisma/adapter-libsql";
import { PrismaClient } from "@prisma/client";
import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { BUNDLED_MIGRATIONS } from "@/lib/schema-sql";
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
  const statements: string[] = [];
  for (const sql of BUNDLED_MIGRATIONS) {
    statements.push(
      ...sql
        .split(";")
        .map((part) => part.trim())
        .filter(Boolean),
    );
  }
  const dir = path.join(process.cwd(), "prisma", "migrations");
  try {
    const folders = readdirSync(dir)
      .filter((name) => name !== "migration_lock.toml")
      .sort();
    for (const folder of folders) {
      const file = path.join(dir, folder, "migration.sql");
      const sql = readFileSync(file, "utf8");
      statements.push(
        ...sql
          .split(";")
          .map((part) => part.trim())
          .filter(Boolean),
      );
    }
  } catch {
    // Vercel bundle may omit prisma/migrations; bundled SQL is enough for empty DBs.
  }
  for (const statement of statements) {
    try {
      await prisma.$executeRawUnsafe(statement);
    } catch (error) {
      const message = error instanceof Error ? error.message : "";
      if (!/already exists|duplicate|duplicate column/i.test(message)) {
        throw error;
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

export function dbErrorMessage(_error: unknown) {
  return "Bağlantı kurulamadı. Çıkış yapıp tekrar dene; olmazsa biraz sonra yeniden kayıt ol.";
}
