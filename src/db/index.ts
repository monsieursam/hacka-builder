import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

// Initialize PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});
const readPool = new Pool({
  connectionString: process.env.DATABASE_READ_REPLICA_URL,
});

// Create Drizzle ORM instance
export const db = drizzle(pool, { schema });
export const readDb = drizzle(readPool, { schema });
