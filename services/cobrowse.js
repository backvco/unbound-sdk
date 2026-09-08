import { internalRequest } from '../base.js';

function authHeaders(token) {
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

function assertWebchatSource(source, method) {
  if (source !== 'webchat') {
    throw new Error(
      `cobrowse.${method}: source '${source}' is not supported (v1 is webchat only)`,
    );
  }
}

function webchatHostIds(
  { source, widgetId, hostId, engagementSessionId } = {},
  method,
) {
  const esId = hostId ?? engagementSessionId;
  assertWebchatSource(source, method);
  return { widgetId, engagementSessionId: esId };
}

function conversationCobrowsePath(widgetId, engagementSessionId, suffix = '') {
  return `/webchat/widgets/${widgetId}/conversations/${engagementSessionId}/cobrowse${suffix}`;
}

/**
 * Visitor cobrowse consent (session JWT). Custom UIs; embed uses
 * webchatApi.js in P1. Paths are public `/webchat/:widgetId/cobrowse/*`.
 */
export class CobrowseVisitorService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async #post(action, { widgetId, token, sid } = {}) {
    this.sdk.validateParams(
      { widgetId, token, sid },
      {
        widgetId: { type: 'string', required: true },
        token: { type: 'string', required: true },
        sid: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/webchat/${widgetId}/cobrowse/${action}`,
      'POST',
      { body: { sid }, ...authHeaders(token) },
      true,
    );
  }

  /**
   * Accept a pending cobrowse request. Starts live after API 200.
   * @param {Object} params
   * @param {string} params.widgetId
   * @param {string} params.token - Webchat session JWT
   * @param {string} params.sid
   */
  async accept(params) {
    return this.#post('accept', params);
  }

  /**
   * Decline a pending cobrowse request.
   * @param {Object} params
   * @param {string} params.widgetId
   * @param {string} params.token
   * @param {string} params.sid
   */
  async deny(params) {
    return this.#post('deny', params);
  }

  /**
   * Visitor-initiated end of a live/requested cobrowse session.
   * @param {Object} params
   * @param {string} params.widgetId
   * @param {string} params.token
   * @param {string} params.sid
   */
  async end(params) {
    return this.#post('end', params);
  }
}

/**
 * Host-agnostic cobrowse surface (`sdk.cobrowse.*`). v1 adapter is
 * WebChat; Meet later uses the same method names with `source:'meet'`.
 * No `sdk.webchat.cobrowse`.
 */
export class CobrowseService {
  constructor(sdk) {
    this.sdk = sdk;
    this.visitor = new CobrowseVisitorService(sdk);
  }

  /**
   * Agent request. Nested under the webchat conversation.
   * @param {Object} params
   * @param {'webchat'} params.source
   * @param {string} params.widgetId
   * @param {string} params.hostId - engagementSessionId when source is webchat
   * @param {string} [params.engagementSessionId] - alias of hostId
   * @param {'pointer'|'write'} [params.mode='pointer']
   * @param {boolean} [params.record=false]
   */
  async request({
    source,
    widgetId,
    hostId,
    engagementSessionId,
    mode = 'pointer',
    record = false,
  } = {}) {
    const ids = webchatHostIds(
      { source, widgetId, hostId, engagementSessionId },
      'request',
    );
    this.sdk.validateParams(
      { source, widgetId, hostId: ids.engagementSessionId, mode, record },
      {
        source: { type: 'string', required: true },
        widgetId: { type: 'string', required: true },
        hostId: { type: 'string', required: true },
        mode: { type: 'string', required: false },
        record: { type: 'boolean', required: false },
      },
    );
    return internalRequest(
      this.sdk,
      conversationCobrowsePath(ids.widgetId, ids.engagementSessionId, '/request'),
      'POST',
      { body: { mode, record: record === true } },
    );
  }

  /**
   * Agent end. Nested under the conversation because the HTTP route is.
   * @param {Object} params
   * @param {string} params.sid
   * @param {string} params.widgetId
   * @param {string} [params.hostId]
   * @param {string} [params.engagementSessionId]
   * @param {'webchat'} [params.source='webchat']
   */
  async end({
    sid,
    widgetId,
    hostId,
    engagementSessionId,
    source = 'webchat',
  } = {}) {
    const ids = webchatHostIds(
      { source, widgetId, hostId, engagementSessionId },
      'end',
    );
    this.sdk.validateParams(
      { sid, widgetId, hostId: ids.engagementSessionId },
      {
        sid: { type: 'string', required: true },
        widgetId: { type: 'string', required: true },
        hostId: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      conversationCobrowsePath(
        ids.widgetId,
        ids.engagementSessionId,
        `/${sid}/end`,
      ),
      'POST',
    );
  }

  /**
   * Current cobrowse session metadata for this host (no DOM).
   * @param {Object} params
   * @param {'webchat'} params.source
   * @param {string} params.widgetId
   * @param {string} params.hostId
   * @param {string} [params.engagementSessionId]
   */
  async getActive({
    source,
    widgetId,
    hostId,
    engagementSessionId,
  } = {}) {
    const ids = webchatHostIds(
      { source, widgetId, hostId, engagementSessionId },
      'getActive',
    );
    this.sdk.validateParams(
      { source, widgetId, hostId: ids.engagementSessionId },
      {
        source: { type: 'string', required: true },
        widgetId: { type: 'string', required: true },
        hostId: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      conversationCobrowsePath(ids.widgetId, ids.engagementSessionId, '/active'),
      'GET',
    );
  }

  /**
   * Download the combined recording.ndjson for a finished cobrowse session.
   * HTTP only (forceFetch) so the body is the event log, not JSON.
   * @param {Object} params
   * @param {'webchat'} params.source
   * @param {string} params.widgetId
   * @param {string} params.hostId
   * @param {string} params.sid
   * @param {string} [params.engagementSessionId]
   */
  async getRecording({
    source,
    widgetId,
    hostId,
    engagementSessionId,
    sid,
  } = {}) {
    const ids = webchatHostIds(
      { source, widgetId, hostId, engagementSessionId },
      'getRecording',
    );
    this.sdk.validateParams(
      {
        source,
        widgetId,
        hostId: ids.engagementSessionId,
        sid,
      },
      {
        source: { type: 'string', required: true },
        widgetId: { type: 'string', required: true },
        hostId: { type: 'string', required: true },
        sid: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      conversationCobrowsePath(
        ids.widgetId,
        ids.engagementSessionId,
        `/${sid}/recording`,
      ),
      'GET',
      {},
      true,
    );
  }
}
