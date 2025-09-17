// pages/api/auth/login.js
import pool from '../../../lib/db.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { setCors } from '../../../lib/utils.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { email, password } = req.body || {};
  if (!email || !password) return res.status(400).json({ error: 'Missing email or password' });

  const q = `SELECT u.*, t.slug as tenant_slug, t.plan as tenant_plan
             FROM users u JOIN tenants t ON u.tenant_id = t.id
             WHERE u.email = $1`;
  const { rows } = await pool.query(q, [email]);
  const user = rows[0];
  if (!user) return res.status(401).json({ error: 'Invalid credentials' });

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) return res.status(401).json({ error: 'Invalid credentials' });

  const payload = {
    user_id: user.id,
    tenant_id: user.tenant_id,
    email: user.email,
    role: user.role,
    tenant_slug: user.tenant_slug,
    tenant_plan: user.tenant_plan
  };

  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '1h' });
  return res.status(200).json({ token });
}
