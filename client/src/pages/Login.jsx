import { useState } from 'react';
import { ArrowLeft, ArrowRight, LockKeyhole } from 'lucide-react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { creator, login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (creator) return <Navigate to="/dashboard" replace />;
  async function submit(event) {
    event.preventDefault(); setError(''); setBusy(true);
    try { await login(email, password); navigate('/dashboard', { replace: true }); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  return <div className="login-page section-wrap"><Link to="/" className="text-link"><ArrowLeft size={15} /> Back to the public site</Link><div className="login-card"><div className="login-symbol"><LockKeyhole size={21} /></div><span className="eyebrow">CREATOR ACCESS</span><h1>Welcome back.</h1><p>Your studio, your stories, all in one place.</p><form onSubmit={submit}><label>Email address<input type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" /></label><label>Password<input type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Your password" /></label>{error && <div className="notice error-notice">{error}</div>}<button className="button button-dark login-submit" disabled={busy}>{busy ? 'Signing in…' : 'Enter your studio'} <ArrowRight size={16} /></button></form><span className="login-footnote">This area is for the creator only.</span></div></div>;
}
