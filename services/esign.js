import { internalRequest } from '../base.js';

/**
 * Public (tokenized) signing session. `sdk.esign.public.*`.
 * No tenant cookie; tenant is resolved from Host. All methods force HTTP
 * so Present (Socket.IO SDK) does not NATS a Host-less request.
 */
export class EsignPublicService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * This-signer summary + disclosure (no co-signer emails).
   * @param {Object} params
   * @param {string} params.token - Raw signing token
   * @returns {Promise<Object>}
   */
  async get({ token }) {
    this.sdk.validateParams(
      { token },
      { token: { type: 'string', required: true } },
    );
    return internalRequest(this.sdk, `/esign/public/${token}`, 'GET', {}, true);
  }

  /**
   * Composed working (or sealed) PDF for this signer.
   * @param {Object} [params]
   * @param {string} params.token
   * @param {string} [params.kind] - `working` (default) or `sealed`
   * @returns {Promise<*>} Raw PDF response
   */
  async getPdf({ token, kind } = {}) {
    this.sdk.validateParams(
      { token },
      {
        token: { type: 'string', required: true },
        kind: { type: 'string', required: false },
      },
    );
    const params = { returnRawResponse: true };
    if (kind !== undefined) params.query = { kind };
    return internalRequest(
      this.sdk,
      `/esign/public/${token}/pdf`,
      'GET',
      params,
      true,
    );
  }

  /**
   * Record consent. Must precede complete.
   * @param {Object} params
   * @param {string} params.token
   * @param {boolean} params.accepted - Must be true
   * @param {string} params.disclosureSha256
   * @returns {Promise<Object>}
   */
  async consent({ token, accepted, disclosureSha256 }) {
    this.sdk.validateParams(
      { token, accepted, disclosureSha256 },
      {
        token: { type: 'string', required: true },
        accepted: { type: 'boolean', required: true },
        disclosureSha256: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/esign/public/${token}/consent`,
      'POST',
      { body: { accepted, disclosureSha256 } },
      true,
    );
  }

  /**
   * Draft-save field values (not stamped).
   * @param {Object} params
   * @param {string} params.token
   * @param {Object} params.values
   * @returns {Promise<Object>}
   */
  async save({ token, values }) {
    this.sdk.validateParams(
      { token, values },
      {
        token: { type: 'string', required: true },
        values: { type: 'object', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/esign/public/${token}/save`,
      'POST',
      { body: { values } },
      true,
    );
  }

  /**
   * Complete this recipient (stamp + maybe seal).
   * @param {Object} params
   * @param {string} params.token
   * @param {Object} [params.values]
   * @param {string} [params.method]
   * @param {string} [params.adoptedName]
   * @param {string} [params.imagePngBase64]
   * @returns {Promise<Object>}
   */
  async complete({ token, values, method, adoptedName, imagePngBase64 }) {
    this.sdk.validateParams(
      { token },
      {
        token: { type: 'string', required: true },
        values: { type: 'object', required: false },
        method: { type: 'string', required: false },
        adoptedName: { type: 'string', required: false },
        imagePngBase64: { type: 'string', required: false },
      },
    );
    const body = {};
    if (values !== undefined) body.values = values;
    if (method !== undefined) body.method = method;
    if (adoptedName !== undefined) body.adoptedName = adoptedName;
    if (imagePngBase64 !== undefined) body.imagePngBase64 = imagePngBase64;
    return internalRequest(
      this.sdk,
      `/esign/public/${token}/complete`,
      'POST',
      { body },
      true,
    );
  }

  /** Alias of {@link EsignPublicService#complete}. */
  async sign(args) {
    return this.complete(args);
  }

  /**
   * Decline the package.
   * @param {Object} params
   * @param {string} params.token
   * @param {string} [params.reason]
   * @returns {Promise<Object>}
   */
  async decline({ token, reason }) {
    this.sdk.validateParams(
      { token },
      {
        token: { type: 'string', required: true },
        reason: { type: 'string', required: false },
      },
    );
    const body = {};
    if (reason !== undefined) body.reason = reason;
    return internalRequest(
      this.sdk,
      `/esign/public/${token}/decline`,
      'POST',
      { body },
      true,
    );
  }
}

/**
 * Authenticated signing packages. `sdk.esign.*`.
 */
export class EsignService {
  constructor(sdk) {
    this.sdk = sdk;
    this.public = new EsignPublicService(sdk);
  }

  /**
   * Create a draft package from a generated document.
   * Field boxes come from the document's recipient field map, not the client.
   * @param {Object} body
   * @param {string} body.generatedDocumentId
   * @param {string} body.name
   * @param {Object[]} body.recipients
   * @param {string} [body.routing] - `parallel` or `sequential`
   * @param {Object[]} [body.links]
   * @param {string} [body.expiresAt]
   * @param {boolean} [body.allowDrawn]
   * @param {string} [body.postSignRedirectUrl]
   * @returns {Promise<Object>}
   */
  async createPackage({
    generatedDocumentId,
    name,
    routing,
    recipients,
    links,
    expiresAt,
    allowDrawn,
    postSignRedirectUrl,
  } = {}) {
    this.sdk.validateParams(
      { generatedDocumentId, name, recipients },
      {
        generatedDocumentId: { type: 'string', required: true },
        name: { type: 'string', required: true },
        recipients: { type: 'array', required: true },
        routing: { type: 'string', required: false },
        links: { type: 'array', required: false },
        expiresAt: { type: 'string', required: false },
        allowDrawn: { type: 'boolean', required: false },
        postSignRedirectUrl: { type: 'string', required: false },
      },
    );

    const body = { generatedDocumentId, name, recipients };
    if (routing !== undefined) body.routing = routing;
    if (links !== undefined) body.links = links;
    if (expiresAt !== undefined) body.expiresAt = expiresAt;
    if (allowDrawn !== undefined) body.allowDrawn = allowDrawn;
    if (postSignRedirectUrl !== undefined) {
      body.postSignRedirectUrl = postSignRedirectUrl;
    }

    return internalRequest(this.sdk, '/esign/packages', 'POST', { body });
  }

  /**
   * List packages. Missing tables → 503 `EsignNotProvisioned`.
   * Gate probe: `listPackages({ limit: 1 })`.
   * @param {Object} [query]
   * @param {string} [query.recordId] - Requires `objectName`
   * @param {string} [query.objectName] - Requires `recordId`
   * @param {string} [query.status]
   * @param {number} [query.limit]
   * @returns {Promise<{results: Object[]}>}
   */
  async listPackages({ recordId, objectName, status, limit } = {}) {
    const query = {};
    if (recordId) query.recordId = recordId;
    if (objectName) query.objectName = objectName;
    if (status) query.status = status;
    if (limit) query.limit = limit;
    return internalRequest(this.sdk, '/esign/packages', 'GET', { query });
  }

  /**
   * Package with signers, links, events (last 200).
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getPackage(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/esign/packages/${id}`, 'GET');
  }

  /**
   * Patch a draft package.
   * @param {string} id
   * @param {Object} [body]
   * @param {string} [body.name]
   * @param {Object[]} [body.recipients]
   * @param {string} [body.routing]
   * @param {Object[]} [body.links]
   * @param {string} [body.expiresAt]
   * @param {boolean} [body.allowDrawn]
   * @param {string} [body.postSignRedirectUrl]
   * @returns {Promise<Object>}
   */
  async updatePackage(
    id,
    {
      name,
      recipients,
      routing,
      links,
      expiresAt,
      allowDrawn,
      postSignRedirectUrl,
    } = {},
  ) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
        name: { type: 'string', required: false },
        recipients: { type: 'array', required: false },
        routing: { type: 'string', required: false },
        links: { type: 'array', required: false },
        expiresAt: { type: 'string', required: false },
        allowDrawn: { type: 'boolean', required: false },
        postSignRedirectUrl: { type: 'string', required: false },
      },
    );

    const body = {};
    if (name !== undefined) body.name = name;
    if (recipients !== undefined) body.recipients = recipients;
    if (routing !== undefined) body.routing = routing;
    if (links !== undefined) body.links = links;
    if (expiresAt !== undefined) body.expiresAt = expiresAt;
    if (allowDrawn !== undefined) body.allowDrawn = allowDrawn;
    if (postSignRedirectUrl !== undefined) {
      body.postSignRedirectUrl = postSignRedirectUrl;
    }

    return internalRequest(this.sdk, `/esign/packages/${id}`, 'PATCH', {
      body,
    });
  }

  /**
   * Freeze disclosure, issue tokens, email recipients.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async send(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/esign/packages/${id}/send`, 'POST', {
      body: {},
    });
  }

  /**
   * Mint a present token (no email). `{ url, expiresAt }`.
   * @param {string} id
   * @param {Object} params
   * @param {string} params.signerId
   * @returns {Promise<Object>}
   */
  async present(id, { signerId }) {
    this.sdk.validateParams(
      { id, signerId },
      {
        id: { type: 'string', required: true },
        signerId: { type: 'string', required: true },
      },
    );
    return internalRequest(this.sdk, `/esign/packages/${id}/present`, 'POST', {
      body: { signerId },
    });
  }

  /**
   * Resend the signing email. Optional `signerId` targets one recipient.
   * @param {string} id
   * @param {Object} [params]
   * @param {string} [params.signerId]
   * @returns {Promise<Object>}
   */
  async remind(id, { signerId } = {}) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
        signerId: { type: 'string', required: false },
      },
    );
    const body = {};
    if (signerId !== undefined) body.signerId = signerId;
    return internalRequest(this.sdk, `/esign/packages/${id}/remind`, 'POST', {
      body,
    });
  }

  /**
   * Void an in-flight package.
   * @param {string} id
   * @param {Object} [params]
   * @param {string} [params.reason]
   * @returns {Promise<Object>}
   */
  async void(id, { reason } = {}) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
        reason: { type: 'string', required: false },
      },
    );
    const body = {};
    if (reason !== undefined) body.reason = reason;
    return internalRequest(this.sdk, `/esign/packages/${id}/void`, 'POST', {
      body,
    });
  }

  /**
   * Idempotent seal repair.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async seal(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/esign/packages/${id}/seal`, 'POST', {
      body: {},
    });
  }

  /**
   * Evidence JSON pack.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getEvidence(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/esign/packages/${id}/evidence`, 'GET');
  }

  /**
   * Package PDF. HTTP-only (binary).
   * @param {string} id
   * @param {Object} [params]
   * @param {string} [params.kind] - `unsigned` | `working` | `sealed` | `certificate`
   * @returns {Promise<*>} Raw PDF response
   */
  async getPdf(id, { kind } = {}) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
        kind: { type: 'string', required: false },
      },
    );
    const params = { returnRawResponse: true };
    if (kind !== undefined) params.query = { kind };
    return internalRequest(
      this.sdk,
      `/esign/packages/${id}/pdf`,
      'GET',
      params,
      true,
    );
  }
}
