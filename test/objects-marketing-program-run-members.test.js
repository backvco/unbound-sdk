import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ObjectsService } from '../services/objects.js';

function buildFakeSdk() {
  const calls = [];
  const fakeSdk = {
    validateParams: () => {},
  };
  fakeSdk[Symbol.for('unbound.sdk.request')] = async (
    endpoint,
    method,
    params,
    forceFetch,
  ) => {
    calls.push({ endpoint, method, params, forceFetch });
    return { queued: true };
  };
  return { fakeSdk, calls };
}

describe('ObjectsService.runMarketingProgramNow', () => {
  test('POSTs /object/marketing-programs/:id/run', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const result = await new ObjectsService(fakeSdk).runMarketingProgramNow(
      'prog-1',
    );
    assert.equal(calls[0].endpoint, '/object/marketing-programs/prog-1/run');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, {});
    assert.deepEqual(result, { queued: true });
  });
});

describe('ObjectsService.listMarketingProgramMembers', () => {
  test('GETs /object/marketing-programs/:id/members with no opts', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new ObjectsService(fakeSdk).listMarketingProgramMembers('prog-1');
    assert.equal(
      calls[0].endpoint,
      '/object/marketing-programs/prog-1/members',
    );
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(calls[0].params.query, {});
  });

  test('GETs /object/marketing-programs/:id/members with nextId/limit', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new ObjectsService(fakeSdk).listMarketingProgramMembers('prog-1', {
      nextId: 'member-9',
      limit: 25,
    });
    assert.equal(
      calls[0].endpoint,
      '/object/marketing-programs/prog-1/members',
    );
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(calls[0].params.query, {
      nextId: 'member-9',
      limit: 25,
    });
  });
});
