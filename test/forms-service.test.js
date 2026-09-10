import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import UnboundSDK from '../index.js';
import { FormsService } from '../services/forms.js';
import { FormsPublicService } from '../services/forms/PublicService.js';
import { FormsSubmissionsService } from '../services/forms/SubmissionsService.js';
import { FormsSettingsService } from '../services/forms/SettingsService.js';

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

describe('UnboundSDK.forms', () => {
  test('is wired on the SDK instance', () => {
    const sdk = new UnboundSDK({ namespace: 't' });
    assert.ok(sdk.forms instanceof FormsService);
    assert.ok(sdk.forms.public instanceof FormsPublicService);
    assert.ok(sdk.forms.submissions instanceof FormsSubmissionsService);
    assert.ok(sdk.forms.settings instanceof FormsSettingsService);
    assert.equal(typeof sdk.forms.public.submit, 'function');
    assert.equal(typeof sdk.forms.public.upload, 'function');
    assert.equal(typeof sdk.forms.submissions.reprocess, 'function');
    assert.equal(typeof sdk.forms.submissions.markNotSpam, 'function');
    assert.equal(typeof sdk.forms.submissions.resolveReview, 'function');
    assert.equal(typeof sdk.forms.settings.get, 'function');
    assert.equal(typeof sdk.forms.settings.set, 'function');
  });
});

describe('FormsPublicService.submit', () => {
  test('POSTs /f/:publicKey with plain fields, forceFetch=true, no auth', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const result = await new FormsPublicService(fakeSdk).submit('270abc', {
      email: 'a@b.com',
      firstName: 'A',
    });
    assert.equal(calls[0].endpoint, '/f/270abc');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, {
      email: 'a@b.com',
      firstName: 'A',
    });
    assert.equal(calls[0].forceFetch, true);
    assert.deepEqual(result, { ok: true });
  });

  test('sends context/captchaToken/idempotencyKey as underscore control fields', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new FormsPublicService(fakeSdk).submit(
      '270abc',
      { email: 'a@b.com' },
      {
        context: { utm_source: 'x' },
        captchaToken: 'tok',
        idempotencyKey: 'idem1',
      },
    );
    assert.deepEqual(calls[0].params.body, {
      email: 'a@b.com',
      _idempotencyKey: 'idem1',
      _captchaToken: 'tok',
      _context: { utm_source: 'x' },
    });
  });

  test('omits control fields entirely when not provided', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new FormsPublicService(fakeSdk).submit('270abc', { email: 'a@b.com' });
    assert.deepEqual(Object.keys(calls[0].params.body), ['email']);
  });

  test('requires publicKey', async () => {
    const { fakeSdk } = buildFakeSdk();
    await assert.rejects(() =>
      new FormsPublicService(fakeSdk).submit(undefined, { email: 'a@b.com' }),
    );
  });

  test('does not require agent auth (no Authorization header added)', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new FormsPublicService(fakeSdk).submit('270abc', {});
    assert.equal(calls[0].params.headers, undefined);
  });
});

describe('FormsPublicService.upload', () => {
  test('POSTs /f/:publicKey/upload as FormData with fieldKey + file, forceFetch=true', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const file = new Blob(['x'], { type: 'application/pdf' });
    const result = await new FormsPublicService(fakeSdk).upload(
      '270abc',
      'resume',
      file,
    );
    assert.equal(calls[0].endpoint, '/f/270abc/upload');
    assert.equal(calls[0].method, 'POST');
    assert.ok(calls[0].params.body instanceof FormData);
    assert.equal(calls[0].params.body.get('fieldKey'), 'resume');
    assert.ok(calls[0].params.body.get('file'));
    assert.equal(calls[0].forceFetch, true);
    assert.deepEqual(result, { ok: true });
  });

  test('requires publicKey and fieldKey', async () => {
    const { fakeSdk } = buildFakeSdk();
    const file = new Blob(['x']);
    await assert.rejects(() =>
      new FormsPublicService(fakeSdk).upload(undefined, 'resume', file),
    );
    await assert.rejects(() =>
      new FormsPublicService(fakeSdk).upload('270abc', undefined, file),
    );
  });

  test('rejects without a file', async () => {
    const { fakeSdk } = buildFakeSdk();
    await assert.rejects(() =>
      new FormsPublicService(fakeSdk).upload('270abc', 'resume', null),
    );
  });
});

describe('FormsSubmissionsService', () => {
  test('reprocess POSTs /object/formSubmissions/:id/reprocess', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new FormsSubmissionsService(fakeSdk).reprocess('sub1');
    assert.equal(calls[0].endpoint, '/object/formSubmissions/sub1/reprocess');
    assert.equal(calls[0].method, 'POST');
    assert.equal(calls[0].forceFetch, false);
  });

  test('markNotSpam POSTs /object/formSubmissions/:id/mark-not-spam', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new FormsSubmissionsService(fakeSdk).markNotSpam('sub2');
    assert.equal(
      calls[0].endpoint,
      '/object/formSubmissions/sub2/mark-not-spam',
    );
    assert.equal(calls[0].method, 'POST');
  });

  test('resolveReview POSTs choice in the body', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new FormsSubmissionsService(fakeSdk).resolveReview('sub3', 'p1');
    assert.equal(
      calls[0].endpoint,
      '/object/formSubmissions/sub3/resolve-review',
    );
    assert.deepEqual(calls[0].params.body, { choice: 'p1' });
  });

  test('reprocess requires id', async () => {
    const { fakeSdk } = buildFakeSdk();
    await assert.rejects(() =>
      new FormsSubmissionsService(fakeSdk).reprocess(undefined),
    );
  });
});

describe('FormsSettingsService', () => {
  test('get() GETs /forms/settings', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new FormsSettingsService(fakeSdk).get();
    assert.equal(calls[0].endpoint, '/forms/settings');
    assert.equal(calls[0].method, 'GET');
  });

  test('set() PUTs the patch body', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new FormsSettingsService(fakeSdk).set({ defaultRegion: 'US' });
    assert.equal(calls[0].endpoint, '/forms/settings');
    assert.equal(calls[0].method, 'PUT');
    assert.deepEqual(calls[0].params.body, { defaultRegion: 'US' });
  });
});
