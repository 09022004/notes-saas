import bcrypt from "bcryptjs";
import { Pool } from "pg";
import { randomUUID } from "crypto";

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function seed() {
  const passwordHash = await bcrypt.hash("hello123", 10);

  // Insert tenants safely (ON CONFLICT needs unique slug constraint, which we have)
  const acmeTenant = await pool.query(`
    INSERT INTO tenants (id, slug, name, plan)
    VALUES ($1, 'acme', 'Acme', 'free')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id;
  `, [randomUUID()]);

  const globexTenant = await pool.query(`
    INSERT INTO tenants (id, slug, name, plan)
    VALUES ($1, 'globex', 'Globex', 'free')
    ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name
    RETURNING id;
  `, [randomUUID()]);

  const acmeId = acmeTenant.rows[0].id;
  const globexId = globexTenant.rows[0].id;

  // Users for Acme
  await pool.query(`
    INSERT INTO users (email, password_hash, role, tenant_id)
    VALUES
      ('admin@acme.test', $1, 'admin', $2),
      ('user@acme.test', $1, 'member', $2)
    ON CONFLICT (email) DO NOTHING;
  `, [passwordHash, acmeId]);

  // Users for Globex
  await pool.query(`
    INSERT INTO users (email, password_hash, role, tenant_id)
    VALUES
      ('admin@globex.test', $1, 'admin', $2),
      ('user@globex.test', $1, 'member', $2)
    ON CONFLICT (email) DO NOTHING;
  `, [passwordHash, globexId]);

  console.log("✅ Seeded tenants and users safely");
  await pool.end();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});