import { internalRequest } from '../../base.js';

// phoneNumbers/search.js :: search/lookup methods :: number search, routing options, countries, formatting
export const searchMethods = {
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
  },

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
  },

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
   *
   * // Page through a large appType's destination list (default 50, max 200)
   * const page = await sdk.phoneNumbers.getRoutingOptions({ appType: 'users', search: 'jo', limit: 50 });
   * // Returns: { users: [...], hasMore: true }
   */
  async getRoutingOptions({
    mode,
    type,
    appType,
    workflowId,
    search,
    limit,
  } = {}) {
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
    if ('limit' in args)
      validationSchema.limit = { type: 'number', required: false };

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
        limit,
      },
    };

    const result = await internalRequest(this.sdk,
      '/phoneNumbers/routing-options',
      'GET',
      params,
    );
    return result;
  },

  async getSupportedCountries() {
    const result = await internalRequest(this.sdk,
      '/phoneNumbers/supported-countries',
      'GET',
    );
    return result;
  },
};
