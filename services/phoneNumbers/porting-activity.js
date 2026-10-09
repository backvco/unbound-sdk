import { internalRequest } from '../../base.js';

// phoneNumbers/porting-activity.js :: porting documents, LOA e-sign, events, sync, exceptions, comments
export const portingActivityMethods = {

  /**
   * Attach or update a document for a porting order
   *
   * @param {Object} params
   * @param {string} params.portingOrderId - Porting order ID
   * @param {string} [params.storageId] - Storage ID of uploaded file (null to clear)
   * @param {string} [params.documentType='loa'] - Document type (loa, bill, csr, etc.)
   * @param {boolean} [params.isRequired=false] - Whether document is required
   * @param {string} [params.documentId] - Optional: Update existing document by ID
   * @returns {Promise<Object>} Document attachment result with action (created/updated)
   */
  async attachPortingDocument({
    portingOrderId,
    storageId = null,
    documentType = 'loa',
    isRequired = false,
    documentId = null,
  }) {
    this.sdk.validateParams(
      { portingOrderId, documentType },
      {
        portingOrderId: { type: 'string', required: true },
        documentType: { type: 'string', required: true },
      },
    );

    const body = {
      portingOrderId,
      storageId,
      documentType,
      isRequired,
    };

    if (documentId) body.documentId = documentId;

    const result = await internalRequest(this.sdk,
      '/phoneNumbers/porting/documents',
      'POST',
      {
        body: body,
      },
    );
    return result;
  },

  /**
   * Start e-sign for a porting LOA (`send` emails the signer, `present` returns a URL).
   *
   * @param {Object} params
   * @param {string} params.portingOrderId
   * @param {string} params.signerName
   * @param {string} params.mode - `send` or `present`
   * @param {string} [params.signerTitle]
   * @param {string} [params.signerEmail] - required when mode is send
   * @returns {Promise<Object>} `{ packageId, status, signers, presentUrl?, presentExpiresAt? }`
   */
  async generateLoa({
    portingOrderId,
    signerName,
    signerTitle,
    signerEmail,
    mode,
  }) {
    this.sdk.validateParams(
      { portingOrderId, signerName, mode },
      {
        portingOrderId: { type: 'string', required: true },
        signerName: { type: 'string', required: true },
        mode: { type: 'string', required: true },
        signerTitle: { type: 'string', required: false },
        signerEmail: { type: 'string', required: false },
      },
    );

    const body = { signerName, mode };
    if (signerTitle !== undefined) body.signerTitle = signerTitle;
    if (signerEmail !== undefined) body.signerEmail = signerEmail;

    const result = await internalRequest(
      this.sdk,
      `/phoneNumbers/porting/orders/${encodeURIComponent(
        portingOrderId,
      )}/generate-loa`,
      'POST',
      { body },
    );
    return result;
  },

  async getPortingEvents(id, { page, limit } = {}) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const params = new URLSearchParams();
    if (page) params.append('page', page);
    if (limit) params.append('limit', limit);

    const queryString = params.toString();
    const url = queryString
      ? `/phoneNumbers/porting/orders/${id}/events?${queryString}`
      : `/phoneNumbers/porting/orders/${id}/events`;

    const result = await internalRequest(this.sdk, url, 'GET');
    return result;
  },

  /**
   * Get available activation dates for a porting order
   * - Creates the porting order in external system if not already created
   * - Updates the order data to ensure it's current before fetching dates
   * - Returns list of available activation dates for user selection
   * - Validates that phone numbers and required order details are complete
   * @param {string} id - Porting order ID
   * @returns {Promise<Object>} Available activation dates and order status
   * @example
   * const dates = await sdk.phoneNumbers.getFocWindows("port_123...");
   * // Returns:
   * // {
   * //   id: "port_123...",
   * //   status: "draft",
   * //   availableDates: [
   * //     { date: "2025-08-30T00:00:00.000Z", type: "Standard", available: true },
   * //     { date: "2025-09-02T00:00:00.000Z", type: "Express", available: true }
   * //   ],
   * //   phoneNumbersCount: 1,
   * //   orderReady: true
   * // }
   */
  async getFocWindows(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk,
      `/phoneNumbers/porting/orders/${id}/foc-windows`,
      'GET',
    );
    return result;
  },

  /**
   * Sync a porting order with the carrier
   * Fetches the latest order details and comments from the carrier and updates the local database
   * @param {string} id - Porting order ID
   * @returns {Promise<Object>} Sync results including updates made and comments added
   * @example
   * const syncResult = await sdk.phoneNumbers.syncPortingOrder("port_123...");
   * // Returns:
   * // {
   * //   id: "port_123...",
   * //   carrierOrderId: "carrier_abc123",
   * //   orderUpdated: true,
   * //   commentsAdded: 2,
   * //   errors: []
   * // }
   */
  async syncPortingOrder(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk,
      `/phoneNumbers/porting/orders/${id}/sync`,
      'POST',
    );
    return result;
  },

  /**
   * Mark a porting-order exception as resolved after the user has updated
   * the order (documents, account number, etc.). Syncs with the carrier
   * so local status picks up the next Telnyx state.
   * @param {string} id - Porting order ID
   * @param {string} exceptionId - Exception ID
   * @param {Object} [options]
   * @param {string} [options.resolution]
   * @returns {Promise<Object>} Updated exception
   */
  async resolvePortingException(id, exceptionId, { resolution } = {}) {
    this.sdk.validateParams(
      { id, exceptionId },
      {
        id: { type: 'string', required: true },
        exceptionId: { type: 'string', required: true },
      },
    );
    const body = {};
    if (resolution) body.resolution = resolution;
    return internalRequest(
      this.sdk,
      `/phoneNumbers/porting/orders/${id}/exceptions/${exceptionId}/resolve`,
      'POST',
      { body },
    );
  },

  /**
   * Get comments for a porting order
   * @param {string} id - Porting order ID
   * @param {Object} [options] - Query options
   * @param {string} [options.includeInternal='true'] - Include internal comments ('true', 'false', 'only')
   * @returns {Promise<Object>} Comments list with metadata
   * @example
   * // Get all comments
   * const allComments = await sdk.phoneNumbers.getPortingComments("port_123...");
   *
   * // Get only public comments
   * const publicComments = await sdk.phoneNumbers.getPortingComments("port_123...", { includeInternal: 'false' });
   *
   * // Get only internal comments
   * const internalComments = await sdk.phoneNumbers.getPortingComments("port_123...", { includeInternal: 'only' });
   */
  async getPortingComments(id, { includeInternal = 'true' } = {}) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const params = new URLSearchParams();
    if (includeInternal !== 'true') {
      params.append('includeInternal', includeInternal);
    }

    const queryString = params.toString();
    const url = `/phoneNumbers/porting/orders/${id}/comments${
      queryString ? '?' + queryString : ''
    }`;

    const result = await internalRequest(this.sdk, url, 'GET');
    return result;
  },

  /**
   * Post a comment on a porting order
   * @param {string} id - Porting order ID
   * @param {Object} params - Comment parameters
   * @param {string} params.comment - Comment body text
   * @param {boolean} [params.isInternal=false] - Whether this is an internal comment (not shared with carrier)
   * @returns {Promise<Object>} Created comment details
   * @example
   * // Post a public comment (shared with carrier)
   * const publicComment = await sdk.phoneNumbers.postPortingComment("port_123...", {
   *   comment: "Please expedite this port request",
   *   isInternal: false
   * });
   *
   * // Post an internal comment (team use only)
   * const internalComment = await sdk.phoneNumbers.postPortingComment("port_123...", {
   *   comment: "Customer called - they need this ASAP",
   *   isInternal: true
   * });
   */
  async postPortingComment(id, { comment, isInternal = false }) {
    this.sdk.validateParams(
      { id, comment },
      {
        id: { type: 'string', required: true },
        comment: { type: 'string', required: true },
        isInternal: { type: 'boolean', required: false },
      },
    );

    const result = await internalRequest(this.sdk,
      `/phoneNumbers/porting/orders/${id}/comments`,
      'POST',
      {
        body: { comment, isInternal },
      },
    );
    return result;
  },
};
