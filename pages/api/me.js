// pages/api/me.js
import pool from '../../lib/db.js';
import jwt from 'jsonwebtoken';
import { setCors } from '../../lib/utils.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = auth.split(' ')[1];
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { rows: userRows } = await pool.query('SELECT id,email,role,tenant_id FROM users WHERE id=$1', [payload.user_id]);
    if (!userRows[0]) return res.status(404).json({ error: 'User not found' });
    const { rows: trows } = await pool.query('SELECT id,slug,plan FROM tenants WHERE id=$1', [payload.tenant_id]);
    const tenant = trows[0];
    return res.json({ user: userRows[0], tenant });
  } catch (e) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}
