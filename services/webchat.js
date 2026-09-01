import { internalRequest } from '../base.js';

// WebChat P0: agent-facing widget CRUD. Endpoints live under
// /webchat/widgets/ (checkApiAuth) -- deliberately not bare /webchat/, which
// is reserved for the future unauthenticated visitor surface (plan §5).
export class WebchatWidgetKeysService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * List signing keys for a widget.
   * @param {string} widgetId
   * @returns {Promise<Array<Object>>}
   */
  async list(widgetId) {
    this.sdk.validateParams(
      { widgetId },
      { widgetId: { type: 'string', required: true } },
    );

    return internalRequest(
      this.sdk,
      `/webchat/widgets/${widgetId}/keys`,
      'GET',
    );
  }

  /**
   * Create a signing key for a widget. The token is server-generated and
   * returned once in this response only.
   * @param {string} widgetId
   * @param {Object} [options]
   * @param {string[]} [options.urls] - allowlisted origins/domains for this key
   * @returns {Promise<Object>}
   */
  async create(widgetId, options = {}) {
    this.sdk.validateParams(
      { widgetId },
      { widgetId: { type: 'string', required: true } },
    );

    const params = { body: { ...options } };

    return internalRequest(
      this.sdk,
      `/webchat/widgets/${widgetId}/keys`,
      'POST',
      params,
    );
  }

  /**
   * Delete (soft) a widget signing key.
   * @param {string} widgetId
   * @param {string} keyId
   * @returns {Promise<Object>}
   */
  async delete(widgetId, keyId) {
    this.sdk.validateParams(
      { widgetId, keyId },
      {
        widgetId: { type: 'string', required: true },
        keyId: { type: 'string', required: true },
      },
    );

    return internalRequest(
      this.sdk,
      `/webchat/widgets/${widgetId}/keys/${keyId}`,
      'DELETE',
    );
  }
}

export class WebchatWidgetsService {
  constructor(sdk) {
    this.sdk = sdk;
    this.keys = new WebchatWidgetKeysService(sdk);
  }

  /**
   * List WebChat widgets for the authenticated account.
   * @returns {Promise<Array<Object>>}
   */
  async list() {
    return internalRequest(this.sdk, '/webchat/widgets', 'GET');
  }

  /**
   * Get a single WebChat widget by id.
   * @param {string} widgetId
   * @returns {Promise<Object>}
   */
  async get(widgetId) {
    this.sdk.validateParams(
      { widgetId },
      { widgetId: { type: 'string', required: true } },
    );

    return internalRequest(this.sdk, `/webchat/widgets/${widgetId}`, 'GET');
  }

  /**
   * Create a WebChat widget. identitySecret is always server-generated and
   * returned once (plaintext) in this response only -- never on list/get.
   * @param {Object} options
   * @param {string} options.name
   * @param {'draft'|'active'|'paused'} [options.status]
   * @param {'workflow'|'queue'} [options.routeType]
   * @param {'full'|'first'|'firstLastInitial'} [options.agentNameDisplay]
   * @returns {Promise<Object>}
   */
  async create(options) {
    this.sdk.validateParams(
      { name: options?.name },
      { name: { type: 'string', required: true } },
    );

    const params = { body: { ...options } };

    return internalRequest(this.sdk, '/webchat/widgets', 'POST', params);
  }

  /**
   * Update a WebChat widget. Pass regenerateIdentitySecret:true to rotate
   * the identity secret (returned once, plaintext, in this response).
   * @param {string} widgetId
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async update(widgetId, options) {
    this.sdk.validateParams(
      { widgetId },
      { widgetId: { type: 'string', required: true } },
    );

    const params = { body: { ...options } };

    return internalRequest(
      this.sdk,
      `/webchat/widgets/${widgetId}`,
      'PUT',
      params,
    );
  }

  /**
   * Delete (soft) a WebChat widget.
   * @param {string} widgetId
   * @returns {Promise<Object>}
   */
  async delete(widgetId) {
    this.sdk.validateParams(
      { widgetId },
      { widgetId: { type: 'string', required: true } },
    );

    return internalRequest(
      this.sdk,
      `/webchat/widgets/${widgetId}`,
      'DELETE',
    );
  }
}

export class WebchatService {
  constructor(sdk) {
    this.sdk = sdk;
    this.widgets = new WebchatWidgetsService(sdk);
  }
}
