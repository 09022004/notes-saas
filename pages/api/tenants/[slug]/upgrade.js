// pages/api/tenants/[slug]/upgrade.js
import pool from '../../../../lib/db.js';
import jwt from 'jsonwebtoken';
import { setCors } from '../../../../lib/utils.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = auth.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const { slug } = req.query;

    // verify tenant slug matches token tenant
    const { rows: trows } = await pool.query('SELECT id, plan FROM tenants WHERE slug=$1', [slug]);
    if (!trows[0]) return res.status(404).json({ error: 'Tenant not found' });
    const tenant = trows[0];
    if (tenant.id !== payload.tenant_id) return res.status(403).json({ error: 'Tenant mismatch' });

    // only admin allowed
    if (payload.role !== 'admin') return res.status(403).json({ error: 'Only admin can upgrade' });

    await pool.query('UPDATE tenants SET plan=$1 WHERE id=$2', ['pro', tenant.id]);
    return res.json({ message: 'Upgraded to pro' });
  } catch (e) {
    console.error(e);
    return res.status(401).json({ error: 'Invalid token' });
  }
}
