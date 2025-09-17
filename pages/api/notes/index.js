// pages/api/notes/index.js
import pool from '../../../lib/db.js';
import jwt from 'jsonwebtoken';
import { setCors } from '../../../lib/utils.js';

export default async function handler(req, res) {
  setCors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const auth = req.headers.authorization || '';
  if (!auth.startsWith('Bearer ')) return res.status(401).json({ error: 'Missing token' });
  const token = auth.split(' ')[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const tenantId = payload.tenant_id;

    if (req.method === 'GET') {
      const q = 'SELECT id, title, body, author_id, created_at, updated_at FROM notes WHERE tenant_id=$1 ORDER BY created_at DESC';
      const { rows } = await pool.query(q, [tenantId]);
      return res.json({ notes: rows, tenant_plan: payload.tenant_plan || null });
    }

    if (req.method === 'POST') {
      const { title, body } = req.body || {};
      // check tenant plan
      const { rows: trows } = await pool.query('SELECT plan FROM tenants WHERE id=$1', [tenantId]);
      const plan = trows[0].plan;
      if (plan === 'free') {
        const { rows: crow } = await pool.query('SELECT COUNT(*) FROM notes WHERE tenant_id=$1', [tenantId]);
        const count = parseInt(crow[0].count, 10);
        if (count >= 3) return res.status(403).json({ error: 'Free plan limit reached' });
      }
      const q = 'INSERT INTO notes (tenant_id, author_id, title, body) VALUES ($1,$2,$3,$4) RETURNING *';
      const { rows } = await pool.query(q, [tenantId, payload.user_id, title || null, body || null]);
      return res.status(201).json({ note: rows[0] });
    }

    return res.status(405).end();
  } catch (e) {
    console.error(e);
    return res.status(401).json({ error: 'Invalid token' });
  }
}
