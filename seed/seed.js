import bcrypt from "bcryptjs";
import { Pool } from "pg";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  const passwordHash = await bcrypt.hash("password", 10);

  await pool.query(`
    INSERT INTO users (email, password_hash, role, tenant_id)
    VALUES ('admin@acme.test', '${passwordHash}', 'admin', 1)
    ON CONFLICT (email) DO NOTHING;
  `);

  console.log("✅ Seeded admin user");
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
