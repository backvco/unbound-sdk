import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { WorkflowSessionsService, WorkflowsService } from '../services/workflows.js';
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

describe('WorkflowsService.references (delete guard)', () => {
  test('forwards workflowId as a query param', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new WorkflowsService(fakeSdk).references({ workflowId: 'wf-1' });
    assert.equal(calls[0].endpoint, '/workflows/references');
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(calls[0].params.query, { workflowId: 'wf-1' });
  });

  test('forwards workflowVersionId as a query param', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new WorkflowsService(fakeSdk).references({
      workflowVersionId: 'wfv-1',
    });
    assert.equal(calls[0].endpoint, '/workflows/references');
    assert.deepEqual(calls[0].params.query, { workflowVersionId: 'wfv-1' });
  });
});

describe('WorkflowsService.listModules (P3)', () => {
  test('no-arg call keeps the empty-query behaviour', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new WorkflowsService(fakeSdk).listModules();
    assert.equal(calls[0].endpoint, '/workflows/modules');
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(calls[0].params.query, {});
  });

  test('forwards workflowType as a query param', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new WorkflowsService(fakeSdk).listModules({ workflowType: 'ivr' });
    assert.equal(calls[0].endpoint, '/workflows/modules');
    assert.deepEqual(calls[0].params.query, { workflowType: 'ivr' });
  });
});

describe('WorkflowsService.variables (P6)', () => {
  test('GETs /workflows/:versionId/variables', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new WorkflowsService(fakeSdk).variables('ver-1');
    assert.equal(calls[0].endpoint, '/workflows/ver-1/variables');
    assert.equal(calls[0].method, 'GET');
  });
});
