import { createContext, useContext, useMemo, useState } from 'react';
import { api, json } from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [creator, setCreator] = useState(() => {
    try { return JSON.parse(localStorage.getItem('creatorspace-creator') || 'null'); } catch { return null; }
  });
  async function login(email, password) {
    const result = await api('/auth/login', json('POST', { email, password }));
    localStorage.setItem('creatorspace-token', result.token);
    localStorage.setItem('creatorspace-creator', JSON.stringify(result.creator));
    setCreator(result.creator);
  }
  async function register(name, email, password) {
    const result = await api('/auth/register', json('POST', { name, email, password }));
    localStorage.setItem('creatorspace-token', result.token);
    localStorage.setItem('creatorspace-creator', JSON.stringify(result.creator));
    setCreator(result.creator);
  }
  function logout() {
    localStorage.removeItem('creatorspace-token');
    localStorage.removeItem('creatorspace-creator');
    setCreator(null);
  }
  const value = useMemo(() => ({ creator, login, register, logout }), [creator]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be used within AuthProvider');
  return value;
}
