import { test } from 'node:test';
import assert from 'node:assert/strict';
import { LicensesService } from '../services/licenses.js';

function fakeSdk() {
  const calls = [];
  const sdk = {
    validateParams(params, schema) {
      for (const key of Object.keys(schema)) {
        if (schema[key].required && params[key] === undefined) {
          throw new Error(`Missing required parameter ${key}`);
        }
      }
    },
  };
  sdk[Symbol.for('unbound.sdk.request')] = async (endpoint, method, params) => {
    calls.push({ endpoint, method, params });
    return { ok: true };
  };
  return { sdk, calls };
}

test('setUserStatus still PUTs /permissions/users/:userId/status', async () => {
  const { sdk, calls } = fakeSdk();
  await new LicensesService(sdk).setUserStatus('usr_1', 'suspended');
  assert.equal(calls[0].method, 'PUT');
  assert.equal(calls[0].endpoint, '/permissions/users/usr_1/status');
  assert.deepEqual(calls[0].params.body, { status: 'suspended' });
});

test('previewUserOffboard GETs the offboard preview', async () => {
  const { sdk, calls } = fakeSdk();
  await new LicensesService(sdk).previewUserOffboard('usr_1');
  assert.equal(calls[0].method, 'GET');
  assert.equal(calls[0].endpoint, '/permissions/users/usr_1/offboard/preview');
});

test('offboardUser POSTs { assignments }', async () => {
  const { sdk, calls } = fakeSdk();
  const assignments = {
    people: { mode: 'unassign' },
    mailboxes: { mode: 'reassign', userId: 'usr_2' },
  };
  await new LicensesService(sdk).offboardUser('usr_1', assignments);
  assert.equal(calls[0].method, 'POST');
  assert.equal(calls[0].endpoint, '/permissions/users/usr_1/offboard');
  assert.deepEqual(calls[0].params.body, { assignments });
});
