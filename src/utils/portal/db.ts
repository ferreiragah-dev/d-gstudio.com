import "server-only";
import { Pool, type PoolClient, type QueryResultRow } from "pg";

const globalDb = globalThis as unknown as { portalPool?: Pool };
export function database() {
  if (!process.env.DATABASE_URL) throw new Error("Portal database unavailable");
  if (!globalDb.portalPool) {
    globalDb.portalPool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: 8,
      connectionTimeoutMillis: 5000,
      statement_timeout: 10000,
    });
    globalDb.portalPool.on("error", () =>
      console.error("Portal database connection interrupted"),
    );
  }
  return globalDb.portalPool;
}
export async function query<T extends QueryResultRow>(
  sql: string,
  values: unknown[] = [],
  client?: PoolClient,
) {
  return (await (client ?? database()).query<T>(sql, values)).rows;
}
export async function transaction<T>(work: (client: PoolClient) => Promise<T>) {
  const client = await database().connect();
  try {
    await client.query("BEGIN");
    const value = await work(client);
    await client.query("COMMIT");
    return value;
  } catch (error) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
}
