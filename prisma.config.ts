import path from "node:path";
import { config } from "dotenv";
import { defineConfig } from "prisma/config";

/**
 * Prisma v7 configuration file.
 *
 * Prisma CLI does NOT auto-load .env.local — only .env.
 * We explicitly load .env.local here so CLI commands (migrate, push, studio)
 * pick up our secrets without needing a plain .env file.
 *
 * TWO connection strings are needed (from Supabase Dashboard > Project Settings > Database):
 *   DIRECT_URL    — Direct Connection (port 5432) — used by Prisma CLI (migrate/push)
 *   DATABASE_URL  — Transaction Pooler (port 6543) — used by the app at runtime
 */
config({ path: ".env.local" });

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DIRECT_URL ?? process.env.DATABASE_URL ?? "",
  },
});
