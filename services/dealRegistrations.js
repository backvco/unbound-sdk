import { internalRequest } from '../base.js';

/**
 * Staff-facing deal registration actions (P13 contracts §6). Endpoints
 * live under `/deal-registrations/` (checkApiAuth), separate from the
 * `dealRegistrations` generic object CRUD (which the layout builder's
 * ApproveReject component calls through this mixin, not
 * `sdk.objects.updateById`, since conversion is transactional and
 * multi-record).
 */
export class DealRegistrationsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Approve a pending deal registration — converts it into real
   * company/people/opportunity records (reusing matched records where
   * possible) and stamps the registration approved.
   * @param {string} id - dealRegistrations record id
   * @returns {Promise<Object>} { registration, converted }
   */
  async approve(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/deal-registrations/${id}/approve`, 'POST');
  }

  /**
   * Reject a pending deal registration.
   * @param {string} id - dealRegistrations record id
   * @param {Object} options
   * @param {string} options.reason
   * @returns {Promise<Object>} { registration }
   */
  async reject(id, { reason } = {}) {
    this.sdk.validateParams(
      { id, reason },
      {
        id: { type: 'string', required: true },
        reason: { type: 'string', required: true },
      },
    );
    return internalRequest(this.sdk, `/deal-registrations/${id}/reject`, 'POST', {
      body: { reason },
    });
  }
}
