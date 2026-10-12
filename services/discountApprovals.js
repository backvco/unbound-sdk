import { internalRequest } from '../base.js';

/**
 * opportunity-product-options-plan.md r18 §Routes & scopes decide route /
 * §SDK ("DiscountApprovalsService.decide(id, {decision, decisionNote})
 * ... built and published in P3"). Staff-only — endpoints live under
 * `/discount-approvals/` (checkApiAuth), separate from the generic
 * `discountApprovals` object (which is isCreateable=0/isEditable=0 and so
 * has no CRUD surface through `sdk.objects.*` at all). The partner portal
 * is NOT a consumer of this package — its equivalent discount-request/
 * withdraw methods live in app1-customer-portals' own local
 * `portalDeals.mixin.js`, never here.
 */
export class DiscountApprovalsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Approve, reject, or withdraw a pending discount-approval request.
   * `deciderId` is never a parameter here — the server always uses the
   * calling session's own authenticated user id (Invariant 9).
   * @param {string} id - discountApprovals record id
   * @param {Object} options
   * @param {'approved'|'rejected'|'withdrawn'} options.decision
   * @param {string} [options.decisionNote]
   * @returns {Promise<Object>} { id, status, rollup }
   */
  async decide(id, { decision, decisionNote } = {}) {
    this.sdk.validateParams(
      { id, decision, decisionNote },
      {
        id: { type: 'string', required: true },
        decision: { type: 'string', required: true },
        decisionNote: { type: 'string', required: false },
      },
    );
    if (!['approved', 'rejected', 'withdrawn'].includes(decision)) {
      throw new Error(
        "decision must be one of 'approved', 'rejected', 'withdrawn'",
      );
    }
    const body = { decision };
    if (decisionNote !== undefined) body.decisionNote = decisionNote;
    return internalRequest(this.sdk, `/discount-approvals/${id}/decide`, 'POST', {
      body,
    });
  }

  /**
   * Round-2 fix 1 (margin-in-discount-popover) -- numbers-free D9 dry-run
   * for one or more lines on an opportunity. Never locks or writes
   * anything server-side. `marginPercent` is included on each returned
   * line ONLY when the calling session holds `crm:margin:view` -- this
   * method never asks for it and can't force it; everyone else gets
   * `belowMarginFloor` only.
   * @param {string} opportunityId
   * @param {Array<{lineId: string, price?: number, discountType?: 'percent'|'amount', discountValue?: number}>} lines
   * @returns {Promise<{lines: Array<{lineId: string, belowMarginFloor: boolean, marginPercent?: number}>}>}
   */
  async marginPreview(opportunityId, lines) {
    this.sdk.validateParams(
      { opportunityId, lines },
      {
        opportunityId: { type: 'string', required: true },
        lines: { type: 'array', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      '/discount-approvals/margin-preview',
      'POST',
      { body: { opportunityId, lines } },
    );
  }

  /**
   * Round-2 fix 3 (bulk discount) -- one `discountType`/`discountValue`
   * applied to every line in `lineIds`, through ONE `evaluateLineWrite`
   * call -> at most one `discountApprovals` row for the whole selection,
   * never one request per line. `discountValue` with
   * `discountType='amount'` is a PER-UNIT amount off each selected
   * line's own listPrice (the same semantics a single-line
   * `discountType='amount'` edit already has) -- never prorated across
   * the selection. Lines that are closed/locked, already have a pending
   * discount request, or aren't found are skipped server-side and
   * reported back in `skipped`, never merged or silently dropped.
   * @param {string} opportunityId
   * @param {string[]} lineIds
   * @param {Object} options
   * @param {'percent'|'amount'} options.discountType
   * @param {number} options.discountValue
   * @param {string} [options.reason]
   * @returns {Promise<{opportunityId: string, committed: string[], held: string[], skipped: Array<{lineId: string, reason: string}>, skippedCount: number, rollup: Object}>}
   */
  async bulkDiscount(opportunityId, lineIds, { discountType, discountValue, reason } = {}) {
    this.sdk.validateParams(
      { opportunityId, lineIds, discountType, discountValue },
      {
        opportunityId: { type: 'string', required: true },
        lineIds: { type: 'array', required: true },
        discountType: { type: 'string', required: true },
        discountValue: { type: 'number', required: true },
      },
    );
    if (!['percent', 'amount'].includes(discountType)) {
      throw new Error("discountType must be one of 'percent', 'amount'");
    }
    const body = { opportunityId, lineIds, discountType, discountValue };
    if (reason !== undefined) body.reason = reason;
    return internalRequest(
      this.sdk,
      '/discount-approvals/bulk-discount',
      'POST',
      { body },
    );
  }
}

export default DiscountApprovalsService;
