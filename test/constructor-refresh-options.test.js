import { test } from 'node:test';
import assert from 'node:assert/strict';
import UnboundSDK from '../index.js';

test('UnboundSDK forwards autoRefresh, onUnauthorized and refreshToken to BaseSDK', () => {
  const onUnauthorized = () => {};
  const sdk = new UnboundSDK({
    namespace: 'test',
    baseURL: 'https://test.api.example.com',
    autoRefresh: true,
    onUnauthorized,
    refreshToken: 'raw-refresh',
  });
  assert.equal(sdk._autoRefresh, true);
  assert.equal(sdk._onUnauthorized, onUnauthorized);
  assert.equal(sdk._refreshToken, 'raw-refresh');
});

test('UnboundSDK leaves autoRefresh off by default', () => {
  const sdk = new UnboundSDK({ namespace: 'test' });
  assert.equal(sdk._autoRefresh, false);
  assert.equal(sdk._onUnauthorized, null);
});
