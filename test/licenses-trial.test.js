import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LicensesService } from '../services/licenses.js';

test('setBrandAccountTrial PUTs isTrial and accountExpiresAt', async () => {
  const calls = [];
  const fakeSdk = { validateParams: () => {} };
  fakeSdk[Symbol.for('unbound.sdk.request')] = async (endpoint, method, params) => {
    calls.push({ endpoint, method, params });
    return { accountId: 'acct-123', isTrial: false, accountExpiresAt: null };
  };
  const result = await new LicensesService(fakeSdk).setBrandAccountTrial('acct-123', {
    isTrial: false,
    accountExpiresAt: null,
  });
  assert.equal(calls[0].method, 'PUT');
  assert.equal(calls[0].endpoint, '/permissions/brand/accounts/acct-123/trial');
  assert.deepEqual(calls[0].params.body, { isTrial: false, accountExpiresAt: null });
  assert.equal(result.isTrial, false);
});
