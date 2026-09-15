import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { WebchatService } from '../services/webchat.js';

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
    return { message: { id: 'msg-1' } };
  };
  return { fakeSdk, calls };
}

describe('WebchatService.sendOnTask', () => {
  test('POSTs /webchat/tasks/:taskId/messages', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new WebchatService(fakeSdk).sendOnTask({
      taskId: 'task-1',
      message: 'hello',
    });
    assert.equal(calls[0].endpoint, '/webchat/tasks/task-1/messages');
    assert.equal(calls[0].method, 'POST');
    assert.equal(calls[0].params.body.message, 'hello');
  });

  test('forwards media and card', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const card = { schemaVersion: 1, blocks: [] };
    await new WebchatService(fakeSdk).sendOnTask({
      taskId: 'task-2',
      media: { storageId: 's1' },
      card,
    });
    assert.deepEqual(calls[0].params.body.media, { storageId: 's1' });
    assert.deepEqual(calls[0].params.body.card, card);
  });
});
