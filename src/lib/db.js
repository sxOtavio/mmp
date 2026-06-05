import { Pool } from "@neondatabase/serverless";

const globalForPG = global;

export const pool = globalForPG.__pgPool ?? new Pool({
  connectionString: process.env.DATABASE_URL,
});

globalForPG.__pgPool = pool;