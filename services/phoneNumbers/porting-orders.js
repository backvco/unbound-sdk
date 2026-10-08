import { internalRequest } from '../../base.js';

// phoneNumbers/porting-orders.js :: porting-order CRUD + portability checks
export const portingOrderMethods = {
  /**
   * Check portability of phone numbers using two-phase validation
   *
   * Phase 1 (Default): Internal validation using LRN lookup
   * - Validates ownership, duplicates, and carrier compatibility
   * - Sets portabilityStatus to 'pending'
   *
   * Phase 2 (runPortabilityCheck: true): External validation
   * - Runs full portability check with carrier
   * - Updates portabilityStatus to 'portable', 'not-portable', or 'error'
   *
   * @param {Object} params
   * @param {string[]} params.phoneNumbers - Array of +E.164 formatted phone numbers
   * @param {string} [params.portingOrderId] - Optional porting order ID to save results to
   * @param {boolean} [params.runPortabilityCheck=false] - Run external portability validation
   * @returns {Promise<Object>} Portability check results
   */
  async checkPortability({
    phoneNumbers,
    portingOrderId,
    runPortabilityCheck = false,
  }) {
    this.sdk.validateParams(
      { phoneNumbers, runPortabilityCheck },
      {
        phoneNumbers: { type: 'array', required: true },
        runPortabilityCheck: { type: 'boolean', required: false },
      },
    );

    const body = { phoneNumbers, runPortabilityCheck };
    if (portingOrderId) body.portingOrderId = portingOrderId;

    const result = await internalRequest(this.sdk,
      '/phoneNumbers/porting/portability-check',
      'POST',
      {
        body: body,
      },
    );
    return result;
  },

  /**
   * Create a draft porting order (no phone numbers - add them via checkPortability)
   * @param {Object} params
   * @param {string} [params.customerReference] - Customer-specified reference number
   * @param {Object} [params.endUser] - End user information
   * @param {Object} [params.endUser.admin] - Admin contact info
   * @param {string} [params.endUser.admin.entityName] - Business/entity name
   * @param {string} [params.endUser.admin.authPersonName] - Authorized person name
   * @param {string} [params.endUser.admin.billingPhoneNumber] - Billing phone number
   * @param {string} [params.endUser.admin.accountNumber] - Account number with current provider
   * @param {string} [params.endUser.admin.taxIdentifier] - Tax identification number (EU)
   * @param {string} [params.endUser.admin.pinPasscode] - PIN/passcode for account access
   * @param {string} [params.endUser.admin.businessIdentifier] - Business identifier (EU)
   * @param {Object} [params.endUser.location] - Location information
   * @param {string} [params.endUser.location.streetAddress] - Street address
   * @param {string} [params.endUser.location.extendedAddress] - Apt/suite/etc
   * @param {string} [params.endUser.location.locality] - City
   * @param {string} [params.endUser.location.administrativeArea] - State/province
   * @param {string} [params.endUser.location.postalCode] - ZIP/postal code
   * @param {string} [params.endUser.location.countryCode] - 2-letter country code
   * @param {Object} [params.activationSettings] - Activation preferences
   * @param {string} [params.activationSettings.focDatetimeRequested] - Requested FOC date/time (ISO 8601 UTC)
   * @param {boolean} [params.activationSettings.fastPortEligible] - Request fast port if available
   * @param {string} [params.portOrderType] - Port type: 'full' or 'partial' (defaults to 'full')
   * @param {string[]} [params.tags] - Array of tags for organization
   * @returns {Promise<Object>} Created draft porting order with ID and status 'draft'
   * @example
   * // Create empty draft order, then add numbers via checkPortability
   * const order = await sdk.phoneNumbers.createPortingOrder({
   *   customerReference: "CUST-123",
   *   endUser: { admin: { entityName: "My Company" } }
   * });
   *
   * // Phase 1: Add numbers with internal validation (pending status)
   * await sdk.phoneNumbers.checkPortability({
   *   phoneNumbers: ["+15551234567"],
   *   portingOrderId: order.id
   * });
   *
   * // Phase 2: Run external portability check when ready
   * await sdk.phoneNumbers.checkPortability({
   *   phoneNumbers: ["+15551234567"],
   *   portingOrderId: order.id,
   *   runPortabilityCheck: true
   * });
   */
  async createPortingOrder({
    customerReference,
    endUser,
    activationSettings,
    portOrderType,
    tags,
  } = {}) {
    // Creates draft order without phone numbers - use checkPortability to add them
    const body = {};
    if (customerReference) body.customerReference = customerReference;
    if (endUser) body.endUser = endUser;
    if (activationSettings) body.activationSettings = activationSettings;
    if (portOrderType) body.portOrderType = portOrderType;
    if (tags) body.tags = tags;

    const result = await internalRequest(this.sdk,
      '/phoneNumbers/porting/orders',
      'POST',
      {
        body: body,
      },
    );
    return result;
  },

  async getPortingOrders({
    page,
    status,
    customerReference,
    sort,
    limit,
    id,
    operatorType = 'contains',
  } = {}) {
    const query = {
      page,
      status,
      customerReference,
      id,
      operatorType,
      sort,
      limit,
    };

    const url = '/phoneNumbers/porting/orders';

    const params = {
      query,
    };

    const result = await internalRequest(this.sdk, url, 'GET', params);
    return result;
  },

  /**
   * Get a porting order with optional related data
   * @param {string} id - Porting order ID
   * @param {Object} [options]
   * @param {boolean} [options.includePhoneNumbers=true] - Include phone numbers array
   * @param {boolean} [options.includeExceptions=true] - Include exceptions array
   * @param {boolean} [options.includeDocuments=true] - Include documents array with upload status
   * @returns {Promise<Object>} Porting order with requested related data
   */
  async getPortingOrder(
    id,
    {
      includePhoneNumbers = true,
      includeExceptions = true,
      includeDocuments = true,
    } = {},
  ) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const params = new URLSearchParams();
    if (includePhoneNumbers !== undefined)
      params.append('includePhoneNumbers', includePhoneNumbers);
    if (includeExceptions !== undefined)
      params.append('includeExceptions', includeExceptions);
    if (includeDocuments !== undefined)
      params.append('includeDocuments', includeDocuments);

    const queryString = params.toString();
    const url = queryString
      ? `/phoneNumbers/porting/orders/${id}?${queryString}`
      : `/phoneNumbers/porting/orders/${id}`;

    const result = await internalRequest(this.sdk, url, 'GET');
    return result;
  },

  /**
   * Update a draft porting order (order info only - manage numbers via checkPortability)
   * @param {string} id - Porting order ID
   * @param {Object} params - Order information to update
   * @param {string} [params.customerReference] - Customer-specified reference number
   * @param {Object} [params.endUser] - End user information
   * @param {Object} [params.activationSettings] - Activation preferences
   * @param {string} [params.portOrderType] - Port type: 'full' or 'partial'
   * @param {string[]} [params.tags] - Array of tags for organization
   * @returns {Promise<Object>} Updated porting order
   */
  async updatePortingOrder(
    id,
    {
      customerReference,
      endUser,
      activationSettings,
      portOrderType,
      tags,
    } = {},
  ) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const body = {};

    if (customerReference) body.customerReference = customerReference;
    if (endUser) body.endUser = endUser;
    if (activationSettings) body.activationSettings = activationSettings;
    if (portOrderType) body.portOrderType = portOrderType;
    if (tags) body.tags = tags;

    const result = await internalRequest(this.sdk,
      `/phoneNumbers/porting/orders/${id}`,
      'PUT',
      {
        body: body,
      },
    );
    return result;
  },

  /**
   * Submit a draft porting order for processing (validates all required fields)
   * @param {string} id - Porting order ID
   * @returns {Promise<Object>} Submitted porting order with Telnyx status
   */
  async submitPortingOrder(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    // Submit the draft order (status is implied)
    const body = {
      status: 'submit',
    };

    const result = await internalRequest(this.sdk,
      `/phoneNumbers/porting/orders/${id}`,
      'PUT',
      {
        body: body,
      },
    );
    return result;
  },

  /**
   * Delete/cancel a porting order (soft delete)
   * - Draft orders: Immediately cancelled locally
   * - Submitted orders: Cancelled via Telnyx, then status updated to cancel-pending
   * - Cannot delete orders within 48 hours of FOC date
   * - Cannot delete already completed or cancelled orders
   * @param {string} id - Porting order ID
   * @returns {Promise<Object>} Cancellation result with new status
   */
  async deletePortingOrder(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk,
      `/phoneNumbers/porting/orders/${id}`,
      'DELETE',
    );
    return result;
  },

  /**
   * Remove a specific phone number from a porting order
   * - Only works on draft orders (not submitted orders)
   * - Cannot remove the last phone number (delete entire order instead)
   * - Validates that phone number exists in the order
   * @param {string} portingOrderId - Porting order ID
   * @param {string} phoneNumber - Phone number to remove (+E.164 format)
   * @returns {Promise<Object>} Removal confirmation with updated counts
   * @example
   * await sdk.phoneNumbers.removePhoneNumberFromOrder(
   *   "port_123...",
   *   "+15551234567"
   * );
   */
  async removePhoneNumberFromOrder(portingOrderId, phoneNumber) {
    this.sdk.validateParams(
      { portingOrderId, phoneNumber },
      {
        portingOrderId: { type: 'string', required: true },
        phoneNumber: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk,
      `/phoneNumbers/porting/orders/${encodeURIComponent(
        portingOrderId,
      )}/numbers/${encodeURIComponent(phoneNumber)}`,
      'DELETE',
    );
    return result;
  },
};
