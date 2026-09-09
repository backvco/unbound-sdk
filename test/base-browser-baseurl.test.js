import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Forms v2 P3 regression: a browser-environment SDK instance constructed
// with ONLY `baseURL` (no `namespace`) -- the exact shape
// sdk.forms.public / sdk.webchat.visitor need on a page that resolves its
// tenant server-side from an opaque key, never a namespace subdomain --
// used to build `fullUrl` as literal "https://undefined.<host>" (base.js
// setNamespace() always namespace-prefixed in the browser branch, with no
// guard mirroring the Node branch's `if (!this._constructorBaseURL)`).
// Caught via the marketing-site integration (leads.js), which is the
// first real caller to construct the SDK this way in a real browser
// bundle -- every existing test faked the request layer entirely (see
// forms-service.test.js's buildFakeSdk) and so never exercised this path.
//
// `environment` is decided once, in the constructor, by `typeof window`
// (base.js `_initializeEnvironment`) -- stub `global.window` BEFORE
// importing the module under test so the class picks the browser branch.
global.window = { location: { href: 'https://example.test/' } };
const { default: UnboundSDK } = await import('../index.js');

describe('BaseSDK browser + constructor baseURL (no namespace)', () => {
  test('fullUrl is the literal baseURL, not "https://undefined.<host>"', () => {
    const sdk = new UnboundSDK({ baseURL: 'https://api.dev-d01.app1svc.com' });
    assert.equal(sdk.environment, 'browser');
    assert.equal(sdk.fullUrl, 'https://api.dev-d01.app1svc.com');
  });

  test('a forceFetch call (e.g. sdk.forms.public.submit) hits that literal baseURL', async () => {
    const sdk = new UnboundSDK({ baseURL: 'https://api.dev-d01.app1svc.com' });
    let requestedUrl = null;
    globalThis.fetch = async (url) => {
      requestedUrl = url;
      return { ok: true, status: 200, json: async () => ({ ok: true }) };
    };
    await sdk.forms.public.submit('pubKeyTest', { email: 'a@b.com' });
    assert.equal(requestedUrl, 'https://api.dev-d01.app1svc.com/f/pubKeyTest');
  });

  test('namespace-only construction is unaffected (existing behavior)', () => {
    const sdk = new UnboundSDK({ namespace: 'masterc' });
    assert.equal(sdk.fullUrl, 'https://masterc.api.unbound.cx');
  });

  test('namespace passed ALONGSIDE baseURL still prefixes it (existing behavior)', () => {
    const sdk = new UnboundSDK({
      namespace: 'masterc',
      baseURL: 'https://api.dev-d01.app1svc.com',
    });
    assert.equal(sdk.fullUrl, 'https://masterc.dev-d01.app1svc.com');
  });
});
