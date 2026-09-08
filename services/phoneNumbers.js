import { internalRequest } from '../base.js';
export class PhoneNumbersService {
  constructor(sdk) {
    this.sdk = sdk;
    this.carrier = new PhoneNumberCarrierService(sdk);
  }

  async search({
    type,
    country,
    state,
    city,
    startsWith,
    endsWith,
    contains,
    limit,
    minimumBlockSize,
    sms,
    mms,
    voice,
  }) {
    // Validate optional parameters
    const validationSchema = {};
    if ('type' in arguments[0]) validationSchema.type = { type: 'string' };
    if ('country' in arguments[0])
      validationSchema.country = { type: 'string' };
    if ('state' in arguments[0]) validationSchema.state = { type: 'string' };
    if ('city' in arguments[0]) validationSchema.city = { type: 'string' };
    if ('startsWith' in arguments[0])
      validationSchema.startsWith = { type: 'string' };
    if ('endsWith' in arguments[0])
      validationSchema.endsWith = { type: 'string' };
    if ('contains' in arguments[0])
      validationSchema.contains = { type: 'string' };
    if ('limit' in arguments[0]) validationSchema.limit = { type: 'number' };
    if ('minimumBlockSize' in arguments[0])
      validationSchema.minimumBlockSize = { type: 'number' };
    if ('sms' in arguments[0]) validationSchema.sms = { type: 'boolean' };
    if ('mms' in arguments[0]) validationSchema.mms = { type: 'boolean' };
    if ('voice' in arguments[0]) validationSchema.voice = { type: 'boolean' };

    if (Object.keys(validationSchema).length > 0) {
      this.sdk.validateParams(arguments[0], validationSchema);
    }

    const params = {
      query: {
        type,
        country,
        state,
        city,
        startsWith,
        endsWith,
        contains,
        limit,
        minimumBlockSize,
        sms,
        mms,
        voice,
      },
    };

    const result = await internalRequest(this.sdk, '/phoneNumbers/search', 'GET', params);
    return result;
  }

  async order({ phoneNumbers, name }) {
    this.sdk.validateParams(
      { phoneNumbers },
      {
        phoneNumbers: { type: 'array', required: true },
        name: { type: 'string', required: false },
      },
    );

    const orderData = { phoneNumbers };
    if (name) orderData.name = name;

    const params = {
      body: orderData,
    };

    const result = await internalRequest(this.sdk, '/phoneNumbers/order', 'POST', params);
    return result;
  }

  async remove(phoneNumber) {
    this.sdk.validateParams(
      { phoneNumber },
      {
        phoneNumber: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/phoneNumbers/${phoneNumber}`,
      'DELETE',
    );
    return result;
  }

  async update(
    id,
    {
      name,
      messagingWebHookUrl,
      voiceWebHookUrl,
      voiceAppExternalUrl,
      voiceAppExternalMethod,
      voiceApp,
      voiceAppMetaData,
      voiceRecordTypeId,
      messagingRecordTypeId,
      recordCalls,
      textApp,
      textAppMetaData,
      textChatVisibility,
    },
  ) {
    this.sdk.validateParams(
      {
        id,
        messagingWebHookUrl,
        voiceWebHookUrl,
        voiceAppExternalUrl,
        voiceAppExternalMethod,
        voiceApp,
        voiceRecordTypeId,
        messagingRecordTypeId,
        recordCalls,
        textApp,
        textAppMetaData,
        textChatVisibility,
      },
      {
        id: { type: 'string', required: true },
        name: { type: 'string', required: false },
        messagingWebHookUrl: { type: 'string', required: false },
        voiceWebHookUrl: { type: 'string', required: false },
        voiceAppExternalUrl: { type: 'string', required: false },
        voiceAppExternalMethod: { type: 'string', required: false },
        voiceApp: { type: 'string', required: false },
        voiceRecordTypeId: { type: 'string', required: false },
        messagingRecordTypeId: { type: 'string', required: false },
        recordCalls: { type: 'boolean', required: false },
        textApp: { type: 'string', required: false },
        textAppMetaData: { type: 'string', required: false },
        textChatVisibility: { type: 'string', required: false },
      },
    );

    const updateData = {};
    if (name) updateData.name = name;
    if (messagingWebHookUrl)
      updateData.messagingWebHookUrl = messagingWebHookUrl;
    if (voiceWebHookUrl) updateData.voiceWebHookUrl = voiceWebHookUrl;
    if (voiceAppExternalUrl)
      updateData.voiceAppExternalUrl = voiceAppExternalUrl;
    if (voiceAppExternalMethod)
      updateData.voiceAppExternalMethod = voiceAppExternalMethod;
    if (voiceApp) updateData.voiceApp = voiceApp;
    if (voiceAppMetaData) updateData.voiceAppMetaData = voiceAppMetaData;
    if (voiceRecordTypeId) updateData.voiceRecordTypeId = voiceRecordTypeId;
    if (messagingRecordTypeId)
      updateData.messagingRecordTypeId = messagingRecordTypeId;
    if (recordCalls !== undefined) updateData.recordCalls = recordCalls;
    if (textApp !== undefined) updateData.textApp = textApp;
    if (textAppMetaData !== undefined)
      updateData.textAppMetaData = textAppMetaData;
    if (textChatVisibility !== undefined)
      updateData.textChatVisibility = textChatVisibility;

    const params = {
      body: updateData,
    };

    const result = await internalRequest(this.sdk, `/phoneNumbers/${id}`, 'PUT', params);
    return result;
  }

  async updateCnam(phoneNumber, { cnam }) {
    this.sdk.validateParams(
      { phoneNumber, cnam },
      {
        phoneNumber: { type: 'string', required: true },
        cnam: { type: 'string', required: true },
      },
    );

    const params = {
      body: { cnam },
    };

    const result = await internalRequest(this.sdk, 
      `/phoneNumbers/cnam/${phoneNumber}`,
      'PUT',
      params,
    );
    return result;
  }

  async format(number) {
    this.sdk.validateParams(
      { number },
      {
        number: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/phoneNumbers/format/${number}`,
      'GET',
    );
    return result;
  }

  /**
   * Get routing options for phone numbers or extensions
   *
   * Supports multiple query modes:
   * 1. Get list of valid app types with metadata (appType: 'list')
   * 2. Get all application types (default)
   * 3. Get details for a specific application type
   * 4. Get versions for a specific workflow
   *
   * @param {Object} [options] - Query options
   * @param {string} [options.mode] - Context mode: 'phoneNumbers' (default) or 'extensions'
   * @param {string} [options.type] - Filter by routing type: 'voice' or 'messaging'
   * @param {string} [options.appType] - 'list' for metadata, or specific app type: 'workflows', 'extensions', 'voiceApps', 'users'
   * @param {string} [options.workflowId] - Get versions for a specific workflow ID
   * @param {string} [options.search] - Search/filter by name
   * @returns {Promise<Object>} Routing options based on query parameters
   * @example
   * // Get metadata about available app types
   * const metadata = await sdk.phoneNumbers.getRoutingOptions({ appType: 'list' });
   * // Returns: { types: [{ key: 'voiceApps', label: 'Voice Applications', description: '...', ... }] }
   *
   * // Get all application types for phone numbers (default)
   * const all = await sdk.phoneNumbers.getRoutingOptions();
   * // Returns: { voiceApps: [...], workflows: [...], extensions: [...], webhooks: [...] }
   *
   * // Get routing options for extensions
   * const extensionOptions = await sdk.phoneNumbers.getRoutingOptions({ mode: 'extensions' });
   * // Returns: { voiceApps: [...], workflows: [...], users: [...] }
   *
   * // Get only voice routing options
   * const voice = await sdk.phoneNumbers.getRoutingOptions({ type: 'voice' });
   *
   * // Get all workflows with their versions
   * const workflows = await sdk.phoneNumbers.getRoutingOptions({ appType: 'workflows' });
   *
   * // Get all users (for extension routing)
   * const users = await sdk.phoneNumbers.getRoutingOptions({ mode: 'extensions', appType: 'users' });
   *
   * // Get versions for a specific workflow
   * const versions = await sdk.phoneNumbers.getRoutingOptions({ workflowId: 'wf_123' });
   *
   * // Search workflows by name
   * const filtered = await sdk.phoneNumbers.getRoutingOptions({ appType: 'workflows', search: 'customer' });
   */
  async getRoutingOptions({ mode, type, appType, workflowId, search } = {}) {
    const validationSchema = {};
    const args = arguments[0] || {};

    if ('mode' in args)
      validationSchema.mode = { type: 'string', required: false };
    if ('type' in args)
      validationSchema.type = { type: 'string', required: false };
    if ('appType' in args)
      validationSchema.appType = { type: 'string', required: false };
    if ('workflowId' in args)
      validationSchema.workflowId = { type: 'string', required: false };
    if ('search' in args)
      validationSchema.search = { type: 'string', required: false };

    if (Object.keys(validationSchema).length > 0) {
      this.sdk.validateParams(args, validationSchema);
    }

    const params = {
      query: {
        mode,
        type,
        appType,
        workflowId,
        search,
      },
    };

    const result = await internalRequest(this.sdk, 
      '/phoneNumbers/routing-options',
      'GET',
      params,
    );
    return result;
  }

  async getSupportedCountries() {
    const result = await internalRequest(this.sdk, 
      '/phoneNumbers/supported-countries',
      'GET',
    );
    return result;
  }

  // Porting Methods

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
  }

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
  }

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
  }

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
  }

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
  }

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
  }

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
  }

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
  }

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
  }

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
  }

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
  }

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
  }

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
  }

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
  }

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
  }

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
  }

  /**
   * Auto-create porting orders by grouping phone numbers by carrier
   *
   * Analyzes phone numbers using internal LRN lookup, groups them by carrier,
   * and either previews the groupings (dry run) or creates separate porting
   * orders for each carrier group.
   *
   * @param {Object} params
   * @param {string[]} params.phoneNumbers - Array of +E.164 formatted phone numbers (max 100)
   * @param {string} params.name - Base name for orders (will be appended with carrier names)
   * @param {boolean} [params.dryRun=false] - If true, returns preview without creating orders
   * @returns {Promise<Object>} Carrier groups and creation results
   * @example
   * // Preview carrier groupings
   * const preview = await sdk.phoneNumbers.autoCreateOrders({
   *   phoneNumbers: ['+15551234567', '+15551234568', '+15551234569'],
   *   name: 'Q1 2025 Port',
   *   dryRun: true
   * });
   * // Returns carrier groups with proposed order names
   *
   * // Create orders for each carrier
   * const result = await sdk.phoneNumbers.autoCreateOrders({
   *   phoneNumbers: ['+15551234567', '+15551234568', '+15551234569'],
   *   name: 'Q1 2025 Port',
   *   dryRun: false
   * });
   * // Returns created orders and any errors
   */
  async autoCreateOrders({ phoneNumbers, name, dryRun = false }) {
    this.sdk.validateParams(
      { phoneNumbers, name },
      {
        phoneNumbers: { type: 'array', required: true },
        name: { type: 'string', required: true },
        dryRun: { type: 'boolean', required: false },
      },
    );

    const result = await internalRequest(this.sdk, 
      '/phoneNumbers/porting/auto-create-orders',
      'POST',
      {
        body: { phoneNumbers, name, dryRun },
      },
    );
    return result;
  }
}

export class PhoneNumberCarrierService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async sync(carrier, { updateVoiceConnection, updateMessagingConnection }) {
    this.sdk.validateParams(
      { carrier },
      {
        carrier: { type: 'string', required: true },
        updateVoiceConnection: { type: 'boolean', required: false },
        updateMessagingConnection: { type: 'boolean', required: false },
      },
    );

    const params = {
      query: { updateVoiceConnection, updateMessagingConnection },
    };

    const result = await internalRequest(this.sdk, 
      `/phoneNumbers/carrier/syncPhoneNumbers/${carrier}`,
      'POST',
      params,
    );
    return result;
  }

  async getDetails(phoneNumber) {
    this.sdk.validateParams(
      { phoneNumber },
      {
        phoneNumber: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/phoneNumbers/carrier/${phoneNumber}`,
      'GET',
    );
    return result;
  }

  async delete(phoneNumber) {
    this.sdk.validateParams(
      { phoneNumber },
      {
        phoneNumber: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/phoneNumbers/carrier/${phoneNumber}`,
      'DELETE',
    );
    return result;
  }
}
