import { Pool } from "pg";

const globalForDb = globalThis as unknown as { ecoPool?: Pool };
export const db = globalForDb.ecoPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 5,
  idleTimeoutMillis: 10_000,
  connectionTimeoutMillis: 8_000,
  ssl: process.env.DATABASE_URL?.includes("neon.tech") ? { rejectUnauthorized: true } : undefined,
});
if (process.env.NODE_ENV !== "production") globalForDb.ecoPool = db;
