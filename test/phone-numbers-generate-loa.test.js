import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { PhoneNumbersService } from '../services/phoneNumbers.js';

function buildFakeSdk() {
  const calls = [];
  const fakeSdk = {
    validateParams: () => {},
  };
  fakeSdk[Symbol.for('unbound.sdk.request')] = async (
    endpoint,
    method,
    params,
  ) => {
    calls.push({ endpoint, method, params });
    return { packageId: '210p', status: 'sent' };
  };
  return { fakeSdk, calls };
}

describe('PhoneNumbersService.generateLoa', () => {
  test('POSTs mode send with email', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new PhoneNumbersService(fakeSdk).generateLoa({
      portingOrderId: '103ord',
      signerName: 'Pat',
      signerEmail: 'pat@acme.test',
      mode: 'send',
    });
    assert.match(calls[0].endpoint, /generate-loa$/);
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, {
      signerName: 'Pat',
      mode: 'send',
      signerEmail: 'pat@acme.test',
    });
  });

  test('present omits email when not passed', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new PhoneNumbersService(fakeSdk).generateLoa({
      portingOrderId: '103ord',
      signerName: 'Pat',
      mode: 'present',
    });
    assert.deepEqual(calls[0].params.body, {
      signerName: 'Pat',
      mode: 'present',
    });
  });
});
