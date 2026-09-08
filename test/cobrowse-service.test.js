import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import UnboundSDK from '../index.js';
import { CobrowseService } from '../services/cobrowse.js';

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
    forceFetch,
  ) => {
    calls.push({ endpoint, method, params, forceFetch });
    return { ok: true };
  };
  return { fakeSdk, calls };
}

describe('UnboundSDK.cobrowse', () => {
  test('is wired on the SDK instance', () => {
    const sdk = new UnboundSDK({ namespace: 't' });
    assert.equal(typeof sdk.cobrowse.request, 'function');
    assert.equal(typeof sdk.cobrowse.end, 'function');
    assert.equal(typeof sdk.cobrowse.getActive, 'function');
    assert.equal(typeof sdk.cobrowse.visitor.accept, 'function');
    assert.equal(typeof sdk.cobrowse.visitor.deny, 'function');
    assert.equal(typeof sdk.cobrowse.visitor.end, 'function');
    assert.equal(typeof sdk.cobrowse.getRecording, 'function');
  });
});

describe('CobrowseService.request', () => {
  test('POSTs nested webchat cobrowse/request with mode+record', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new CobrowseService(fakeSdk).request({
      source: 'webchat',
      widgetId: 'w1',
      hostId: 'es1',
      mode: 'pointer',
      record: false,
    });
    assert.equal(
      calls[0].endpoint,
      '/webchat/widgets/w1/conversations/es1/cobrowse/request',
    );
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, { mode: 'pointer', record: false });
    assert.equal(calls[0].forceFetch, false);
  });

  test('accepts engagementSessionId as hostId alias', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new CobrowseService(fakeSdk).request({
      source: 'webchat',
      widgetId: 'w1',
      engagementSessionId: 'es2',
    });
    assert.equal(
      calls[0].endpoint,
      '/webchat/widgets/w1/conversations/es2/cobrowse/request',
    );
    assert.equal(calls[0].params.body.mode, 'pointer');
    assert.equal(calls[0].params.body.record, false);
  });

  test('rejects non-webchat source', async () => {
    const { fakeSdk } = buildFakeSdk();
    await assert.rejects(
      () =>
        new CobrowseService(fakeSdk).request({
          source: 'meet',
          widgetId: 'w1',
          hostId: 'm1',
        }),
      /webchat only/,
    );
  });
});

describe('CobrowseService.end', () => {
  test('POSTs nested cobrowse/:sid/end', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new CobrowseService(fakeSdk).end({
      sid: 'cb1',
      widgetId: 'w1',
      hostId: 'es1',
    });
    assert.equal(
      calls[0].endpoint,
      '/webchat/widgets/w1/conversations/es1/cobrowse/cb1/end',
    );
    assert.equal(calls[0].method, 'POST');
  });
});

describe('CobrowseService.getActive', () => {
  test('GETs nested cobrowse/active', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new CobrowseService(fakeSdk).getActive({
      source: 'webchat',
      widgetId: 'w1',
      hostId: 'es1',
    });
    assert.equal(
      calls[0].endpoint,
      '/webchat/widgets/w1/conversations/es1/cobrowse/active',
    );
    assert.equal(calls[0].method, 'GET');
  });
});

describe('CobrowseService.getRecording', () => {
  test('GETs nested cobrowse/:sid/recording over HTTP', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new CobrowseService(fakeSdk).getRecording({
      source: 'webchat',
      widgetId: 'w1',
      hostId: 'es1',
      sid: 'cb1',
    });
    assert.equal(
      calls[0].endpoint,
      '/webchat/widgets/w1/conversations/es1/cobrowse/cb1/recording',
    );
    assert.equal(calls[0].method, 'GET');
    assert.equal(calls[0].forceFetch, true);
  });
});

describe('CobrowseVisitorService', () => {
  for (const action of ['accept', 'deny', 'end']) {
    test(`${action} POSTs /webchat/:widgetId/cobrowse/${action} with session JWT`, async () => {
      const { fakeSdk, calls } = buildFakeSdk();
      await new CobrowseService(fakeSdk).visitor[action]({
        widgetId: 'w1',
        token: 'sess.jwt',
        sid: 'cb1',
      });
      assert.equal(calls[0].endpoint, `/webchat/w1/cobrowse/${action}`);
      assert.equal(calls[0].method, 'POST');
      assert.deepEqual(calls[0].params.body, { sid: 'cb1' });
      assert.equal(calls[0].params.headers.Authorization, 'Bearer sess.jwt');
      assert.equal(calls[0].forceFetch, true);
    });
  }
});
