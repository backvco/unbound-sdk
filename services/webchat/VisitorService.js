import { internalRequest } from '../../base.js';

// Public, unauthenticated visitor surface -- `sdk.webchat.visitor`.
//
// Mirrors the app1-webchat-embed app's own request shapes
// (app1-webchat-embed/src/lib/utils/webchatApi.js) exactly, so this is a
// drop-in for that fetch wrapper, not a parallel client with different
// semantics: same paths under bare /webchat/:widgetId/*, same `embedGrant`
// body field on session create, same Authorization-header-or-body/query
// `token` fallback the API controllers accept.
//
// No agent auth: the sdk instance backing this only needs `namespace` (or
// a custom `baseURL`) set at construction -- never `sdk.token`. Every
// method forces HTTP (esign.public precedent, base.js `forceFetch`) since
// these are one-shot fetches from a customer page or a custom UI, never
// NATS-transport traffic.
function authHeaders(token) {
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
}

class WebchatVisitorSessionService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Start a new conversation. Requires an `embedGrant` minted by
   * `GET /webchat/:widgetId/grant` (or by loader.js for the JS-snippet
   * path) -- a custom UI on an allowlisted origin calls `grant()` first.
   * @param {Object} params
   * @param {string} params.widgetId
   * @param {string} params.embedGrant
   * @param {Object} [params.visitorData] - `{...fields, hash}`; `hash` is the
   *   HMAC-SHA256 (identitySecret) over the sorted `key=value&...` fields
   *   string, matching verifyVisitorIdentity.js's canonicalization exactly.
   *   Omit `hash` (or the whole object) to send fully unverified metadata.
   * @param {string} [params.pageUrl]
   * @returns {Promise<{engagementSessionId:string, token:string, resumeToken:string, status:'created'}>}
   */
  async create({ widgetId, embedGrant, visitorData, pageUrl } = {}) {
    this.sdk.validateParams(
      { widgetId, embedGrant },
      {
        widgetId: { type: 'string', required: true },
        embedGrant: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/webchat/${widgetId}/session`,
      'POST',
      { body: { embedGrant, visitorData, pageUrl } },
      true,
    );
  }

  /**
   * Resume an existing conversation from a previously-issued resume token
   * (same endpoint as `create`; the resumeToken body field selects the
   * resume path server-side).
   * @param {Object} params
   * @param {string} params.widgetId
   * @param {string} params.resumeToken
   * @returns {Promise<{engagementSessionId:string, token:string, resumeToken:string, status:'resumed'}>}
   */
  async resume({ widgetId, resumeToken } = {}) {
    this.sdk.validateParams(
      { widgetId, resumeToken },
      {
        widgetId: { type: 'string', required: true },
        resumeToken: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/webchat/${widgetId}/session`,
      'POST',
      { body: { resumeToken } },
      true,
    );
  }

  /**
   * Visitor-initiated completion (idle-timeout path closes the same way,
   * server-side).
   * @param {Object} params
   * @param {string} params.widgetId
   * @param {string} params.token - Session JWT from create/resume.
   * @returns {Promise<{status:'completed'}>}
   */
  async end({ widgetId, token } = {}) {
    this.sdk.validateParams(
      { widgetId, token },
      {
        widgetId: { type: 'string', required: true },
        token: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/webchat/${widgetId}/session/end`,
      'POST',
      { ...authHeaders(token) },
      true,
    );
  }
}

class WebchatVisitorMessagesService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * History for the session's own conversation (session JWT scopes
   * engagementSessionId server-side -- never pass one here).
   * @param {Object} params
   * @param {string} params.widgetId
   * @param {string} params.token
   * @param {string} [params.before] - Cursor: messages created before this.
   * @param {number} [params.limit]
   * @returns {Promise<{messages:Object[]}>}
   */
  async list({ widgetId, token, before, limit } = {}) {
    this.sdk.validateParams(
      { widgetId, token },
      {
        widgetId: { type: 'string', required: true },
        token: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/webchat/${widgetId}/messages`,
      'GET',
      {
        query: {
          ...(before !== undefined && before !== null ? { before } : {}),
          ...(limit !== undefined && limit !== null ? { limit } : {}),
        },
        ...authHeaders(token),
      },
      true,
    );
  }

  /**
   * Send a visitor message (direction is always 'visitor' server-side).
   * @param {Object} params
   * @param {string} params.widgetId
   * @param {string} params.token
   * @param {string} params.message
   * @param {Object[]} [params.media]
   * @returns {Promise<{message:Object}>}
   */
  async send({ widgetId, token, message, media } = {}) {
    this.sdk.validateParams(
      { widgetId, token },
      {
        widgetId: { type: 'string', required: true },
        token: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/webchat/${widgetId}/messages`,
      'POST',
      { body: { message, media }, ...authHeaders(token) },
      true,
    );
  }
}

class WebchatVisitorFilesService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Upload a visitor file (streaming multer engine server-side; 403 when
   * the widget has file upload disabled). Browser-only (needs `FormData`)
   * -- unlike the embed app's own XHR upload, this has no progress event;
   * a custom UI that needs a progress bar should keep using XHR directly
   * against the same endpoint (see app1-webchat-embed/webchatApi.js) until
   * the SDK grows an upload-progress hook.
   * @param {Object} params
   * @param {string} params.widgetId
   * @param {string} params.token
   * @param {File|Blob} params.file
   * @returns {Promise<{file:Object, message:Object}>}
   */
  async upload({ widgetId, token, file } = {}) {
    this.sdk.validateParams(
      { widgetId, token },
      {
        widgetId: { type: 'string', required: true },
        token: { type: 'string', required: true },
      },
    );
    if (typeof FormData === 'undefined' || !file) {
      throw new Error(
        'webchat.visitor.files.upload :: a browser File/Blob and FormData support are required',
      );
    }
    const body = new FormData();
    body.append('file', file);
    return internalRequest(
      this.sdk,
      `/webchat/${widgetId}/files`,
      'POST',
      { body, ...authHeaders(token) },
      true,
    );
  }

  /**
   * Direct download URL for a previously-uploaded file (token as a query
   * param -- iframe `<a>`/`<img>` tags can't set an Authorization header).
   * Not a request -- returns the URL string to link/navigate to.
   * @param {Object} params
   * @param {string} params.widgetId
   * @param {string} params.fileId
   * @param {string} params.token
   * @returns {string}
   */
  downloadUrl({ widgetId, fileId, token } = {}) {
    this.sdk.validateParams(
      { widgetId, fileId, token },
      {
        widgetId: { type: 'string', required: true },
        fileId: { type: 'string', required: true },
        token: { type: 'string', required: true },
      },
    );
    return `${this.sdk.fullUrl || this.sdk.baseURL}/webchat/${widgetId}/files/${fileId}?token=${encodeURIComponent(token)}`;
  }
}

export class WebchatVisitorService {
  constructor(sdk) {
    this.sdk = sdk;
    this.session = new WebchatVisitorSessionService(sdk);
    this.messages = new WebchatVisitorMessagesService(sdk);
    this.files = new WebchatVisitorFilesService(sdk);
  }

  /**
   * Mint a short-TTL embedGrant for this page's real origin (server
   * validates Origin/Referer against the widget's domainAllowlist) -- a
   * custom UI calls this before `session.create`, same as loader.js does
   * at iframe-open time.
   * @param {string} widgetId
   * @returns {Promise<{grant:string, exp:number}>}
   */
  async grant(widgetId) {
    this.sdk.validateParams(
      { widgetId },
      { widgetId: { type: 'string', required: true } },
    );
    return internalRequest(this.sdk, `/webchat/${widgetId}/grant`, 'GET', {}, true);
  }

  /**
   * Hours/offline state (server-evaluated, `no-store`).
   * @param {string} widgetId
   * @returns {Promise<{open:boolean, offlineBehavior:string, offlineFormConfig?:Object}>}
   */
  async status(widgetId) {
    this.sdk.validateParams(
      { widgetId },
      { widgetId: { type: 'string', required: true } },
    );
    return internalRequest(this.sdk, `/webchat/${widgetId}/status`, 'GET', {}, true);
  }

  /**
   * Opt in (or out) of a transcript email for this conversation. Only
   * stores the choice -- the email is sent at conversation close.
   * @param {Object} params
   * @param {string} params.widgetId
   * @param {string} params.token
   * @param {boolean} params.optIn
   * @param {string} [params.email] - Required when `optIn` is true.
   * @returns {Promise<{optIn:boolean, email:?string}>}
   */
  async transcript({ widgetId, token, optIn, email } = {}) {
    this.sdk.validateParams(
      { widgetId, token, optIn },
      {
        widgetId: { type: 'string', required: true },
        token: { type: 'string', required: true },
        optIn: { type: 'boolean', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/webchat/${widgetId}/transcript`,
      'POST',
      { body: { optIn, email }, ...authHeaders(token) },
      true,
    );
  }

  /**
   * Post-session-start HMAC identity verification (plan §5/P7 identify
   * pin). Same canonicalization as `session.create`'s `visitorData.hash`:
   * HMAC-SHA256(sorted `key=value&...` over every field except `hash`,
   * identitySecret). Verified fields merge into the conversation's
   * visitorData and (best-effort) link peopleId; an unsigned/mismatched
   * hash is rejected outright, nothing stored.
   * @param {Object} params
   * @param {string} params.widgetId
   * @param {string} params.token - Session JWT.
   * @param {string} [params.userId]
   * @param {string} [params.email]
   * @param {string} [params.name]
   * @param {string} [params.phone]
   * @param {Object} [params.custom]
   * @param {string} params.hash
   * @returns {Promise<Object>}
   */
  async identify({ widgetId, token, hash, ...fields } = {}) {
    this.sdk.validateParams(
      { widgetId, token, hash },
      {
        widgetId: { type: 'string', required: true },
        token: { type: 'string', required: true },
        hash: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/webchat/${widgetId}/identify`,
      'POST',
      { body: { ...fields, hash }, ...authHeaders(token) },
      true,
    );
  }

  /**
   * Emit a typing signal over an already-connected `/webchat` namespace
   * socket (`webchatSocket.js`/`connectWebchatSocket` precedent -- handshake
   * `auth:{namespace:'webchat', widgetId, token}`). The SDK owns no socket
   * transport (liveQuery.js precedent): pass an already-connected
   * socket.io-client instance in, this is a thin `emit` wrapper, not a
   * connection manager.
   * @param {Object} params
   * @param {Object} params.socket - Connected socket.io-client instance.
   * @param {boolean} [params.isTyping=true]
   */
  typing({ socket, isTyping = true } = {}) {
    if (!socket || typeof socket.emit !== 'function') {
      throw new Error(
        'webchat.visitor.typing :: a connected socket.io-client instance is required (pass { socket })',
      );
    }
    socket.emit('webchat.typing', { isTyping });
  }
}
