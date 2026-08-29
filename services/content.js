import { internalRequest } from '../base.js';

function pickDefined(fields) {
  const body = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) body[key] = value;
  }
  return body;
}

/**
 * Content blocks, template library, and stock imagery.
 *
 * @see app1-api src/services/content/routes.js
 */
export class ContentService {
  constructor(sdk) {
    this.sdk = sdk;
    this.blocks = new ContentBlocksService(sdk);
    this.library = new ContentLibraryService(sdk);
    this.stock = new ContentStockService(sdk);
  }
}

/**
 * Saved / synced content blocks. `sdk.content.blocks.*`.
 */
export class ContentBlocksService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * List content blocks.
   *
   * @param {Object} [filters]
   * @param {string} [filters.channel] - `email` or `web`
   * @param {string} [filters.category]
   * @param {boolean} [filters.isSynced]
   * @param {number} [filters.limit]
   * @returns {Promise<Object>} `{ results }`
   */
  async list({ channel, category, isSynced, limit } = {}) {
    const query = pickDefined({ channel, category, isSynced, limit });
    const options = Object.keys(query).length ? { query } : {};
    const result = await internalRequest(
      this.sdk,
      '/content/blocks',
      'GET',
      options,
    );
    return result;
  }

  /**
   * Create a content block.
   *
   * @param {Object} params
   * @param {string} params.name - Block name (required)
   * @param {string} [params.channel]
   * @param {boolean} [params.isSynced]
   * @param {string} [params.category]
   * @param {Object|Array} [params.design] - Block-tree JSON
   * @param {string} [params.designStorageId]
   * @param {string} [params.thumbnailStorageId]
   * @returns {Promise<Object>} Created block
   */
  async create(params = {}) {
    this.sdk.validateParams(
      { name: params.name },
      { name: { type: 'string', required: true } },
    );

    const result = await internalRequest(this.sdk, '/content/blocks', 'POST', {
      body: pickDefined(params),
    });
    return result;
  }

  /**
   * Get a content block by id.
   *
   * @param {string} id
   * @returns {Promise<Object>} Block
   */
  async get(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );

    const result = await internalRequest(
      this.sdk,
      `/content/blocks/${id}`,
      'GET',
      {},
    );
    return result;
  }

  /**
   * Update a content block. Only defined fields are sent.
   *
   * @param {string} id
   * @param {Object} params
   * @returns {Promise<Object>} Updated block
   */
  async update(id, params = {}) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );

    const result = await internalRequest(this.sdk, `/content/blocks/${id}`, 'PUT', {
      body: pickDefined(params),
    });
    return result;
  }

  /**
   * Delete a content block.
   *
   * @param {string} id
   * @returns {Promise<Object>} Confirmation
   */
  async delete(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );

    const result = await internalRequest(
      this.sdk,
      `/content/blocks/${id}`,
      'DELETE',
      {},
    );
    return result;
  }
}

/**
 * Platform template library. `sdk.content.library.*`.
 * No `/use` route exists yet — list / get / create only.
 */
export class ContentLibraryService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * List library templates.
   *
   * @param {Object} [filters]
   * @param {string} [filters.channel]
   * @param {string} [filters.category]
   * @param {string} [filters.appearance] - `client` or `marketing`
   * @param {boolean} [filters.isPublished]
   * @param {number} [filters.limit]
   * @returns {Promise<Object>} `{ results }`
   */
  async list({ channel, category, appearance, isPublished, limit } = {}) {
    const query = pickDefined({
      channel,
      category,
      appearance,
      isPublished,
      limit,
    });
    const options = Object.keys(query).length ? { query } : {};
    const result = await internalRequest(
      this.sdk,
      '/content/library',
      'GET',
      options,
    );
    return result;
  }

  /**
   * Get a library template by id.
   *
   * @param {string} id
   * @returns {Promise<Object>} Library item
   */
  async get(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );

    const result = await internalRequest(
      this.sdk,
      `/content/library/${id}`,
      'GET',
      {},
    );
    return result;
  }

  /**
   * Create a library template.
   *
   * @param {Object} params
   * @param {string} params.name - Name (required)
   * @returns {Promise<Object>} Created item
   */
  async create(params = {}) {
    this.sdk.validateParams(
      { name: params.name },
      { name: { type: 'string', required: true } },
    );

    const result = await internalRequest(this.sdk, '/content/library', 'POST', {
      body: pickDefined(params),
    });
    return result;
  }
}

/**
 * Stock / GIF search + import-to-storage. `sdk.content.stock.*`.
 */
export class ContentStockService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Search Unsplash.
   *
   * @param {Object} [params]
   * @param {string} [params.q]
   * @param {number} [params.page]
   * @returns {Promise<Object>} `{ items }`
   */
  async searchUnsplash({ q, page } = {}) {
    return this._search('unsplash', { q, page });
  }

  /**
   * Search Pexels.
   *
   * @param {Object} [params]
   * @param {string} [params.q]
   * @param {number} [params.page]
   * @returns {Promise<Object>} `{ items }`
   */
  async searchPexels({ q, page } = {}) {
    return this._search('pexels', { q, page });
  }

  /**
   * Search GIPHY.
   *
   * @param {Object} [params]
   * @param {string} [params.q]
   * @param {number} [params.page]
   * @returns {Promise<Object>} `{ items }`
   */
  async searchGiphy({ q, page } = {}) {
    return this._search('giphy', { q, page });
  }

  /**
   * Import a stock asset into account storage.
   *
   * @param {Object} params
   * @param {string} params.source - `unsplash` | `pexels` | `giphy`
   * @param {string} [params.remoteId]
   * @param {string} [params.url]
   * @returns {Promise<Object>} `{ storageId, url }`
   */
  async import(params = {}) {
    this.sdk.validateParams(
      { source: params.source },
      { source: { type: 'string', required: true } },
    );

    const result = await internalRequest(
      this.sdk,
      '/content/stock/import',
      'POST',
      { body: pickDefined(params) },
    );
    return result;
  }

  async _search(source, { q, page } = {}) {
    const query = pickDefined({ q, page });
    const options = Object.keys(query).length ? { query } : {};
    return internalRequest(
      this.sdk,
      `/content/stock/${source}`,
      'GET',
      options,
    );
  }
}
