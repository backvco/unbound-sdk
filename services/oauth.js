import { internalRequest } from '../base.js';

/**
 * OAuth provider -- staff registry of OAuth clients (security-upgrades H1
 * frozen contract). Every method hits `/oauth/clients*` under
 * checkApiAuth; the server enforces `admin:oauthclient:manage`. Public
 * authorize/token/introspect/revoke endpoints (H2/H3/H4) are not client
 * methods -- they are third-party-facing, not called through this SDK.
 *
 * Exposed as `sdk.oauth.clients.*` (nested, since `oauth` is expected to
 * grow other sub-surfaces alongside `clients` as H2-H4 land).
 */
export class OAuthService {
  constructor(sdk) {
    this.sdk = sdk;
    this.clients = new OAuthClientsService(sdk);
  }
}

class OAuthClientsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * List this account's OAuth clients.
   * @returns {Promise<Object>} `{ clients: [...] }`
   * @example
   * const { clients } = await sdk.oauth.clients.list();
   */
  async list() {
    return internalRequest(this.sdk, '/oauth/clients', 'GET');
  }

  /**
   * Register a new OAuth client.
   * @param {Object} body
   * @param {string} body.name
   * @param {string} body.clientType - 'confidential' | 'public'
   * @param {string[]} body.redirectUris
   * @param {string[]} body.grantTypes - subset of 'authorization_code' | 'refresh_token' | 'client_credentials'
   * @param {string[]} body.allowedScopes
   * @param {string} [body.linkedUserId] - required when grantTypes includes 'client_credentials' (D11)
   * @param {string} [body.logoUrl]
   * @returns {Promise<Object>} `{ client, secret? }` -- secret is plaintext, shown once, confidential clients only
   * @example
   * const { client, secret } = await sdk.oauth.clients.create({
   *   name: 'Zapier',
   *   clientType: 'confidential',
   *   redirectUris: ['https://zapier.com/oauth/callback'],
   *   grantTypes: ['authorization_code', 'refresh_token'],
   *   allowedScopes: ['cdp:object:*:read'],
   * });
   */
  async create(body) {
    this.sdk.validateParams(body || {}, {
      name: { type: 'string', required: true },
      clientType: { type: 'string', required: true },
      redirectUris: { type: 'array', required: true },
      grantTypes: { type: 'array', required: true },
      allowedScopes: { type: 'array', required: true },
      linkedUserId: { type: 'string', required: false },
      logoUrl: { type: 'string', required: false },
    });
    return internalRequest(this.sdk, '/oauth/clients', 'POST', { body });
  }

  /**
   * Get one OAuth client.
   * @param {string} id
   * @returns {Promise<Object>} `{ client }`
   */
  async get(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/oauth/clients/${id}`, 'GET');
  }

  /**
   * Update an OAuth client. Any subset of the create fields, plus `status`
   * ('active' | 'disabled').
   * @param {string} id
   * @param {Object} body
   * @returns {Promise<Object>} `{ client }`
   */
  async update(id, body) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/oauth/clients/${id}`, 'PUT', { body });
  }

  /**
   * Soft-delete an OAuth client.
   * @param {string} id
   * @returns {Promise<Object>} `{ message }`
   */
  async remove(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/oauth/clients/${id}`, 'DELETE');
  }

  /**
   * List a client's secrets (id/createdAt/expiresAt/revokedAt/lastUsedAt
   * only -- never the hash or plaintext). Use the returned `id` values
   * with revokeSecret() to decommission an old/compromised secret.
   * @param {string} id
   * @returns {Promise<Object>} `{ secrets: [...] }`
   */
  async listSecrets(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/oauth/clients/${id}/secrets`, 'GET');
  }

  /**
   * Mint a new client secret. The old secret keeps working until revoked.
   * @param {string} id
   * @returns {Promise<Object>} `{ secret }` -- plaintext, shown once
   */
  async rotateSecret(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/oauth/clients/${id}/secrets`, 'POST');
  }

  /**
   * Revoke one of a client's secrets.
   * @param {string} id
   * @param {string} secretId
   * @returns {Promise<Object>} `{ message }`
   */
  async revokeSecret(id, secretId) {
    this.sdk.validateParams(
      { id, secretId },
      { id: { type: 'string', required: true }, secretId: { type: 'string', required: true } },
    );
    return internalRequest(this.sdk, `/oauth/clients/${id}/secrets/${secretId}`, 'DELETE');
  }

  /**
   * List a client's user consent grants.
   * @param {string} id
   * @returns {Promise<Object>} `{ grants: [...] }`
   */
  async listGrants(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/oauth/clients/${id}/grants`, 'GET');
  }

  /**
   * Revoke a client's consent grant for one user.
   * @param {string} id
   * @param {string} grantId
   * @returns {Promise<Object>} `{ message }`
   */
  async revokeGrant(id, grantId) {
    this.sdk.validateParams(
      { id, grantId },
      { id: { type: 'string', required: true }, grantId: { type: 'string', required: true } },
    );
    return internalRequest(this.sdk, `/oauth/clients/${id}/grants/${grantId}`, 'DELETE');
  }
}
