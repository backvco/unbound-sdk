import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { TaskService } from '../services/taskRouter/TaskService.js';

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

describe('TaskService.typing', () => {
  test('POSTs /taskRouter/tasks/:id/typing', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new TaskService(fakeSdk).typing({
      taskId: 'task-1',
      channel: 'sms',
      isTyping: true,
    });
    assert.equal(calls[0].endpoint, '/taskRouter/tasks/task-1/typing');
    assert.equal(calls[0].method, 'POST');
    assert.equal(calls[0].params.body.channel, 'sms');
    assert.equal(calls[0].params.body.isTyping, true);
  });
});
