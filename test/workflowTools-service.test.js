import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { WorkflowToolsService, WorkflowMcpTokensService } from '../services/workflowTools.js';

function buildFakeSdk(response = {}) {
  const calls = [];
  const fakeSdk = {
    validateParams: () => {},
  };
  fakeSdk[Symbol.for('unbound.sdk.request')] = async (endpoint, method, params) => {
    calls.push({ endpoint, method, params });
    return response;
  };
  return { fakeSdk, calls };
}

describe('WorkflowToolsService.list', () => {
  test('GETs /workflows/tools', async () => {
    const { fakeSdk, calls } = buildFakeSdk({ tools: [] });
    const result = await new WorkflowToolsService(fakeSdk).list();
    assert.equal(calls[0].endpoint, '/workflows/tools');
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(result, { tools: [] });
  });
});

describe('WorkflowToolsService.call', () => {
  test('POSTs /workflows/tools/:slug/call with {input} body', async () => {
    const { fakeSdk, calls } = buildFakeSdk({ completed: true, outputs: { ok: true } });
    const result = await new WorkflowToolsService(fakeSdk).call('get-weather', { city: 'nyc' });
    assert.equal(calls[0].endpoint, '/workflows/tools/get-weather/call');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, { input: { city: 'nyc' } });
    assert.deepEqual(result, { completed: true, outputs: { ok: true } });
  });

  test('defaults input to {} when omitted', async () => {
    const { fakeSdk, calls } = buildFakeSdk({});
    await new WorkflowToolsService(fakeSdk).call('get-weather');
    assert.deepEqual(calls[0].params.body, { input: {} });
  });
});

describe('WorkflowMcpTokensService.create', () => {
  test('POSTs /workflows/mcp/tokens with an optional name', async () => {
    const { fakeSdk, calls } = buildFakeSdk({ id: 'tok1', token: 'raw', name: 'CI' });
    const result = await new WorkflowMcpTokensService(fakeSdk).create({ name: 'CI' });
    assert.equal(calls[0].endpoint, '/workflows/mcp/tokens');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, { name: 'CI' });
    assert.equal(result.token, 'raw');
  });

  test('omits name from the body when not given', async () => {
    const { fakeSdk, calls } = buildFakeSdk({});
    await new WorkflowMcpTokensService(fakeSdk).create();
    assert.deepEqual(calls[0].params.body, {});
  });
});

describe('WorkflowMcpTokensService.list', () => {
  test('GETs /workflows/mcp/tokens', async () => {
    const { fakeSdk, calls } = buildFakeSdk({ tokens: [] });
    await new WorkflowMcpTokensService(fakeSdk).list();
    assert.equal(calls[0].endpoint, '/workflows/mcp/tokens');
    assert.equal(calls[0].method, 'GET');
  });
});

describe('WorkflowMcpTokensService.revoke', () => {
  test('DELETEs /workflows/mcp/tokens/:id', async () => {
    const { fakeSdk, calls } = buildFakeSdk({ id: 'tok1', revoked: true });
    const result = await new WorkflowMcpTokensService(fakeSdk).revoke('tok1');
    assert.equal(calls[0].endpoint, '/workflows/mcp/tokens/tok1');
    assert.equal(calls[0].method, 'DELETE');
    assert.deepEqual(result, { id: 'tok1', revoked: true });
  });
});
