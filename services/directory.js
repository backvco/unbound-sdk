import { internalRequest } from '../base.js';
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
    const result = await internalRequest(this.sdk, '/directory/favorites', 'GET');
    return result;
  }

  /**
   * Add a person, company, user, or queue to directory favorites.
   * Reactivates a soft-deleted favorite on unique conflict.
   *
   * @param {Object} params
   * @param {string} params.objectType - 'person', 'company', 'user', or 'queue' (required).
   * @param {string} params.objectId - Id of the favorited record (required).
   * @param {string[]} [params.channelIds] - Channel ids to pin for this favorite.
   * @param {string} [params.channelId] - Channel id to pin for this favorite.
   * @param {string} [params.numberField] - Number field to associate with this favorite.
   * @returns {Promise<Object>} The created (or reactivated) favorite.
   */
  async addFavorite({ objectType, objectId, channelIds, channelId, numberField }) {
    this.sdk.validateParams(
      { objectType, objectId, channelIds, channelId, numberField },
      {
        objectType: { type: 'string', required: true },
        objectId: { type: 'string', required: true },
        channelIds: { type: 'array', required: false },
        channelId: { type: 'string', required: false },
        numberField: { type: 'string', required: false },
      },
    );

    const body = { objectType, objectId };
    if (channelIds !== undefined) body.channelIds = channelIds;
    if (channelId !== undefined) body.channelId = channelId;
    if (numberField !== undefined) body.numberField = numberField;

    const params = { body };

    const result = await internalRequest(this.sdk, '/directory/favorites', 'POST', params);
    return result;
  }

  /**
   * Update a directory favorite's pinned channels and/or sort order.
   *
   * @param {string} favoriteId - Id of the favorite to update (required).
   * @param {Object} params
   * @param {string[]} [params.channelIds]
   * @param {string} [params.channelId]
   * @param {string} [params.numberField]
   * @param {number} [params.sortOrder]
   * @returns {Promise<Object>} The updated favorite.
   */
  async updateFavorite(favoriteId, { channelIds, channelId, numberField, sortOrder } = {}) {
    this.sdk.validateParams(
      { favoriteId, channelIds, channelId, numberField, sortOrder },
      {
        favoriteId: { type: 'string', required: true },
        channelIds: { type: 'array', required: false },
        channelId: { type: 'string', required: false },
        numberField: { type: 'string', required: false },
        sortOrder: { type: 'number', required: false },
      },
    );

    const body = {};
    if (channelIds !== undefined) body.channelIds = channelIds;
    if (channelId !== undefined) body.channelId = channelId;
    if (numberField !== undefined) body.numberField = numberField;
    if (sortOrder !== undefined) body.sortOrder = sortOrder;

    const params = { body };

    const result = await internalRequest(this.sdk, 
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

    const result = await internalRequest(this.sdk, 
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

    const result = await internalRequest(this.sdk, 
      '/directory/favorites/reorder',
      'PUT',
      params,
    );
    return result;
  }

  /**
   * List the current user's directory contacts.
   *
   * @returns {Promise<{contacts: Object[]}>}
   */
  async listContacts({ search } = {}) {
    const query = {};
    if (search) query.search = search;
    const result = await internalRequest(this.sdk, '/directory/contacts', 'GET', {
      query,
    });
    return result;
  }

  async favoriteStatus(objectType, objectId) {
    this.sdk.validateParams(
      { objectType, objectId },
      {
        objectType: { type: 'string', required: true },
        objectId: { type: 'string', required: true },
      },
    );
    return internalRequest(this.sdk, '/directory/favorites/status', 'GET', {
      query: { objectType, objectId },
    });
  }

  async contactStatus(objectType, objectId) {
    this.sdk.validateParams(
      { objectType, objectId },
      {
        objectType: { type: 'string', required: true },
        objectId: { type: 'string', required: true },
      },
    );
    return internalRequest(this.sdk, '/directory/contacts/status', 'GET', {
      query: { objectType, objectId },
    });
  }

  /**
   * Add a person or company to directory contacts.
   *
   * @param {Object} params
   * @param {string} params.objectType - 'person' or 'company' (required).
   * @param {string} params.objectId - Id of the contacted record (required).
   * @returns {Promise<Object>} The created contact.
   */
  async addContact({ objectType, objectId }) {
    this.sdk.validateParams(
      { objectType, objectId },
      {
        objectType: { type: 'string', required: true },
        objectId: { type: 'string', required: true },
      },
    );

    const params = { body: { objectType, objectId } };

    const result = await internalRequest(this.sdk, '/directory/contacts', 'POST', params);
    return result;
  }

  /**
   * Remove a directory contact.
   *
   * @param {string} contactId - Id of the contact to remove (required).
   * @returns {Promise<Object>}
   */
  async removeContact(contactId) {
    this.sdk.validateParams(
      { contactId },
      {
        contactId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/directory/contacts/${contactId}`,
      'DELETE',
    );
    return result;
  }
}
