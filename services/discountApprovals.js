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
}

export default DiscountApprovalsService;
