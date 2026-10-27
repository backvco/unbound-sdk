import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ReportingMarketingService } from '../services/reportingMarketing.js';

function buildFakeSdk() {
  const calls = [];
  const fakeSdk = { validateParams: () => {} };
  fakeSdk[Symbol.for('unbound.sdk.request')] = async (endpoint, method, params) => {
    calls.push({ endpoint, method, params });
    return { ok: true };
  };
  return { fakeSdk, calls };
}

const range = { from: '2026-10-01', to: '2026-10-14' };

describe('ReportingMarketingService', () => {
  test('website GETs /reporting/marketing/website with range + filters', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new ReportingMarketingService(fakeSdk).website({ ...range, country: 'US', device: '' });
    assert.equal(calls[0].method, 'GET');
    assert.equal(
      calls[0].endpoint,
      '/reporting/marketing/website?from=2026-10-01&to=2026-10-14&country=US',
    );
  });

  test('websiteGeo / websiteSessions / forms / formSubmissions / attribution / scoring / engagement paths', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new ReportingMarketingService(fakeSdk);
    await svc.websiteGeo(range);
    await svc.websiteSessions({ ...range, cursor: 'c1', limit: 50 });
    await svc.forms({ ...range, formId: 'f1' });
    await svc.formSubmissions({ ...range, formId: 'f1' });
    await svc.attribution({ ...range, model: 'last', dimension: 'campaign' });
    await svc.scoring(range);
    await svc.engagement({ ...range, journeyId: 'j1' });
    const paths = calls.map((c) => c.endpoint.split('?')[0]);
    assert.deepEqual(paths, [
      '/reporting/marketing/website/geo',
      '/reporting/marketing/website/sessions',
      '/reporting/marketing/forms',
      '/reporting/marketing/forms/submissions',
      '/reporting/marketing/attribution',
      '/reporting/marketing/scoring',
      '/reporting/marketing/engagement',
    ]);
    assert.match(calls[1].endpoint, /cursor=c1&limit=50/);
    assert.match(calls[4].endpoint, /model=last&dimension=campaign/);
  });

  test('visitorDetail GETs the visitor path with the visitor key', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new ReportingMarketingService(fakeSdk).visitorDetail({
      ...range,
      visitor: 'abc1234567',
    });
    assert.equal(
      calls[0].endpoint,
      '/reporting/marketing/website/visitors?from=2026-10-01&to=2026-10-14&visitor=abc1234567',
    );
  });

  test('sessionEvents GETs the per-session events path', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new ReportingMarketingService(fakeSdk).sessionEvents('s 1');
    assert.equal(calls[0].endpoint, '/reporting/marketing/website/sessions/s%201/events');
  });
});
