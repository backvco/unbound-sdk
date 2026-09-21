import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { AIService } from '../services/ai.js';

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
    return { response: 'ok' };
  };
  return { fakeSdk, calls };
}

// Contracts §9: usageContext is telemetry-only attribution on generative.chat.
describe('AIService.generative.chat :: usageContext', () => {
  test('omitted usageContext is not sent in the body at all', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new AIService(fakeSdk).generative.chat({
      messages: [{ role: 'user', content: 'hi' }],
    });
    assert.equal('usageContext' in calls[0].params.body, false);
  });

  test('a passed usageContext is forwarded in the body untouched', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const usageContext = { feature: 'sentiment', taskId: 'task-9' };
    await new AIService(fakeSdk).generative.chat({
      messages: [{ role: 'user', content: 'hi' }],
      usageContext,
    });
    assert.deepEqual(calls[0].params.body.usageContext, usageContext);
  });
});
