export class DirectoryService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * List the current user's directory favorites, hydrated with the
   * favorited record and its channels.
   *
   * @returns {Promise<{favorites: Object[]}>}
   */
  async listFavorites() {
    const result = await this.sdk._fetch('/directory/favorites', 'GET');
    return result;
  }

  /**
   * Add a person or company to directory favorites. Reactivates a
   * soft-deleted favorite on unique conflict.
   *
   * @param {Object} params
   * @param {string} params.objectType - 'person' or 'company' (required).
   * @param {string} params.objectId - Id of the favorited record (required).
   * @param {string[]} [params.channelIds] - Channel ids to pin for this favorite.
   * @returns {Promise<Object>} The created (or reactivated) favorite.
   */
  async addFavorite({ objectType, objectId, channelIds }) {
    this.sdk.validateParams(
      { objectType, objectId, channelIds },
      {
        objectType: { type: 'string', required: true },
        objectId: { type: 'string', required: true },
        channelIds: { type: 'array', required: false },
      },
    );

    const body = { objectType, objectId };
    if (channelIds !== undefined) body.channelIds = channelIds;

    const params = { body };

    const result = await this.sdk._fetch('/directory/favorites', 'POST', params);
    return result;
  }

  /**
   * Update a directory favorite's pinned channels and/or sort order.
   *
   * @param {string} favoriteId - Id of the favorite to update (required).
   * @param {Object} params
   * @param {string[]} [params.channelIds]
   * @param {number} [params.sortOrder]
   * @returns {Promise<Object>} The updated favorite.
   */
  async updateFavorite(favoriteId, { channelIds, sortOrder } = {}) {
    this.sdk.validateParams(
      { favoriteId, channelIds, sortOrder },
      {
        favoriteId: { type: 'string', required: true },
        channelIds: { type: 'array', required: false },
        sortOrder: { type: 'number', required: false },
      },
    );

    const body = {};
    if (channelIds !== undefined) body.channelIds = channelIds;
    if (sortOrder !== undefined) body.sortOrder = sortOrder;

    const params = { body };

    const result = await this.sdk._fetch(
      `/directory/favorites/${favoriteId}`,
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Soft delete a directory favorite.
   *
   * @param {string} favoriteId - Id of the favorite to remove (required).
   * @returns {Promise<Object>}
   */
  async removeFavorite(favoriteId) {
    this.sdk.validateParams(
      { favoriteId },
      {
        favoriteId: { type: 'string', required: true },
      },
    );

    const result = await this.sdk._fetch(
      `/directory/favorites/${favoriteId}`,
      'DELETE',
    );
    return result;
  }

  /**
   * Reorder directory favorites.
   *
   * @param {Object} params
   * @param {string[]} params.order - Favorite ids in the desired order (required).
   * @returns {Promise<{ok: boolean}>}
   */
  async reorderFavorites({ order }) {
    this.sdk.validateParams(
      { order },
      {
        order: { type: 'array', required: true },
      },
    );

    const params = { body: { order } };

    const result = await this.sdk._fetch(
      '/directory/favorites/reorder',
      'PUT',
      params,
    );
    return result;
  }
}
