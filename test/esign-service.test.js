import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { EsignService } from '../services/esign.js';

/**
 * Build a minimal SDK double that EsignService can call into. Captures
 * request calls for inspection. Mirrors test/storage-drive-service.test.js.
 */
function buildFakeSdk() {
  const calls = [];
  const fakeSdk = {
    validateParams: () => {},
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

function esign(fakeSdk) {
  return new EsignService(fakeSdk);
}

describe('EsignService.createPackage', () => {
  test('POSTs /esign/packages with defined fields', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const recipients = [{ roleKey: 'customer', email: 'a@b.co' }];

    await esign(fakeSdk).createPackage({
      generatedDocumentId: '177abc',
      name: 'NDA',
      recipients,
      routing: 'parallel',
      links: [{ objectName: 'people', recordId: 'rec-1' }],
    });

    assert.equal(calls[0].endpoint, '/esign/packages');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, {
      generatedDocumentId: '177abc',
      name: 'NDA',
      recipients,
      routing: 'parallel',
      links: [{ objectName: 'people', recordId: 'rec-1' }],
    });
  });
});

describe('EsignService.listPackages', () => {
  test('GETs /esign/packages with query', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await esign(fakeSdk).listPackages({
      recordId: 'rec-1',
      objectName: 'people',
      status: 'draft',
      limit: 1,
    });

    assert.equal(calls[0].endpoint, '/esign/packages');
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(calls[0].params.query, {
      recordId: 'rec-1',
      objectName: 'people',
      status: 'draft',
      limit: 1,
    });
  });
});

describe('EsignService.getPackage', () => {
  test('GETs /esign/packages/:id', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await esign(fakeSdk).getPackage('pkg-1');

    assert.equal(calls[0].endpoint, '/esign/packages/pkg-1');
    assert.equal(calls[0].method, 'GET');
  });
});

describe('EsignService.updatePackage', () => {
  test('PATCHes /esign/packages/:id with defined fields', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await esign(fakeSdk).updatePackage('pkg-1', { name: 'Updated' });

    assert.equal(calls[0].endpoint, '/esign/packages/pkg-1');
    assert.equal(calls[0].method, 'PATCH');
    assert.deepEqual(calls[0].params.body, { name: 'Updated' });
  });
});

describe('EsignService.send', () => {
  test('POSTs /esign/packages/:id/send', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await esign(fakeSdk).send('pkg-1');

    assert.equal(calls[0].endpoint, '/esign/packages/pkg-1/send');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, {});
  });
});

describe('EsignService.present', () => {
  test('POSTs /esign/packages/:id/present with signerId', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await esign(fakeSdk).present('pkg-1', { signerId: 'sig-1' });

    assert.equal(calls[0].endpoint, '/esign/packages/pkg-1/present');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, { signerId: 'sig-1' });
  });
});

describe('EsignService.remind', () => {
  test('POSTs /esign/packages/:id/remind without signerId', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await esign(fakeSdk).remind('pkg-1');

    assert.equal(calls[0].endpoint, '/esign/packages/pkg-1/remind');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, {});
  });

  test('POSTs remind with signerId', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await esign(fakeSdk).remind('pkg-1', { signerId: 'sig-1' });

    assert.deepEqual(calls[0].params.body, { signerId: 'sig-1' });
  });
});

describe('EsignService.void', () => {
  test('POSTs /esign/packages/:id/void with reason', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await esign(fakeSdk).void('pkg-1', { reason: 'cancelled' });

    assert.equal(calls[0].endpoint, '/esign/packages/pkg-1/void');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, { reason: 'cancelled' });
  });
});

describe('EsignService.seal', () => {
  test('POSTs /esign/packages/:id/seal', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await esign(fakeSdk).seal('pkg-1');

    assert.equal(calls[0].endpoint, '/esign/packages/pkg-1/seal');
    assert.equal(calls[0].method, 'POST');
  });
});

describe('EsignService.getEvidence', () => {
  test('GETs /esign/packages/:id/evidence', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await esign(fakeSdk).getEvidence('pkg-1');

    assert.equal(calls[0].endpoint, '/esign/packages/pkg-1/evidence');
    assert.equal(calls[0].method, 'GET');
  });
});

describe('EsignService.getPdf', () => {
  test('GETs /esign/packages/:id/pdf with forceFetch and kind', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await esign(fakeSdk).getPdf('pkg-1', { kind: 'sealed' });

    assert.equal(calls[0].endpoint, '/esign/packages/pkg-1/pdf');
    assert.equal(calls[0].method, 'GET');
    assert.equal(calls[0].forceFetch, true);
    assert.equal(calls[0].params.returnRawResponse, true);
    assert.deepEqual(calls[0].params.query, { kind: 'sealed' });
  });
});

describe('EsignPublicService.get', () => {
  test('GETs /esign/public/:token', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await esign(fakeSdk).public.get({ token: 'tok' });

    assert.equal(calls[0].endpoint, '/esign/public/tok');
    assert.equal(calls[0].method, 'GET');
  });
});

describe('EsignPublicService.getPdf', () => {
  test('GETs /esign/public/:token/pdf with forceFetch', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await esign(fakeSdk).public.getPdf({ token: 'tok', kind: 'working' });

    assert.equal(calls[0].endpoint, '/esign/public/tok/pdf');
    assert.equal(calls[0].method, 'GET');
    assert.equal(calls[0].forceFetch, true);
    assert.equal(calls[0].params.returnRawResponse, true);
    assert.deepEqual(calls[0].params.query, { kind: 'working' });
  });
});

describe('EsignPublicService.consent', () => {
  test('POSTs /esign/public/:token/consent', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await esign(fakeSdk).public.consent({
      token: 'tok',
      accepted: true,
      disclosureSha256: 'abc',
    });

    assert.equal(calls[0].endpoint, '/esign/public/tok/consent');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, {
      accepted: true,
      disclosureSha256: 'abc',
    });
  });
});

describe('EsignPublicService.save', () => {
  test('POSTs /esign/public/:token/save', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await esign(fakeSdk).public.save({ token: 'tok', values: { n: '1' } });

    assert.equal(calls[0].endpoint, '/esign/public/tok/save');
    assert.deepEqual(calls[0].params.body, { values: { n: '1' } });
  });
});

describe('EsignPublicService.complete', () => {
  test('POSTs /esign/public/:token/complete', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await esign(fakeSdk).public.complete({
      token: 'tok',
      values: { n: '1' },
      method: 'click_to_adopt',
      adoptedName: 'Ada',
    });

    assert.equal(calls[0].endpoint, '/esign/public/tok/complete');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, {
      values: { n: '1' },
      method: 'click_to_adopt',
      adoptedName: 'Ada',
    });
  });
});

describe('EsignPublicService.sign', () => {
  test('aliases complete', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await esign(fakeSdk).public.sign({ token: 'tok', values: {} });

    assert.equal(calls[0].endpoint, '/esign/public/tok/complete');
  });
});

describe('EsignPublicService.decline', () => {
  test('POSTs /esign/public/:token/decline', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await esign(fakeSdk).public.decline({ token: 'tok', reason: 'no' });

    assert.equal(calls[0].endpoint, '/esign/public/tok/decline');
    assert.deepEqual(calls[0].params.body, { reason: 'no' });
  });
});
