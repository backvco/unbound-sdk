import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { AIService } from '../services/ai.js';
import { ModelsService } from '../services/ai/models.js';

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
    return { models: [], recommended: { modelId: 'bolt-fast' } };
  };
  return { fakeSdk, calls };
}

describe('AIService.models', () => {
  test('is a ModelsService on AIService', () => {
    const { fakeSdk } = buildFakeSdk();
    const svc = new AIService(fakeSdk);
    assert.ok(svc.models instanceof ModelsService);
  });

  test('list GETs /ai/models', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new AIService(fakeSdk).models.list();
    assert.equal(calls[0].endpoint, '/ai/models');
    assert.equal(calls[0].method, 'GET');
  });
});
