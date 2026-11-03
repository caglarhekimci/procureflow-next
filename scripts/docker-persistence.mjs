import assert from 'node:assert/strict';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';

const origin = process.env.E2E_BASE_URL ?? 'http://127.0.0.1:3210';
const password = process.env.E2E_PASSWORD ?? 'local-e2e-password-2026';
const statePath = process.env.DOCKER_STATE_PATH ?? 'test-results/docker-state.json';
async function api(path, { method = 'GET', body, cookie, status = 200 } = {}) {
  const response = await fetch(origin + path, {
    method,
    headers: {
      Origin: origin,
      'Content-Type': 'application/json',
      ...(cookie ? { Cookie: cookie } : {}),
    },
    ...(body ? { body: JSON.stringify(body) } : {}),
  });
  const data = await response.json();
  assert.equal(response.status, status, JSON.stringify(data));
  return { data, response };
}
if (process.argv[2] === 'prepare') {
  const login = await api('/api/auth/login', {
    method: 'POST',
    body: { email: 'ayse@atlas.demo', password },
  });
  const cookie = login.response.headers.getSetCookie()[0].split(';')[0];
  assert.ok(cookie.startsWith('procureflow_session='));
  const created = await api('/api/requests', {
    method: 'POST',
    status: 201,
    cookie,
    body: {
      title: 'Container persistence check',
      supplier: 'Demo supplier',
      category: 'Software',
      description: 'A persisted draft used to verify the Docker named volume.',
      amountMinor: 12345,
    },
  });
  mkdirSync(dirname(statePath), { recursive: true });
  writeFileSync(statePath, JSON.stringify({ id: created.data.id, cookie }), { mode: 0o600 });
  console.log('Saved a draft and an opaque session for the container recreation check.');
} else if (process.argv[2] === 'verify') {
  const { id, cookie } = JSON.parse(readFileSync(statePath, 'utf8'));
  const { data } = await api('/api/requests/' + id, { cookie });
  assert.equal(data.request.title, 'Container persistence check');
  assert.equal(data.request.amountMinor, 12345);
  assert.equal(data.request.version, 1);
  assert.equal(data.request.status, 'draft');
  assert.equal(data.audit.length, 1);
  assert.equal(data.audit[0].action, 'created');
  console.log(
    'Docker persistence passed: draft, integer amount, audit trail and existing session survived container replacement.',
  );
} else {
  throw new Error('Use prepare or verify');
}
