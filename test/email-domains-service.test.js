import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { EmailDomainsService } from '../services/messaging/EmailDomainsService.js';

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
    if (endpoint.startsWith('/messaging/email/validate/domain/') &&
      method === 'GET' &&
      !endpoint.includes('status') &&
      !endpoint.includes('dns')
    ) {
      return { id: 'dom-1', domain: 'customer.com' };
    }
    if (endpoint === '/messaging/email/validate/domain/status') {
      return { id: 'dom-1', domain: 'customer.com', primaryRegionStatus: 'active' };
    }
    if (endpoint === '/messaging/email/validate/domain/dns') {
      return { status: 'partial', records: {} };
    }
    return { ok: true };
  };
  return { fakeSdk, calls };
}

describe('EmailDomainsService.updateSettings', () => {
  test('puts catch-all and portal settings', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new EmailDomainsService(fakeSdk);

    await svc.updateSettings({
      domain: 'customer.com',
      catchAllMailboxId: null,
    });

    assert.equal(calls.length, 1);
    assert.equal(calls[0].method, 'PUT');
    assert.equal(
      calls[0].endpoint,
      '/messaging/email/validate/domain?domain=customer.com',
    );
    assert.deepEqual(calls[0].params.body, { catchAllMailboxId: null });
  });
});

describe('EmailDomainsService.enableSending', () => {
  test('posts the domain sending link', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new EmailDomainsService(fakeSdk);

    await svc.enableSending('dom-1');

    assert.equal(calls.length, 1);
    assert.equal(calls[0].method, 'POST');
    assert.equal(
      calls[0].endpoint,
      '/messaging/email/validate/domain/dom-1/sending',
    );
  });
});

describe('EmailDomainsService.verify', () => {
  test('domain id loads the domain then checks status + dns', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new EmailDomainsService(fakeSdk);

    const result = await svc.verify('dom-1');

    assert.equal(result.domain, 'customer.com');
    assert.equal(result.primaryRegionStatus, 'active');
    const endpoints = calls.map((c) => c.endpoint);
    assert.ok(endpoints.includes('/messaging/email/validate/domain/dom-1'));
    assert.ok(endpoints.includes('/messaging/email/validate/domain/status'));
    assert.ok(endpoints.includes('/messaging/email/validate/domain/dns'));
  });
});
