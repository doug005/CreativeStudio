import test from 'node:test';
import assert from 'node:assert/strict';
import app from '../app.js';
import { createServer } from 'node:http';

async function withServer(run) {
  const server = createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  try { await run(`http://127.0.0.1:${port}`); }
  finally { await new Promise((resolve, reject) => server.close((error) => error ? reject(error) : resolve())); }
}

test('health endpoint responds without a database connection', async () => {
  await withServer(async (base) => {
    const response = await fetch(`${base}/api/health`);
    assert.equal(response.status, 200);
    assert.equal((await response.json()).status, 'ok');
  });
});

test('content management is denied without a JWT', async () => {
  await withServer(async (base) => {
    const response = await fetch(`${base}/api/contents`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ title: 'No access' }) });
    assert.equal(response.status, 401);
    assert.match((await response.json()).message, /login/i);
  });
});

test('protected dashboard stats are denied without a JWT', async () => {
  await withServer(async (base) => {
    const response = await fetch(`${base}/api/dashboard/stats`);
    assert.equal(response.status, 401);
  });
});

test('all creator mutation and moderation routes require authentication', async () => {
  await withServer(async (base) => {
    const id = '507f1f77bcf86cd799439011';
    const requests = [
      fetch(`${base}/api/contents/${id}`, { method: 'PUT', headers: { 'Content-Type': 'application/json' }, body: '{}' }),
      fetch(`${base}/api/contents/${id}`, { method: 'DELETE' }),
      fetch(`${base}/api/comments/manage`),
      fetch(`${base}/api/comments/${id}/moderate`, { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'approve' }) }),
    ];
    const responses = await Promise.all(requests);
    assert.deepEqual(responses.map((response) => response.status), [401, 401, 401, 401]);
  });
});

test('login, creator registration, and viewer engagement validate request bodies before database access', async () => {
  await withServer(async (base) => {
    const login = await fetch(`${base}/api/auth/login`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email: 'not-an-email', password: '' }) });
    const registration = await fetch(`${base}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'A', email: 'not-an-email', password: 'short' }) });
    const noSurname = await fetch(`${base}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Creator', email: 'valid@example.com', password: 'a-secure-password' }) });
    const shortName = await fetch(`${base}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'A', email: 'valid@example.com', password: 'a-secure-password' }) });
    const numericName = await fetch(`${base}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'Creator7', email: 'valid@example.com', password: 'a-secure-password' }) });
    const longName = await fetch(`${base}/api/auth/register`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'A'.repeat(31), email: 'valid@example.com', password: 'a-secure-password' }) });
    const comment = await fetch(`${base}/api/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    const numericCommentName = await fetch(`${base}/api/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ displayName: 'Reader9', message: 'A valid thought' }) });
    const longCommentName = await fetch(`${base}/api/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ displayName: 'A'.repeat(31), message: 'A valid thought' }) });
    const noCommentSurname = await fetch(`${base}/api/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ displayName: 'Reader', message: 'A valid thought' }) });
    const shortCommentName = await fetch(`${base}/api/comments`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ displayName: 'A', message: 'A valid thought' }) });
    const like = await fetch(`${base}/api/likes`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({}) });
    assert.equal(login.status, 400);
    assert.equal(registration.status, 400);
    assert.match((await registration.json()).message, /name/i);
    assert.equal(noSurname.status, 400);
    assert.match((await noSurname.json()).message, /surname/i);
    assert.equal(shortName.status, 400);
    assert.match((await shortName.json()).message, /3 and 30/i);
    assert.equal(numericName.status, 400);
    assert.match((await numericName.json()).message, /numbers/i);
    assert.equal(longName.status, 400);
    assert.match((await longName.json()).message, /30 characters/i);
    assert.equal(comment.status, 400);
    assert.equal(numericCommentName.status, 400);
    assert.match((await numericCommentName.json()).message, /numbers/i);
    assert.equal(longCommentName.status, 400);
    assert.match((await longCommentName.json()).message, /30 characters/i);
    assert.equal(noCommentSurname.status, 400);
    assert.match((await noCommentSurname.json()).message, /surname/i);
    assert.equal(shortCommentName.status, 400);
    assert.match((await shortCommentName.json()).message, /3 and 30/i);
    assert.equal(like.status, 400);
  });
});

test('unknown API paths return JSON 404 responses', async () => {
  await withServer(async (base) => {
    const response = await fetch(`${base}/api/not-a-route`);
    assert.equal(response.status, 404);
    assert.ok((await response.json()).message);
  });
});
