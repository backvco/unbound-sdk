/**
 * SearchService -- cross-entity fan-out search (WP6.1).
 * Backed by GET /search on app1-api: parallel per-store LIKE/fulltext
 * queries behind one stable interface (a dedicated index can replace the
 * implementation later without changing this contract).
 */
export class SearchService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Search across entities.
   *
   * @param {Object} params
   * @param {string} params.q - Search term (min 2 chars).
   * @param {number} [params.limit] - Max results per entity (default 5, cap 10).
   * @param {string|string[]} [params.entities] - Subset of
   *   people|company|opportunities|users|workflows; omit for all.
   * @returns {Promise<{query: string, results: Object}>} results keyed by
   *   entity, each an array of { id, objectName, title, subtitle, meta }.
   */
  async query({ q, limit, entities } = {}) {
    this.sdk.validateParams(
      { q, limit },
      {
        q: { type: 'string', required: true },
        limit: { type: 'number', required: false },
      },
    );

    if (
      entities !== undefined &&
      typeof entities !== 'string' &&
      !Array.isArray(entities)
    ) {
      throw new Error('entities must be a string or an array of strings');
    }

    const query = { q };
    if (limit !== undefined) query.limit = limit;
    if (entities !== undefined) {
      query.entities = Array.isArray(entities) ? entities.join(',') : entities;
    }

    return await this.sdk._fetch('/search', 'GET', { query });
  }
}
