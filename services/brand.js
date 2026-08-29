import { internalRequest } from '../base.js';

function pickDefined(fields) {
  const body = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) body[key] = value;
  }
  return body;
}

/**
 * Tenant brand kits used in content we send/host (emails, later landing
 * pages). Distinct from white-label `sdk.branding`.
 *
 * @see app1-api src/services/brand/routes.js
 */
export class BrandService {
  constructor(sdk) {
    this.sdk = sdk;
    this.kits = new BrandKitsService(sdk);
  }
}

/**
 * Brand kit CRUD + URL extract. `sdk.brand.kits.*`.
 */
export class BrandKitsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * List brand kits for the account. First call may seed a Default kit.
   *
   * @returns {Promise<Array>} Kits
   */
  async list() {
    const result = await internalRequest(this.sdk, '/brand/kits', 'GET', {});
    return result;
  }

  /**
   * Create a brand kit.
   *
   * @param {Object} params
   * @param {string} params.name - Kit name (required)
   * @param {string} [params.logoStorageId]
   * @param {string} [params.logoDarkStorageId]
   * @param {string} [params.faviconStorageId]
   * @param {Object} [params.colors]
   * @param {Object} [params.fonts]
   * @param {Object} [params.styles]
   * @param {Object} [params.socialLinks]
   * @param {string} [params.legalFooter]
   * @param {string} [params.websiteUrl]
   * @param {boolean} [params.isDefault]
   * @returns {Promise<Object>} Created kit
   */
  async create(params = {}) {
    this.sdk.validateParams(
      { name: params.name },
      { name: { type: 'string', required: true } },
    );

    const result = await internalRequest(this.sdk, '/brand/kits', 'POST', {
      body: pickDefined(params),
    });
    return result;
  }

  /**
   * Get a brand kit by id.
   *
   * @param {string} id - Kit id
   * @returns {Promise<Object>} Kit
   */
  async get(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );

    const result = await internalRequest(this.sdk, `/brand/kits/${id}`, 'GET', {});
    return result;
  }

  /**
   * Update a brand kit. Only defined fields are sent.
   *
   * @param {string} id - Kit id
   * @param {Object} params - Fields to update
   * @returns {Promise<Object>} Updated kit
   */
  async update(id, params = {}) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );

    const result = await internalRequest(this.sdk, `/brand/kits/${id}`, 'PUT', {
      body: pickDefined(params),
    });
    return result;
  }

  /**
   * Delete a brand kit.
   *
   * @param {string} id - Kit id
   * @returns {Promise<Object>} Confirmation
   */
  async delete(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );

    const result = await internalRequest(
      this.sdk,
      `/brand/kits/${id}`,
      'DELETE',
      {},
    );
    return result;
  }

  /**
   * Make this kit the account default. Exactly one kit is default.
   *
   * @param {string} id - Kit id
   * @returns {Promise<Object>} Updated kit
   */
  async setDefault(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );

    const result = await internalRequest(
      this.sdk,
      `/brand/kits/${id}/default`,
      'POST',
      {},
    );
    return result;
  }

  /**
   * Extract a brand-kit proposal from a public https URL. Does not save.
   *
   * @param {Object} params
   * @param {string} params.url - https URL to scrape
   * @returns {Promise<Object>} Proposal (`logoCandidates`, `colors`, `fonts`)
   */
  async extract({ url } = {}) {
    this.sdk.validateParams(
      { url },
      { url: { type: 'string', required: true } },
    );

    const result = await internalRequest(this.sdk, '/brand/kits/extract', 'POST', {
      body: { url },
    });
    return result;
  }
}
