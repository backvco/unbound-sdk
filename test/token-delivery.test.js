import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BaseSDK } from '../base.js';

// Additive `tokenDelivery` constructor option ('bearer' default | 'cookie').
// app1-api auth_v3 (validators.js ~line 122) rejects a cookie-type token
// carried as `Authorization: Bearer` with "Invalid token, authentication
// method mismatch" -- cookie-type tokens must arrive as a Cookie header.

function fakeOkResponse() {
  return {
    ok: true,
    status: 200,
    statusText: 'OK',
    headers: { get: (h) => (h === 'content-type' ? 'application/json' : null) },
    json: async () => ({ ok: true }),
  };
}

function runRequest(sdk, endpoint, method, params) {
  return sdk[Symbol.for('unbound.sdk.request')](endpoint, method, params, false);
}

test('tokenDelivery default (bearer) sends Authorization, no Cookie -- unchanged behavior', async () => {
  let seenHeaders;
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    seenHeaders = options.headers;
    return fakeOkResponse();
  };

  try {
    const sdk = new BaseSDK({ namespace: 'test', token: 'tok-123' });
    assert.equal(sdk._tokenDelivery, 'bearer');
    await runRequest(sdk, '/objects', 'GET', {});
    assert.equal(seenHeaders.Authorization, 'Bearer tok-123');
    assert.equal(seenHeaders.Cookie, undefined);
  } finally {
    global.fetch = originalFetch;
  }
});

test("tokenDelivery: 'cookie' sends Cookie: authToken=<token>, no Authorization", async () => {
  let seenHeaders;
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    seenHeaders = options.headers;
    return fakeOkResponse();
  };

  try {
    const sdk = new BaseSDK({
      namespace: 'test',
      token: 'cookie-tok-456',
      tokenDelivery: 'cookie',
    });
    assert.equal(sdk._tokenDelivery, 'cookie');
    await runRequest(sdk, '/objects', 'GET', {});
    assert.equal(seenHeaders.Authorization, undefined);
    assert.equal(seenHeaders.Cookie, 'authToken=cookie-tok-456');
  } finally {
    global.fetch = originalFetch;
  }
});

test("tokenDelivery: 'cookie' merges with a caller-supplied Cookie header", async () => {
  let seenHeaders;
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    seenHeaders = options.headers;
    return fakeOkResponse();
  };

  try {
    const sdk = new BaseSDK({
      namespace: 'test',
      token: 'cookie-tok-789',
      tokenDelivery: 'cookie',
    });
    await runRequest(sdk, '/objects', 'GET', {
      headers: { Cookie: 'sessionId=abc123' },
    });
    assert.equal(seenHeaders.Cookie, 'sessionId=abc123; authToken=cookie-tok-789');
  } finally {
    global.fetch = originalFetch;
  }
});

test("tokenDelivery: 'cookie' is passed through to transport plugins' options object", async () => {
  let seenOptions;
  const fakeTransport = {
    name: 'fake',
    getPriority: () => 10,
    isAvailable: async () => true,
    request: async (endpoint, method, params, options) => {
      seenOptions = options;
      return { ok: true, status: 200, statusText: 'OK', headers: { get: () => 'application/json' }, body: { ok: true } };
    },
  };

  const sdk = new BaseSDK({
    namespace: 'test',
    token: 'cookie-tok-xyz',
    tokenDelivery: 'cookie',
  });
  sdk.addTransport(fakeTransport);

  await runRequest(sdk, '/objects', 'GET', {});
  assert.equal(seenOptions.tokenDelivery, 'cookie');
});

test('setToken keeps working in cookie mode', async () => {
  let seenHeaders;
  const originalFetch = global.fetch;
  global.fetch = async (url, options) => {
    seenHeaders = options.headers;
    return fakeOkResponse();
  };

  try {
    const sdk = new BaseSDK({ namespace: 'test', tokenDelivery: 'cookie' });
    sdk.setToken('rotated-tok');
    await runRequest(sdk, '/objects', 'GET', {});
    assert.equal(seenHeaders.Cookie, 'authToken=rotated-tok');
  } finally {
    global.fetch = originalFetch;
  }
});

test('legacy positional constructor defaults to bearer', () => {
  const sdk = new BaseSDK('test-namespace', 'call-1', 'tok', 'fw-1');
  assert.equal(sdk._tokenDelivery, 'bearer');
});

test("UnboundSDK (index.js subclass) forwards tokenDelivery: 'cookie' to BaseSDK", async () => {
  const { default: UnboundSDK } = await import('../index.js');
  const cookieSdk = new UnboundSDK({ baseURL: 'http://x', token: 'T', tokenDelivery: 'cookie' });
  const bearerSdk = new UnboundSDK({ baseURL: 'http://x', token: 'T' });
  assert.equal(cookieSdk._tokenDelivery, 'cookie');
  assert.equal(bearerSdk._tokenDelivery, 'bearer');
});
