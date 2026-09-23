import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { WorkflowSessionsService } from '../services/workflows.js';
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
    return { id: 'session-1' };
  };
  fakeSdk.objects = new ObjectsService(fakeSdk);
  return { fakeSdk, calls };
}

describe('WorkflowSessionsService.get', () => {
  test('GETs /object/:id via the generic objects.byId pattern (items.get parity)', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new WorkflowSessionsService(fakeSdk).get('session-1');
    assert.equal(calls[0].endpoint, '/object/session-1');
    assert.equal(calls[0].method, 'GET');
    assert.equal(calls[0].params.query.object, 'workflowSessions');
  });
});

describe('WorkflowSessionsService dead-method removal (W24)', () => {
  test('delete() is no longer part of the SDK surface', () => {
    const { fakeSdk } = buildFakeSdk();
    assert.equal(
      typeof new WorkflowSessionsService(fakeSdk).delete,
      'undefined',
    );
  });
});
