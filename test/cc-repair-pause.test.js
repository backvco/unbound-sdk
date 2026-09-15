import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import UnboundSDK from '../index.js';
import { CCService } from '../services/taskRouter/CCService.js';
import { WorkerService } from '../services/taskRouter/WorkerService.js';
import { buildPausedBody } from '../services/taskRouter/workerPaused.js';

function buildFakeSdk() {
  const calls = [];
  const fakeSdk = {
    validateParams(params, schema) {
      for (const key in schema) {
        if (params[key] === undefined && schema[key].required) {
          throw new Error(`Missing required parameter ${key}`);
        }
      }
    },
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

describe('UnboundSDK.taskRouter.cc / worker pause-repair wiring', () => {
  test('exposes repair, unlock alias, pause reasons, and pause methods', () => {
    const sdk = new UnboundSDK({ namespace: 't' });
    assert.equal(typeof sdk.taskRouter.cc.repairWorker, 'function');
    assert.equal(typeof sdk.taskRouter.cc.unlockWorker, 'function');
    assert.equal(typeof sdk.taskRouter.cc.listPauseReasons, 'function');
    assert.equal(typeof sdk.taskRouter.cc.createPauseReason, 'function');
    assert.equal(typeof sdk.taskRouter.cc.updatePauseReason, 'function');
    assert.equal(typeof sdk.taskRouter.cc.deletePauseReason, 'function');
    assert.equal(typeof sdk.taskRouter.worker.setPaused, 'function');
    assert.equal(typeof sdk.taskRouter.worker.setWorkerPaused, 'function');
  });
});

describe('buildPausedBody', () => {
  test('unpause is paused:false only', () => {
    assert.deepEqual(
      buildPausedBody({
        paused: false,
        reasonId: 'ignored',
        reasonNote: 'ignored',
      }),
      { paused: false },
    );
  });

  test('pause includes reasonId and optional reasonNote', () => {
    assert.deepEqual(buildPausedBody({ paused: true, reasonId: 'r1' }), {
      paused: true,
      reasonId: 'r1',
    });
    assert.deepEqual(
      buildPausedBody({
        paused: true,
        reasonId: 'r-other',
        reasonNote: 'Doctor',
      }),
      { paused: true, reasonId: 'r-other', reasonNote: 'Doctor' },
    );
  });
});

describe('CCService.repairWorker / unlockWorker', () => {
  test('repairWorker POSTs /taskRouter/cc/workers/:workerId/repair', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new CCService(fakeSdk).repairWorker({ workerId: 'w1' });
    assert.equal(calls[0].endpoint, '/taskRouter/cc/workers/w1/repair');
    assert.equal(calls[0].method, 'POST');
  });

  test('unlockWorker remains a transition alias on /unlock', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new CCService(fakeSdk).unlockWorker({ workerId: 'w1' });
    assert.equal(calls[0].endpoint, '/taskRouter/cc/workers/w1/unlock');
    assert.equal(calls[0].method, 'POST');
  });

  test('repairWorker requires workerId', async () => {
    const { fakeSdk } = buildFakeSdk();
    await assert.rejects(
      () => new CCService(fakeSdk).repairWorker({}),
      /Missing required parameter workerId/,
    );
  });
});

describe('CCService pause reasons', () => {
  test('listPauseReasons GETs /taskRouter/cc/pauseReasons', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new CCService(fakeSdk).listPauseReasons();
    assert.equal(calls[0].endpoint, '/taskRouter/cc/pauseReasons');
    assert.equal(calls[0].method, 'GET');
  });

  test('createPauseReason POSTs label and optional fields', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new CCService(fakeSdk).createPauseReason({
      label: 'Shift huddle',
      order: 7,
      isEnabled: true,
    });
    assert.equal(calls[0].endpoint, '/taskRouter/cc/pauseReasons');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, {
      label: 'Shift huddle',
      order: 7,
      isEnabled: true,
    });
  });

  test('updatePauseReason PUTs /taskRouter/cc/pauseReasons/:id', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new CCService(fakeSdk).updatePauseReason({
      id: 'reason-other',
      isEnabled: false,
    });
    assert.equal(calls[0].endpoint, '/taskRouter/cc/pauseReasons/reason-other');
    assert.equal(calls[0].method, 'PUT');
    assert.deepEqual(calls[0].params.body, { isEnabled: false });
  });

  test('deletePauseReason DELETEs /taskRouter/cc/pauseReasons/:id', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new CCService(fakeSdk).deletePauseReason({ id: 'reason-custom' });
    assert.equal(
      calls[0].endpoint,
      '/taskRouter/cc/pauseReasons/reason-custom',
    );
    assert.equal(calls[0].method, 'DELETE');
  });
});

describe('WorkerService.setPaused / setWorkerPaused', () => {
  test('setPaused requires reasonId when pausing', async () => {
    const { fakeSdk } = buildFakeSdk();
    await assert.rejects(
      () => new WorkerService(fakeSdk).setPaused({ paused: true }),
      /Missing required parameter reasonId/,
    );
  });

  test('setPaused PUTs /workers/me/paused with reasonId', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new WorkerService(fakeSdk).setPaused({
      paused: true,
      reasonId: 'reason-lunch',
    });
    assert.equal(calls[0].endpoint, '/taskRouter/workers/me/paused');
    assert.equal(calls[0].method, 'PUT');
    assert.deepEqual(calls[0].params.body, {
      paused: true,
      reasonId: 'reason-lunch',
    });
  });

  test('setPaused unpause body is paused:false only', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new WorkerService(fakeSdk).setPaused({
      paused: false,
      reasonId: 'ignored',
    });
    assert.deepEqual(calls[0].params.body, { paused: false });
  });

  test('setWorkerPaused PUTs /workers/:workerId/paused with reasonNote', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new WorkerService(fakeSdk).setWorkerPaused({
      workerId: 'w9',
      paused: true,
      reasonId: 'reason-other',
      reasonNote: 'Doctor appointment',
    });
    assert.equal(calls[0].endpoint, '/taskRouter/workers/w9/paused');
    assert.equal(calls[0].method, 'PUT');
    assert.deepEqual(calls[0].params.body, {
      paused: true,
      reasonId: 'reason-other',
      reasonNote: 'Doctor appointment',
    });
  });
});
