import test from 'node:test';
import assert from 'node:assert/strict';
import { contentInput } from '../controllers/contentController.js';

const valid = { title: 'A thoughtful title', description: 'A longer description for the validation checks.', category: 'Creativity', type: 'Article' };

test('content input trims text and accepts valid category and format', () => {
  const result = contentInput({ ...valid, title: '  A thoughtful title  ', status: 'Draft' });
  assert.equal(result.title, 'A thoughtful title');
  assert.equal(result.status, 'Draft');
});

test('content input rejects unknown category and content format', () => {
  assert.throws(() => contentInput({ ...valid, category: 'Unknown' }), /category/i);
  assert.throws(() => contentInput({ ...valid, type: 'Document' }), /type/i);
});

test('scheduled content requires a future publication time', () => {
  assert.throws(() => contentInput({ ...valid, status: 'Scheduled', publicationDate: new Date(Date.now() - 60_000).toISOString() }), /future/i);
  assert.ok(contentInput({ ...valid, status: 'Scheduled', publicationDate: new Date(Date.now() + 60_000).toISOString() }).publicationDate);
});

test('published content cannot be dated in the future', () => {
  assert.throws(() => contentInput({ ...valid, status: 'Published', publicationDate: new Date(Date.now() + 60_000).toISOString() }), /future/i);
});

test('content links must be HTTP or HTTPS URLs', () => {
  assert.throws(() => contentInput({ ...valid, mediaUrl: 'javascript:alert(1)' }), /http or https/i);
  assert.throws(() => contentInput({ ...valid, thumbnailUrl: 'not-a-url' }), /http or https/i);
});
