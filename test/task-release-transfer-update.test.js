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

describe('TaskService.release', () => {
  test('PUTs /taskRouter/tasks/release with all fields', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new TaskService(fakeSdk).release({
      taskId: 'task-1',
      mode: 'callback',
      reasonCode: 'callback_promised',
      reason: 'Promised a callback',
      callbackNumber: '+14155552671',
      humanOnly: false,
      hangup: false,
    });
    assert.equal(calls[0].endpoint, '/taskRouter/tasks/release');
    assert.equal(calls[0].method, 'PUT');
    assert.deepEqual(calls[0].params.body, {
      taskId: 'task-1',
      reasonCode: 'callback_promised',
      reason: 'Promised a callback',
      mode: 'callback',
      callbackNumber: '+14155552671',
      humanOnly: false,
      hangup: false,
    });
  });

  test('omits optional fields when not given', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new TaskService(fakeSdk).release({
      taskId: 'task-1',
      reasonCode: 'human_requested',
      reason: 'Caller asked for a human',
    });
    assert.deepEqual(calls[0].params.body, {
      taskId: 'task-1',
      reasonCode: 'human_requested',
      reason: 'Caller asked for a human',
    });
  });
});

describe('TaskService.transfer', () => {
  test('includes reasonCode/reason when given', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new TaskService(fakeSdk).transfer({
      taskId: 'task-1',
      target: { queueId: 'queue-2' },
      reasonCode: 'wrong_department',
      reason: 'Billing question',
    });
    assert.equal(calls[0].endpoint, '/taskRouter/tasks/transfer');
    assert.equal(calls[0].params.body.reasonCode, 'wrong_department');
    assert.equal(calls[0].params.body.reason, 'Billing question');
  });

  test('reasonCode/reason omitted for a plain human transfer', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new TaskService(fakeSdk).transfer({
      taskId: 'task-1',
      target: { queueId: 'queue-2' },
    });
    assert.equal('reasonCode' in calls[0].params.body, false);
    assert.equal('reason' in calls[0].params.body, false);
  });
});

describe('TaskService.update humanFollowUp', () => {
  test('sends humanFollowUp alongside botEligible in one call', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new TaskService(fakeSdk).update({
      taskId: 'task-1',
      botEligible: false,
      humanFollowUp: 'callback',
    });
    assert.equal(calls[0].params.body.botEligible, false);
    assert.equal(calls[0].params.body.humanFollowUp, 'callback');
  });

  test('humanFollowUp:null clears it', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new TaskService(fakeSdk).update({
      taskId: 'task-1',
      humanFollowUp: null,
    });
    assert.equal(calls[0].params.body.humanFollowUp, null);
  });

  test('omitted humanFollowUp is not sent', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new TaskService(fakeSdk).update({ taskId: 'task-1' });
    assert.equal('humanFollowUp' in calls[0].params.body, false);
  });
});
