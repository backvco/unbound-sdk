import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  simRules,
  SIM_NUMBER_RE,
  SIM_EMAIL_DOMAIN,
  isSimNumber,
  isSimEmail,
  simModeKey,
} from '../lib/simRules.js';
import { InternalSimService } from '../services/internal/SimService.js';

describe('simRules', () => {
  test('SIM_NUMBER_RE / isSimNumber match only +1555NXXXXXX', () => {
    assert.equal(isSimNumber('+15551234567'), true);
    assert.equal(isSimNumber('+14255551234'), false);
    assert.equal(isSimNumber('5551234567'), false);
    assert.equal(isSimNumber(''), false);
    assert.equal(isSimNumber(null), false);
    assert.equal(SIM_NUMBER_RE.test('+15559999999'), true);
  });

  test('isSimEmail matches only the sim.invalid domain', () => {
    assert.equal(SIM_EMAIL_DOMAIN, 'sim.invalid');
    assert.equal(isSimEmail('agent@sim.invalid'), true);
    assert.equal(isSimEmail('agent@SIM.INVALID'), true);
    assert.equal(isSimEmail('agent@gmail.com'), false);
    assert.equal(isSimEmail('not-an-email'), false);
    assert.equal(isSimEmail(undefined), false);
  });

  test('simModeKey is unprefixed', () => {
    assert.equal(simModeKey('009abc'), 'sim:mode:009abc');
  });

  test('simRules object bundles the same functions/constants', () => {
    assert.equal(simRules.isSimNumber, isSimNumber);
    assert.equal(simRules.isSimEmail, isSimEmail);
    assert.equal(simRules.simModeKey, simModeKey);
    assert.equal(simRules.SIM_NUMBER_RE, SIM_NUMBER_RE);
    assert.equal(simRules.SIM_EMAIL_DOMAIN, SIM_EMAIL_DOMAIN);
  });
});

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
    return { ok: true };
  };
  return { fakeSdk, calls };
}

describe('InternalSimService', () => {
  test('mode.set POSTs /internal/sim/mode', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new InternalSimService(fakeSdk).mode.set({
      accountId: 'acct1',
      ttlSeconds: 120,
    });
    assert.equal(calls[0].endpoint, '/internal/sim/mode');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, {
      accountId: 'acct1',
      ttlSeconds: 120,
    });
  });

  test('mode.clear DELETEs /internal/sim/mode with query', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new InternalSimService(fakeSdk).mode.clear({ accountId: 'acct1' });
    assert.equal(calls[0].endpoint, '/internal/sim/mode');
    assert.equal(calls[0].method, 'DELETE');
    assert.deepEqual(calls[0].params.query, { accountId: 'acct1' });
  });

  test('mode.get GETs /internal/sim/mode with query', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new InternalSimService(fakeSdk).mode.get({ accountId: 'acct1' });
    assert.equal(calls[0].endpoint, '/internal/sim/mode');
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(calls[0].params.query, { accountId: 'acct1' });
  });

  test('dids.create POSTs /internal/sim/dids', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const numbers = [
      { phoneNumber: '+15551234567', voiceApp: 'queues', voiceAppMetaData: 'q1' },
    ];
    await new InternalSimService(fakeSdk).dids.create({
      accountId: 'acct1',
      numbers,
    });
    assert.equal(calls[0].endpoint, '/internal/sim/dids');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, { accountId: 'acct1', numbers });
  });

  test('dids.list GETs /internal/sim/dids', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new InternalSimService(fakeSdk).dids.list({ accountId: 'acct1' });
    assert.equal(calls[0].endpoint, '/internal/sim/dids');
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(calls[0].params.query, { accountId: 'acct1' });
  });

  test('purge POSTs /internal/sim/purge', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new InternalSimService(fakeSdk).purge({
      accountId: 'acct1',
      runId: 'run1',
      dryRun: true,
    });
    assert.equal(calls[0].endpoint, '/internal/sim/purge');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, {
      accountId: 'acct1',
      runId: 'run1',
      dryRun: true,
    });
  });

  test('userToken POSTs /internal/auth/sim-user-token', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new InternalSimService(fakeSdk).userToken({
      userId: 'u1',
      accountId: 'acct1',
    });
    assert.equal(calls[0].endpoint, '/internal/auth/sim-user-token');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, { userId: 'u1', accountId: 'acct1' });
  });

  test('smsInbound POSTs /internal/sms/sim-inbound', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new InternalSimService(fakeSdk).smsInbound({
      to: '+15551234567',
      from: '+15557654321',
      text: 'hi',
    });
    assert.equal(calls[0].endpoint, '/internal/sms/sim-inbound');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, {
      to: '+15551234567',
      from: '+15557654321',
      text: 'hi',
      mediaUrls: undefined,
    });
  });

  test('emailInbound POSTs /internal/email/sim-inbound', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new InternalSimService(fakeSdk).emailInbound({
      receivedAddress: 'sim-queue@masterc.unbound.cx',
      rawMime: 'From: a@sim.invalid\n\nhi',
    });
    assert.equal(calls[0].endpoint, '/internal/email/sim-inbound');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, {
      receivedAddress: 'sim-queue@masterc.unbound.cx',
      rawMime: 'From: a@sim.invalid\n\nhi',
    });
  });
});
