import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { MessageTemplatesService } from '../services/messageTemplates.js';

/**
 * Minimal SDK double capturing internalRequest calls. Mirrors
 * test/journeys-service.test.js's buildFakeSdk shape.
 */
function buildFakeSdk() {
  const calls = [];
  const fakeSdk = {
    validateParams: () => {}, // accept anything
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

function service(fakeSdk) {
  return new MessageTemplatesService(fakeSdk);
}

describe('messageTemplates.templates.preview', () => {
  test('hits /templates/:id/preview when templateId is given', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await service(fakeSdk).templates.preview({
      templateId: 'tpl-1',
      peopleId: 'ppl-1',
    });

    assert.equal(calls[0].endpoint, '/messageTemplates/templates/tpl-1/preview');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, {
      templateId: 'tpl-1',
      body: undefined,
      peopleId: 'ppl-1',
    });
  });

  test('hits /templates/preview when only a raw body is given', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await service(fakeSdk).templates.preview({ body: 'Hi {{people.firstName}}' });

    assert.equal(calls[0].endpoint, '/messageTemplates/templates/preview');
    assert.equal(calls[0].method, 'POST');
  });

  test('throws without templateId or body', async () => {
    const { fakeSdk } = buildFakeSdk();

    await assert.rejects(() => service(fakeSdk).templates.preview({}));
  });
});

describe('messageTemplates.templates.sendTest', () => {
  test('posts to /templates/:id/sendTest', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await service(fakeSdk).templates.sendTest('tpl-1');

    assert.equal(calls[0].endpoint, '/messageTemplates/templates/tpl-1/sendTest');
    assert.equal(calls[0].method, 'POST');
  });
});

describe('messageTemplates.templates.usage', () => {
  test('gets /templates/:id/usage', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await service(fakeSdk).templates.usage('tpl-1');

    assert.equal(calls[0].endpoint, '/messageTemplates/templates/tpl-1/usage');
    assert.equal(calls[0].method, 'GET');
  });
});

describe('messageTemplates.templates.versions', () => {
  test('list gets /templates/:id/versions', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await service(fakeSdk).templates.versions.list('tpl-1');

    assert.equal(calls[0].endpoint, '/messageTemplates/templates/tpl-1/versions');
    assert.equal(calls[0].method, 'GET');
  });

  test('restore posts to /templates/:id/versions/:version/restore', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await service(fakeSdk).templates.versions.restore('tpl-1', 2);

    assert.equal(
      calls[0].endpoint,
      '/messageTemplates/templates/tpl-1/versions/2/restore',
    );
    assert.equal(calls[0].method, 'POST');
  });
});

describe('messageTemplates.templates.create/update media', () => {
  test('create forwards media in the body', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await service(fakeSdk).templates.create({
      groupId: 'grp-1',
      name: 'Welcome',
      slug: 'welcome',
      body: 'Hi {{people.firstName}}',
      media: [{ url: 'https://x/y.png', type: 'image' }],
    });

    assert.equal(calls[0].endpoint, '/messageTemplates/templates');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body.media, [
      { url: 'https://x/y.png', type: 'image' },
    ]);
  });

  test('update forwards media in the body', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await service(fakeSdk).templates.update('tpl-1', {
      media: [{ url: 'https://x/z.mp4', type: 'video' }],
    });

    assert.equal(calls[0].endpoint, '/messageTemplates/templates/tpl-1');
    assert.equal(calls[0].method, 'PUT');
    assert.deepEqual(calls[0].params.body.media, [
      { url: 'https://x/z.mp4', type: 'video' },
    ]);
  });
});
