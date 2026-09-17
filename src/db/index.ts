import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";

const rawDbUrl = process.env.DATABASE_URL;

if (!rawDbUrl) {
  throw new Error("DATABASE_URL is required");
}

const databaseUrl: string = rawDbUrl;

/**
 * Serverless-safe connection pooling.
 *
 * On serverless hosts (Vercel Functions, Lambda, etc.) every function instance
 * creates its own Pool. With the default `max: 10` this quickly exhausts the
 * database's connection limit. Capping at 1 connection per instance — combined
 * with a pooled connection string (e.g. Neon's `-pooler` endpoint) — keeps us
 * safely inside the limit while still reusing the pool across warm invocations.
 *
 * The pool is cached on `globalThis` in development so Next.js hot-reloading
 * doesn't open a new connection on every file save.
 */
const isLocal =
  databaseUrl.includes("localhost") || databaseUrl.includes("127.0.0.1");

const globalForDb = globalThis as typeof globalThis & {
  __personalRealEstatePool?: Pool;
};

function createPool() {
  const sanitizedUrl = isLocal
    ? databaseUrl
    : databaseUrl.replace(/([?&])sslmode=[^&]+(&|$)/, '$1').replace(/[?&]$/, '');

  return new Pool({
    connectionString: sanitizedUrl,
    max: isLocal ? 10 : 1,
    idleTimeoutMillis: 20_000,
    connectionTimeoutMillis: 15_000,
    // Managed providers (Neon, Supabase, Render) require TLS.
    ...(isLocal ? {} : { ssl: { rejectUnauthorized: false } }),
  });
}

export const pool = globalForDb.__personalRealEstatePool ?? createPool();

if (process.env.NODE_ENV !== "production") {
  globalForDb.__personalRealEstatePool = pool;
}

export const db = drizzle(pool);
