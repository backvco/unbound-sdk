import { test } from 'node:test';
import assert from 'node:assert/strict';
import { handleUnauthorized, shouldAttemptRefresh } from '../lib/refreshInterceptor.js';

function makeSdk({ autoRefresh = true, refreshImpl, onUnauthorized } = {}) {
  return {
    _autoRefresh: autoRefresh,
    _onUnauthorized: onUnauthorized,
    token: 'old-token',
    setToken(t) {
      this.token = t;
    },
    login: {
      refresh: refreshImpl || (async () => ({ token: 'new-token' })),
    },
  };
}

test('shouldAttemptRefresh :: false when autoRefresh is off', () => {
  const sdk = makeSdk({ autoRefresh: false });
  assert.equal(shouldAttemptRefresh(sdk, 401, '/objects'), false);
});

test('shouldAttemptRefresh :: false for /login* endpoints (never refresh a refresh)', () => {
  const sdk = makeSdk();
  assert.equal(shouldAttemptRefresh(sdk, 401, '/login/refresh'), false);
  assert.equal(shouldAttemptRefresh(sdk, 401, '/login'), false);
});

test('shouldAttemptRefresh :: false for non-401 status', () => {
  const sdk = makeSdk();
  assert.equal(shouldAttemptRefresh(sdk, 500, '/objects'), false);
});

test('shouldAttemptRefresh :: true for a 401 on a non-login endpoint with autoRefresh on', () => {
  const sdk = makeSdk();
  assert.equal(shouldAttemptRefresh(sdk, 401, '/objects'), true);
});

test('handleUnauthorized :: autoRefresh off :: rethrows original error without calling refresh', async () => {
  const sdk = makeSdk({ autoRefresh: false });
  let refreshCalled = false;
  sdk.login.refresh = async () => {
    refreshCalled = true;
    return {};
  };
  const originalError = new Error('401');
  await assert.rejects(
    () =>
      handleUnauthorized(sdk, {
        status: 401,
        endpoint: '/objects',
        originalError,
        retry: async () => 'should not run',
      }),
    (err) => err === originalError,
  );
  assert.equal(refreshCalled, false);
});

test('handleUnauthorized :: alreadyRetried :: rethrows without a second refresh (never loop)', async () => {
  const sdk = makeSdk();
  let refreshCalled = false;
  sdk.login.refresh = async () => {
    refreshCalled = true;
    return {};
  };
  const originalError = new Error('401');
  await assert.rejects(
    () =>
      handleUnauthorized(sdk, {
        status: 401,
        endpoint: '/objects',
        alreadyRetried: true,
        originalError,
        retry: async () => 'should not run',
      }),
    (err) => err === originalError,
  );
  assert.equal(refreshCalled, false);
});

test('handleUnauthorized :: happy path :: refreshes once, applies new token, retries once, returns retry result', async () => {
  const sdk = makeSdk();
  let retried = false;
  const result = await handleUnauthorized(sdk, {
    status: 401,
    endpoint: '/objects',
    originalError: new Error('401'),
    retry: async () => {
      retried = true;
      return { ok: true };
    },
  });
  assert.equal(sdk.token, 'new-token');
  assert.equal(retried, true);
  assert.deepEqual(result, { ok: true });
});

test('handleUnauthorized :: concurrent 401s share one refresh call (single-flight)', async () => {
  let refreshCalls = 0;
  const sdk = makeSdk({
    refreshImpl: async () => {
      refreshCalls += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { token: 'new-token' };
    },
  });

  const run = () =>
    handleUnauthorized(sdk, {
      status: 401,
      endpoint: '/objects',
      originalError: new Error('401'),
      retry: async () => 'ok',
    });

  await Promise.all([run(), run(), run()]);
  assert.equal(refreshCalls, 1);
});

test('handleUnauthorized :: refresh itself fails :: calls onUnauthorized, rethrows original error', async () => {
  let notified;
  const originalError = new Error('401');
  const sdk = makeSdk({
    refreshImpl: async () => {
      throw new Error('refresh_expired');
    },
    onUnauthorized: (err) => {
      notified = err;
    },
  });
  await assert.rejects(
    () =>
      handleUnauthorized(sdk, {
        status: 401,
        endpoint: '/objects',
        originalError,
        retry: async () => 'should not run',
      }),
    (err) => err === originalError,
  );
  assert.equal(notified, originalError);
});

test('handleUnauthorized :: retry itself comes back 401 :: calls onUnauthorized with the retry error, rethrows it', async () => {
  let notified;
  const retryError = Object.assign(new Error('still 401'), { status: 401 });
  const sdk = makeSdk({
    onUnauthorized: (err) => {
      notified = err;
    },
  });
  await assert.rejects(
    () =>
      handleUnauthorized(sdk, {
        status: 401,
        endpoint: '/objects',
        originalError: new Error('401'),
        retry: async () => {
          throw retryError;
        },
      }),
    (err) => err === retryError,
  );
  assert.equal(notified, retryError);
});
