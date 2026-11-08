const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export function viewerKey() {
  let key = localStorage.getItem('creatorspace-viewer-key');
  if (!key) {
    key = globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2)}-${Math.random().toString(36).slice(2)}`;
    localStorage.setItem('creatorspace-viewer-key', key);
  }
  return key;
}

export async function api(path, options = {}) {
  const token = localStorage.getItem('creatorspace-token');
  const headers = { ...(options.body ? { 'Content-Type': 'application/json' } : {}), ...(token ? { Authorization: `Bearer ${token}` } : {}), ...options.headers };
  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (response.status === 204) return null;
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `Request failed (${response.status}).`);
  return data;
}

export const json = (method, body) => ({ method, body: JSON.stringify(body) });
