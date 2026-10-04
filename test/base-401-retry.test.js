import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BaseSDK } from '../base.js';

// api#222 follow-up (Grok review finding #2): the 401 retry must always go
// over plain HTTP (forceFetch: true), never back over the transport that
// produced the 401. A socket transport that just 401'd is still carrying
// the pre-rotation JWT -- the rotation reaches it asynchronously over NATS
// -- so retrying over the same socket would 401 again and wrongly fire
// onUnauthorized even though the refresh above just succeeded.

function fakeUnauthorizedResponse() {
  return {
    ok: false,
    status: 401,
    statusText: 'Unauthorized',
    headers: { get: () => null },
    json: async () => ({ message: 'unauthorized' }),
  };
}

test('401 retry after refresh uses forceFetch (bypasses a still-stale socket transport)', async () => {
  let transportCalls = 0;
  let fetchCalls = 0;
  let refreshCalls = 0;

  const fakeSocketTransport = {
    name: 'socket',
    getPriority: () => 10,
    isAvailable: async () => true,
    request: async () => {
      transportCalls += 1;
      // Always 401s -- simulates the socket still carrying the
      // pre-rotation JWT even after a successful refresh.
      return fakeUnauthorizedResponse();
    },
  };

  const originalFetch = global.fetch;
  global.fetch = async () => {
    fetchCalls += 1;
    return {
      ok: true,
      status: 200,
      statusText: 'OK',
      headers: { get: (h) => (h === 'content-type' ? 'application/json' : null) },
      json: async () => ({ ok: true }),
    };
  };

  try {
    const sdk = new BaseSDK({ autoRefresh: true, namespace: 'test' });
    sdk.login = {
      refresh: async () => {
        refreshCalls += 1;
        return { token: 'new-token' };
      },
    };
    sdk.addTransport(fakeSocketTransport);

    const run =
      Object.getOwnPropertySymbols(sdk)
        .map((s) => sdk[s])
        .find((v) => typeof v === 'function') ||
      sdk[Symbol.for('unbound.sdk.request')];

    const result = await run('/objects', 'GET', {}, false);

    assert.deepEqual(result, { ok: true });
    assert.equal(refreshCalls, 1, 'refresh should run exactly once');
    assert.equal(transportCalls, 1, 'the socket transport should be hit only on the original 401, never on retry');
    assert.equal(fetchCalls, 1, 'the retry must go over plain HTTP exactly once');
  } finally {
    global.fetch = originalFetch;
  }
});
