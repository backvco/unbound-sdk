import { test, describe } from 'node:test';
import assert from 'node:assert/strict';

// Marketing-site regression: `new BaseSDK({ baseURL })` threw
// `ReferenceError: process is not defined` in a Vite/browser bundle.
// base.js read `process?.env?.namespace` / `process?.env?.API_BASE_URL` in
// several places -- optional chaining only guards *property access*, it
// does NOT protect a bare reference to an undeclared global identifier, so
// merely evaluating `process` throws in a browser bundle (no `process`
// global, no Node polyfill). The fix: a module-level `env(key)` helper that
// gates on `typeof process !== 'undefined'` before ever touching `process`.
//
// This test simulates that exact browser condition -- `window` stubbed
// (so BaseSDK picks the browser branch) and `process` deleted from
// `globalThis` (so any bare `process` reference throws exactly like a
// browser bundle) -- and proves construction no longer throws.
//
// `environment` is decided once, in the constructor, by `typeof window`
// (base.js `_initializeEnvironment`), and `env()` is evaluated per-call --
// both stubs must be in place BEFORE importing the module under test.
global.window = { location: { href: 'https://example.test/' } };
const savedProcess = globalThis.process;
delete globalThis.process;

let UnboundSDK;
let env;
try {
  ({ default: UnboundSDK } = await import('../index.js'));
  ({ env } = await import('../base.js'));
} finally {
  // Restore immediately after import so the rest of the Node test runner
  // (assert, node:test internals, etc.) keeps working normally.
  globalThis.process = savedProcess;
}

describe('BaseSDK construction with no `process` global (browser bundle simulation)', () => {
  test('new BaseSDK({ baseURL }) does not throw ReferenceError: process is not defined', () => {
    assert.doesNotThrow(() => {
      const sdk = new UnboundSDK({ baseURL: 'https://api.dev-d01.app1svc.com' });
      assert.equal(sdk.environment, 'browser');
      assert.equal(sdk.fullUrl, 'https://api.dev-d01.app1svc.com');
    });
  });

  test('new BaseSDK({ namespace }) with no `process` global falls back cleanly', () => {
    assert.doesNotThrow(() => {
      const sdk = new UnboundSDK({ namespace: 'masterc' });
      assert.equal(sdk.fullUrl, 'https://masterc.api.unbound.cx');
    });
  });

  test('env() helper returns undefined (rather than throwing) when `process` is absent', () => {
    delete globalThis.process;
    try {
      assert.equal(env('API_BASE_URL'), undefined);
    } finally {
      globalThis.process = savedProcess;
    }
  });
});
