import { internalRequest } from '../../base.js';
export class EmailSuppressionService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * List email suppression entries for the current account
   * @param {Object} [params] - Query parameters
   * @param {string} [params.type] - Filter by suppression type (bounce, complaint, etc.)
   * @param {string} [params.emailAddress] - Filter by email address (partial match)
   * @param {string} [params.fromAddress] - Filter by sender address
   * @param {string} [params.carrierName] - Filter by carrier name
   * @param {number} [params.page=1] - Page number (1-based)
   * @param {number} [params.limit=50] - Number of items per page (max 100)
   * @returns {Promise<Object>} Paginated suppression list
   * @example
   * // Get all bounce suppressions
   * const bounces = await sdk.messaging.email.suppression.list({ type: 'bounce', page: 1, limit: 50 });
   * // Returns: {
   * //   items: [{ id, emailAddress, type, subType, fromAddress, carrierName, createdAt, requestRemovalReason, requestRemovalBy, requestRemovalAt }],
   * //   pagination: { page, limit },
   * //   filters: { type }
   * // }
   */
  async list({
    type,
    emailAddress,
    fromAddress,
    carrierName,
    page,
    limit,
  } = {}) {
    const options = { query: {} };
    if (type) options.query.type = type;
    if (emailAddress) options.query.emailAddress = emailAddress;
    if (fromAddress) options.query.fromAddress = fromAddress;
    if (carrierName) options.query.carrierName = carrierName;
    if (page !== undefined) options.query.page = page;
    if (limit !== undefined) options.query.limit = limit;

    const result = await internalRequest(this.sdk, 
      '/messaging/email/suppression',
      'GET',
      options,
    );
    return result;
  }

  /**
   * Delete a suppression entry with required reason (soft delete)
   * @param {string} id - Suppression item ID (required)
   * @param {string} reason - Reason for deletion (required, max 128 characters)
   * @returns {Promise<Object>} Deletion confirmation with details
   * @example
   * // Delete a suppression entry
   * const result = await sdk.messaging.email.suppression.delete('supp-123', 'Customer request to remove');
   * // Returns: {
   * //   success: true,
   * //   message: 'Suppression item deleted successfully',
   * //   deletedItem: { id, emailAddress, deletedBy, deletedReason, deletedAt }
   * // }
   */
  async delete(id, reason) {
    this.sdk.validateParams(
      { id, reason },
      {
        id: { type: 'string', required: true },
        reason: { type: 'string', required: true },
      },
    );

    if (reason.length > 128) {
      throw new Error('Deletion reason must be 128 characters or less');
    }

    const options = {
      body: { reason },
    };

    const result = await internalRequest(this.sdk, 
      `/messaging/email/suppression/${id}`,
      'DELETE',
      options,
    );
    return result;
  }

  /**
   * Check if an email address is globally suppressed (not limited by account)
   * @param {string} emailAddress - Email address to check (required)
   * @returns {Promise<Object>} Suppression status and removal request availability
   * @example
   * // Check if email is suppressed globally
   * const status = await sdk.messaging.email.suppression.checkGlobal('user@example.com');
   * // Returns: {
   * //   suppressed: true/false,
   * //   message: 'Status message',
   * //   canRequestRemoval: true/false (only if suppressed)
   * // }
   */
  async checkGlobal(emailAddress) {
    this.sdk.validateParams(
      { emailAddress },
      {
        emailAddress: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/email/suppression/global/${encodeURIComponent(emailAddress)}`,
      'GET',
    );
    return result;
  }

  /**
   * Request removal of an email address from global suppression list
   * @param {string} emailAddress - Email address to request removal for (required)
   * @param {string} reason - Reason for removal request (required, max 128 characters)
   * @returns {Promise<Object>} Removal request confirmation or existing request details
   * @example
   * // Request removal from suppression list
   * const result = await sdk.messaging.email.suppression.requestRemoval('user@example.com', 'Customer opt-in consent obtained');
   * // Success: {
   * //   success: true,
   * //   message: 'Removal request submitted successfully',
   * //   emailAddress, requestedBy, reason, requestedAt, recordsUpdated, records
   * // }
   * // Already requested: {
   * //   success: false,
   * //   message: 'A removal request has already been submitted...',
   * //   existingRequest: { requestedAt, requestedBy, reason }
   * // }
   */
  async requestRemoval(emailAddress, reason) {
    this.sdk.validateParams(
      { emailAddress, reason },
      {
        emailAddress: { type: 'string', required: true },
        reason: { type: 'string', required: true },
      },
    );

    if (reason.length > 128) {
      throw new Error('Removal reason must be 128 characters or less');
    }

    const options = {
      body: { reason },
    };

    const result = await internalRequest(this.sdk, 
      `/messaging/email/suppression/global/${encodeURIComponent(
        emailAddress,
      )}/request-removal`,
      'POST',
      options,
    );
    return result;
  }

  /**
   * Get bounce suppressions only (convenience method)
   * @param {Object} [params] - Query parameters
   * @param {number} [params.page=1] - Page number (1-based)
   * @param {number} [params.limit=50] - Number of items per page (max 100)
   * @returns {Promise<Object>} Paginated bounce suppressions
   * @example
   * // Get all bounce suppressions
   * const bounces = await sdk.messaging.email.suppression.getBounces({ page: 1, limit: 50 });
   */
  async getBounces({ page, limit } = {}) {
    return this.list({ type: 'bounce', page, limit });
  }

  /**
   * Get complaint suppressions only (convenience method)
   * @param {Object} [params] - Query parameters
   * @param {number} [params.page=1] - Page number (1-based)
   * @param {number} [params.limit=50] - Number of items per page (max 100)
   * @returns {Promise<Object>} Paginated complaint suppressions
   * @example
   * // Get all complaint suppressions
   * const complaints = await sdk.messaging.email.suppression.getComplaints({ page: 1, limit: 50 });
   */
  async getComplaints({ page, limit } = {}) {
    return this.list({ type: 'complaint', page, limit });
  }
}
