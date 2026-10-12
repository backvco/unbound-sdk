import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { DiscountApprovalsService } from '../services/discountApprovals.js';

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
    return { id: 'appr-1', status: 'approved', rollup: { amount: 100 } };
  };
  return { fakeSdk, calls };
}

describe('DiscountApprovalsService.decide', () => {
  test('POSTs /discount-approvals/:id/decide with {decision, decisionNote}', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const result = await new DiscountApprovalsService(fakeSdk).decide('appr-1', {
      decision: 'approved',
      decisionNote: 'looks good',
    });
    assert.equal(calls[0].endpoint, '/discount-approvals/appr-1/decide');
    assert.equal(calls[0].method, 'POST');
    assert.equal(calls[0].params.body.decision, 'approved');
    assert.equal(calls[0].params.body.decisionNote, 'looks good');
    assert.equal(result.status, 'approved');
  });

  test('decisionNote is optional -- omitted from the body entirely when not passed', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new DiscountApprovalsService(fakeSdk).decide('appr-1', {
      decision: 'rejected',
    });
    assert.equal('decisionNote' in calls[0].params.body, false);
  });

  test('rejects an unknown decision value client-side, before ever calling the transport', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await assert.rejects(() =>
      new DiscountApprovalsService(fakeSdk).decide('appr-1', { decision: 'bogus' }),
    );
    assert.equal(calls.length, 0);
  });
});

describe('DiscountApprovalsService.marginPreview', () => {
  test('POSTs /discount-approvals/margin-preview with {opportunityId, lines}', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const lines = [{ lineId: 'line-1', discountType: 'percent', discountValue: 25 }];
    await new DiscountApprovalsService(fakeSdk).marginPreview('opp-1', lines);
    assert.equal(calls[0].endpoint, '/discount-approvals/margin-preview');
    assert.equal(calls[0].method, 'POST');
    assert.equal(calls[0].params.body.opportunityId, 'opp-1');
    assert.deepEqual(calls[0].params.body.lines, lines);
  });
});

describe('DiscountApprovalsService.bulkDiscount', () => {
  test('POSTs /discount-approvals/bulk-discount with {opportunityId, lineIds, discountType, discountValue}', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new DiscountApprovalsService(fakeSdk).bulkDiscount(
      'opp-1',
      ['line-1', 'line-2'],
      { discountType: 'percent', discountValue: 15 },
    );
    assert.equal(calls[0].endpoint, '/discount-approvals/bulk-discount');
    assert.equal(calls[0].method, 'POST');
    assert.equal(calls[0].params.body.opportunityId, 'opp-1');
    assert.deepEqual(calls[0].params.body.lineIds, ['line-1', 'line-2']);
    assert.equal(calls[0].params.body.discountType, 'percent');
    assert.equal(calls[0].params.body.discountValue, 15);
    assert.equal('reason' in calls[0].params.body, false);
  });

  test('reason is optional but passed through when given', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new DiscountApprovalsService(fakeSdk).bulkDiscount('opp-1', ['line-1'], {
      discountType: 'amount',
      discountValue: 10,
      reason: 'holiday promo',
    });
    assert.equal(calls[0].params.body.reason, 'holiday promo');
  });

  test('rejects an unknown discountType client-side, before ever calling the transport', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await assert.rejects(() =>
      new DiscountApprovalsService(fakeSdk).bulkDiscount('opp-1', ['line-1'], {
        discountType: 'bogus',
        discountValue: 10,
      }),
    );
    assert.equal(calls.length, 0);
  });
});
