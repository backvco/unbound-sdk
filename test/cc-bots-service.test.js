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

  test('update PATCHes mediaProvider and mediaModel', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new CcBotsService(fakeSdk).update('bot-1', {
      mediaProvider: 'groq',
      mediaModel: 'qwen/qwen3.6-27b',
    });
    assert.equal(calls[0].params.body.mediaProvider, 'groq');
    assert.equal(calls[0].params.body.mediaModel, 'qwen/qwen3.6-27b');
  });

  test('update PATCHes voiceId', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new CcBotsService(fakeSdk).update('bot-1', { voiceId: 'hannah' });
    assert.equal(calls[0].params.body.voiceId, 'hannah');
  });

  test('update PATCHes profilePhoto', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new CcBotsService(fakeSdk).update('bot-1', {
      profilePhoto: 'graham-v2-f',
    });
    assert.equal(calls[0].params.body.profilePhoto, 'graham-v2-f');
  });

  test('update PATCHes acceptChannels and useChannels', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new CcBotsService(fakeSdk).update('bot-1', {
      acceptChannels: ['phoneCall', 'text'],
      useChannels: ['text', 'email'],
    });
    assert.deepEqual(calls[0].params.body.acceptChannels, [
      'phoneCall',
      'text',
    ]);
    assert.deepEqual(calls[0].params.body.useChannels, ['text', 'email']);
  });

  test('update PATCHes group inherit fields', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new CcBotsService(fakeSdk).update('bot-1', {
      groupId: 'g1',
      additionalDetails: 'Promo.',
      inherit: { soulMd: 'group' },
    });
    assert.equal(calls[0].params.body.groupId, 'g1');
    assert.equal(calls[0].params.body.additionalDetails, 'Promo.');
    assert.equal(calls[0].params.body.inherit.soulMd, 'group');
  });

  test('clone POSTs name', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new CcBotsService(fakeSdk).clone('bot-1', { name: 'Sales Bot 1' });
    assert.equal(calls[0].endpoint, '/taskRouter/ccBots/bot-1/clone');
    assert.equal(calls[0].method, 'POST');
    assert.equal(calls[0].params.body.name, 'Sales Bot 1');
  });

  test('bulkPaused POSTs ids', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new CcBotsService(fakeSdk).bulkPaused({
      ids: ['bot-1'],
      paused: true,
    });
    assert.equal(calls[0].endpoint, '/taskRouter/ccBots/bulkPaused');
    assert.equal(calls[0].params.body.paused, true);
  });

  test('listGroups GETs /taskRouter/ccBotGroups', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new CcBotsService(fakeSdk).listGroups();
    assert.equal(calls[0].endpoint, '/taskRouter/ccBotGroups');
  });

  test('addToQueue POSTs queueId', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new CcBotsService(fakeSdk).addToQueue('bot-1', { queueId: 'q1' });
    assert.equal(calls[0].endpoint, '/taskRouter/ccBots/bot-1/queues');
    assert.equal(calls[0].params.body.queueId, 'q1');
  });
});
