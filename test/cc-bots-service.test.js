import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { CcBotsService } from '../services/taskRouter/CcBotsService.js';

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
    return { id: 'bot-1' };
  };
  return { fakeSdk, calls };
}

describe('CcBotsService', () => {
  test('list GETs /taskRouter/ccBots', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new CcBotsService(fakeSdk).list();
    assert.equal(calls[0].endpoint, '/taskRouter/ccBots');
    assert.equal(calls[0].method, 'GET');
  });

  test('create POSTs name and slug', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new CcBotsService(fakeSdk).create({
      name: 'Sales Bot',
      slug: 'sales',
      soulMd: 'Be brief.',
    });
    assert.equal(calls[0].method, 'POST');
    assert.equal(calls[0].params.body.name, 'Sales Bot');
    assert.equal(calls[0].params.body.slug, 'sales');
    assert.equal(calls[0].params.body.soulMd, 'Be brief.');
  });

  test('update PATCHes soul and pause', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new CcBotsService(fakeSdk).update('bot-1', {
      soulMd: 'Calm.',
      paused: true,
    });
    assert.equal(calls[0].endpoint, '/taskRouter/ccBots/bot-1');
    assert.equal(calls[0].method, 'PATCH');
    assert.equal(calls[0].params.body.paused, true);
  });

  test('addToQueue POSTs queueId', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new CcBotsService(fakeSdk).addToQueue('bot-1', { queueId: 'q1' });
    assert.equal(calls[0].endpoint, '/taskRouter/ccBots/bot-1/queues');
    assert.equal(calls[0].params.body.queueId, 'q1');
  });
});
