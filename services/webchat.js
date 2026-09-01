import { internalRequest } from '../base.js';
import { WebchatVisitorService } from './webchat/VisitorService.js';

// WebChat P0: agent-facing widget CRUD. Endpoints live under
// /webchat/widgets/ (checkApiAuth) -- deliberately not bare /webchat/, which
// is the (now-implemented, P7) unauthenticated visitor surface -- see
// `sdk.webchat.visitor` (./webchat/VisitorService.js) (plan §5/§10 Q7).
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

export class WebchatConversationMessagesService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * List messages for a webchat conversation (agent view).
   * @param {string} widgetId
   * @param {string} engagementSessionId
   * @param {Object} [options]
   * @param {string} [options.before] - cursor: return messages created before this
   * @param {number} [options.limit]
   * @returns {Promise<Array<Object>>}
   */
  async list(widgetId, engagementSessionId, options = {}) {
    this.sdk.validateParams(
      { widgetId, engagementSessionId },
      {
        widgetId: { type: 'string', required: true },
        engagementSessionId: { type: 'string', required: true },
      },
    );

    const { before, limit } = options;

    return internalRequest(
      this.sdk,
      `/webchat/widgets/${widgetId}/conversations/${engagementSessionId}/messages`,
      'GET',
      { query: { before, limit } },
    );
  }

  /**
   * Send a message into a webchat conversation as an agent.
   * @param {string} widgetId
   * @param {string} engagementSessionId
   * @param {Object} options
   * @param {string} options.message
   * @param {Object} [options.media]
   * @returns {Promise<Object>}
   */
  async send(widgetId, engagementSessionId, options) {
    this.sdk.validateParams(
      {
        widgetId,
        engagementSessionId,
        message: options?.message,
      },
      {
        widgetId: { type: 'string', required: true },
        engagementSessionId: { type: 'string', required: true },
        message: { type: 'string', required: true },
      },
    );

    const params = { body: { ...options } };

    return internalRequest(
      this.sdk,
      `/webchat/widgets/${widgetId}/conversations/${engagementSessionId}/messages`,
      'POST',
      params,
    );
  }
}

export class WebchatConversationsService {
  constructor(sdk) {
    this.sdk = sdk;
    this.messages = new WebchatConversationMessagesService(sdk);
  }

  /**
   * Send a typing indicator into a webchat conversation as an agent.
   * @param {string} widgetId
   * @param {string} engagementSessionId
   * @param {boolean} isTyping
   * @returns {Promise<Object>}
   */
  async typing(widgetId, engagementSessionId, isTyping) {
    this.sdk.validateParams(
      { widgetId, engagementSessionId },
      {
        widgetId: { type: 'string', required: true },
        engagementSessionId: { type: 'string', required: true },
      },
    );

    const params = { body: { isTyping: isTyping !== false } };

    return internalRequest(
      this.sdk,
      `/webchat/widgets/${widgetId}/conversations/${engagementSessionId}/typing`,
      'POST',
      params,
    );
  }

  /**
   * Look up a webchat conversation by engagementSessionId -- resolves the
   * widgetId + verified-visitor badge data for the agent thread.
   * @param {string} engagementSessionId
   * @returns {Promise<Object>}
   */
  async get(engagementSessionId) {
    this.sdk.validateParams(
      { engagementSessionId },
      { engagementSessionId: { type: 'string', required: true } },
    );

    return internalRequest(
      this.sdk,
      `/webchat/widgets/conversations/${engagementSessionId}`,
      'GET',
    );
  }
}

export class WebchatService {
  constructor(sdk) {
    this.sdk = sdk;
    this.widgets = new WebchatWidgetsService(sdk);
    this.conversations = new WebchatConversationsService(sdk);
    // Public visitor surface (plan §10 Q7, esign.public pattern) -- no
    // agent token required; a custom-UI integration constructs its own sdk
    // instance with just `{namespace}` and uses only this namespace.
    this.visitor = new WebchatVisitorService(sdk);
  }
}
