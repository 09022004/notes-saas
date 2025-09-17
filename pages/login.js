// pages/login.js
import { useState } from 'react';
import { useRouter } from 'next/router';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('password'); // default password
  const [err, setErr] = useState('');
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setErr('');
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (!res.ok) {
      setErr(data.error || 'Login failed');
      return;
    }
    localStorage.setItem('token', data.token);
    router.push('/notes');
  }

  return (
    <div style={{ maxWidth: 420, margin: '40px auto', fontFamily: 'Arial' }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Email</label><br/>
          <input value={email} onChange={e=>setEmail(e.target.value)} style={{width:'100%'}} />
        </div>
        <div style={{marginTop:10}}>
          <label>Password</label><br/>
          <input value={password} onChange={e=>setPassword(e.target.value)} style={{width:'100%'}} />
        </div>
        <button style={{marginTop:10}} type="submit">Login</button>
        {err && <p style={{color:'red'}}>{err}</p>}
      </form>
      <div style={{marginTop:20}}>
        <b>Test accounts (password: password):</b>
        <ul>
          <li>admin@acme.test</li>
          <li>user@acme.test</li>
          <li>admin@globex.test</li>
          <li>user@globex.test</li>
        </ul>
      </div>
    </div>
  );
}
