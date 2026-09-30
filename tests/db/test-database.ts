import { randomBytes } from "node:crypto";

import { drizzle, type PostgresJsDatabase } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";
import postgres from "postgres";

import * as schema from "@/db/schema";

export type TestDatabase = {
  db: PostgresJsDatabase<typeof schema>;
  client: ReturnType<typeof postgres>;
  dispose: () => Promise<void>;
};

/**
 * Creates a throwaway database, applies every committed migration, and
 * returns a Drizzle client. `TEST_DATABASE_URL` must point at a role that can
 * create databases (the local docker-compose `sapa` role can).
 */
export async function createTestDatabase(
  adminUrl: string,
): Promise<TestDatabase> {
  const name = `sapa_test_${randomBytes(6).toString("hex")}`;
  const admin = postgres(adminUrl, { max: 1, onnotice: () => undefined });
  await admin.unsafe(`create database "${name}"`);

  const url = new URL(adminUrl);
  url.pathname = `/${name}`;
  const client = postgres(url.toString(), {
    max: 1,
    prepare: false,
    onnotice: () => undefined,
  });
  const db = drizzle(client, { schema });
  await migrate(db, { migrationsFolder: "db/migrations" });

  return {
    db,
    client,
    dispose: async () => {
      await client.end({ timeout: 5 });
      await admin.unsafe(`drop database if exists "${name}" with (force)`);
      await admin.end({ timeout: 5 });
    },
  };
}
