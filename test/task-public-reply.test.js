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
    return { emailId: 'em-1' };
  };
  return { fakeSdk, calls };
}

describe('TaskService.publicReply', () => {
  test('POSTs /taskRouter/tasks/:id/public-reply', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new TaskService(fakeSdk).publicReply({
      taskId: 'task-1',
      text: 'hello',
      extraCc: ['cc@example.com'],
    });
    assert.equal(calls[0].endpoint, '/taskRouter/tasks/task-1/public-reply');
    assert.equal(calls[0].method, 'POST');
    assert.equal(calls[0].params.body.text, 'hello');
    assert.deepEqual(calls[0].params.body.extraCc, ['cc@example.com']);
  });
});
