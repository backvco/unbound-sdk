import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { TaskService } from '../services/taskRouter/TaskService.js';

function buildFakeSdk(response = { ok: true }) {
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
    return response;
  };
  return { fakeSdk, calls };
}

describe('TaskService.getUtterances', () => {
  test('GETs /taskRouter/tasks/:id/utterances with no query by default', async () => {
    const utterances = [{ index: 0, channel: 'sms', role: 'agent', text: 'hi' }];
    const { fakeSdk, calls } = buildFakeSdk(utterances);
    const result = await new TaskService(fakeSdk).getUtterances('task-1');
    assert.equal(calls[0].endpoint, '/taskRouter/tasks/task-1/utterances');
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(calls[0].params.query, {});
    assert.deepEqual(result, utterances);
  });

  test('passes a before cursor in the query when given', async () => {
    const { fakeSdk, calls } = buildFakeSdk([]);
    await new TaskService(fakeSdk).getUtterances('task-1', { before: '2026-10-01T00:00:00.000Z' });
    assert.equal(calls[0].endpoint, '/taskRouter/tasks/task-1/utterances');
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(calls[0].params.query, { before: '2026-10-01T00:00:00.000Z' });
  });
});
