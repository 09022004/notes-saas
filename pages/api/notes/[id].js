// pages/api/notes/[id].js
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
    const { id } = req.query;

    if (req.method === 'GET') {
      const { rows } = await pool.query('SELECT * FROM notes WHERE id=$1 AND tenant_id=$2', [id, tenantId]);
      if (!rows[0]) return res.status(404).json({ error: 'Note not found' });
      return res.json({ note: rows[0] });
    }

    if (req.method === 'PUT') {
      const { title, body } = req.body || {};
      // allow members to edit own notes; admins can edit all
      const { rows } = await pool.query('SELECT author_id FROM notes WHERE id=$1 AND tenant_id=$2', [id, tenantId]);
      if (!rows[0]) return res.status(404).json({ error: 'Note not found' });
      const authorId = rows[0].author_id;
      if (payload.role !== 'admin' && authorId !== payload.user_id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      const q = 'UPDATE notes SET title=$1, body=$2, updated_at=now() WHERE id=$3 AND tenant_id=$4 RETURNING *';
      const { rows: upr } = await pool.query(q, [title, body, id, tenantId]);
      return res.json({ note: upr[0] });
    }

    if (req.method === 'DELETE') {
      const { rows } = await pool.query('SELECT author_id FROM notes WHERE id=$1 AND tenant_id=$2', [id, tenantId]);
      if (!rows[0]) return res.status(404).json({ error: 'Note not found' });
      const authorId = rows[0].author_id;
      if (payload.role !== 'admin' && authorId !== payload.user_id) {
        return res.status(403).json({ error: 'Forbidden' });
      }
      await pool.query('DELETE FROM notes WHERE id=$1 AND tenant_id=$2', [id, tenantId]);
      return res.status(204).end();
    }

    return res.status(405).end();
  } catch (e) {
    console.error(e);
    return res.status(401).json({ error: 'Invalid token' });
  }
}
