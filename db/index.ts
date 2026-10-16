import { neon } from "@neondatabase/serverless";
import {
  drizzle as drizzleNeon,
  type NeonHttpDatabase,
} from "drizzle-orm/neon-http";
import { drizzle as drizzlePostgres } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is not configured");
}

// Neon's HTTP driver only speaks to Neon. Local and CI Postgres instances
// (docker/service containers, dev machines) use the standard wire protocol,
// so pick the driver that matches the configured host.
const isLocalPostgres = /(?:^|[@/])(?:localhost|127\.0\.0\.1)(?::|\/)/.test(
  databaseUrl,
);

export const db: NeonHttpDatabase<typeof schema> = isLocalPostgres
  ? (drizzlePostgres(postgres(databaseUrl), {
      schema,
    }) as unknown as NeonHttpDatabase<typeof schema>)
  : drizzleNeon(neon(databaseUrl), { schema });
