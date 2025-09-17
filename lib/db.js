// lib/db.js
import pkg from 'pg';
const { Pool } = pkg;

// Reuse pool across hot reloads in development / serverless
const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  throw new Error('Please set DATABASE_URL environment variable.');
}

const globalForPg = globalThis;
if (!globalForPg.__pgPool) {
  globalForPg.__pgPool = new Pool({
    connectionString,
    // optional ssl config for some hosts
    // ssl: { rejectUnauthorized: false }
  });
}
const pool = globalForPg.__pgPool;
export default pool;
