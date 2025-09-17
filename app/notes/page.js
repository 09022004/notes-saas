// pages/notes.js
import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';

function getToken() { if (typeof window === 'undefined') return null; return localStorage.getItem('token'); }

export default function Notes() {
  const [notes, setNotes] = useState([]);
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [user, setUser] = useState(null);
  const [tenant, setTenant] = useState(null);
  const [message, setMessage] = useState('');
  const router = useRouter();

  async function fetchMe() {
    const token = getToken();
    if (!token) return router.push('/login');
    const res = await fetch('/api/me', { headers: { Authorization: 'Bearer ' + token }});
    if (!res.ok) { localStorage.removeItem('token'); return router.push('/login'); }
    const data = await res.json();
    setUser(data.user);
    setTenant(data.tenant);
  }

  async function fetchNotes() {
    const token = getToken();
    const res = await fetch('/api/notes', { headers: { Authorization: 'Bearer ' + token }});
    if (!res.ok) { setMessage('Failed to load notes'); return; }
    const data = await res.json();
    setNotes(data.notes || []);
  }

  useEffect(()=>{ fetchMe(); fetchNotes(); }, []);

  async function handleCreate(e) {
    e.preventDefault();
    setMessage('');
    const token = getToken();
    const res = await fetch('/api/notes', { method: 'POST', headers: { Authorization: 'Bearer ' + token, 'Content-Type': 'application/json'}, body: JSON.stringify({ title, body })});
    const data = await res.json();
    if (!res.ok) { setMessage(data.error || 'create failed'); return; }
    setTitle(''); setBody('');
    fetchNotes();
  }

  async function handleDelete(id) {
    const token = getToken();
    const res = await fetch('/api/notes/' + id, { method: 'DELETE', headers: { Authorization: 'Bearer ' + token }});
    if (res.status === 204) fetchNotes();
    else setMessage('Delete failed');
  }

  async function handleUpgrade() {
    const token = getToken();
    if (!tenant) return;
    const res = await fetch('/api/tenants/' + tenant.slug + '/upgrade', { method: 'POST', headers: { Authorization: 'Bearer ' + token }});
    const data = await res.json();
    if (!res.ok) setMessage(data.error || 'Upgrade failed');
    else { setMessage('Upgraded to Pro'); fetchNotes(); fetchMe(); }
  }

  const atLimit = tenant?.plan === 'free' && notes.length >= 3;

  return (
    <div style={{maxWidth:800, margin:'32px auto', fontFamily:'Arial'}}>
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
        <h2>Notes</h2>
        {user && <div>{user.email} ({user.role})</div>}
      </div>

      {message && <p style={{color:'red'}}>{message}</p>}

      <form onSubmit={handleCreate} style={{marginBottom:20}}>
        <input placeholder="Title" value={title} onChange={e=>setTitle(e.target.value)} style={{width:'100%'}}/>
        <textarea placeholder="Body" value={body} onChange={e=>setBody(e.target.value)} style={{width:'100%', marginTop:8}} />
        <button type="submit" disabled={atLimit} style={{marginTop:8}}>Create Note</button>
        {atLimit && <div style={{marginTop:8, color:'orange'}}>Free plan limit reached. <button onClick={handleUpgrade} type="button">Upgrade to Pro</button></div>}
      </form>

      <div>
        {notes.map(n => (
          <div key={n.id} style={{padding:12, border:'1px solid #ddd', marginBottom:8}}>
            <h4>{n.title}</h4>
            <p>{n.body}</p>
            <button onClick={()=>handleDelete(n.id)}>Delete</button>
          </div>
        ))}
      </div>
    </div>
  );
}
