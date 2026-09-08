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
    return { participants: [] };
  };
  return { fakeSdk, calls };
}

describe('ObjectsService.listParticipants', () => {
  test('GETs /object/:id/participants', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new ObjectsService(fakeSdk).listParticipants('eng-1');
    assert.equal(calls[0].endpoint, '/object/eng-1/participants');
    assert.equal(calls[0].method, 'GET');
  });
});

describe('ObjectsService.addParticipant / removeParticipant', () => {
  test('PUTs /object/:id/participants', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new ObjectsService(fakeSdk).addParticipant('eng-1', {
      email: 'cc@example.com',
    });
    assert.equal(calls[0].endpoint, '/object/eng-1/participants');
    assert.equal(calls[0].method, 'PUT');
    assert.equal(calls[0].params.body.email, 'cc@example.com');
  });

  test('DELETEs /object/:id/participants/:participantId', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new ObjectsService(fakeSdk).removeParticipant('eng-1', 'part-1');
    assert.equal(calls[0].endpoint, '/object/eng-1/participants/part-1');
    assert.equal(calls[0].method, 'DELETE');
  });
});
