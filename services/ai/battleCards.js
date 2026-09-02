import { internalRequest } from '../../base.js';

/**
 * Battle Cards Service - Manage AI Assist battle card packs, cards, and queue assignments
 */
export class BattleCardsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  // ========================================
  // Pack CRUD Methods
  // ========================================

  /**
   * Create a battle card pack
   *
   * @param {Object} options - Pack creation options
   * @param {string} options.name - Name of the pack
   * @param {string} [options.recordTypeId] - Record type ID
   * @returns {Promise<Object>} Created pack with id
   *
   * @example
   * const pack = await sdk.ai.battleCards.createPack({
   *   name: 'Pricing Objection Handling'
   * });
   */
  async createPack({ name, recordTypeId }) {
    this.sdk.validateParams(
      { name },
      {
        name: { type: 'string', required: true },
        recordTypeId: { type: 'string', required: false },
      },
    );

    const params = {
      body: { name, recordTypeId },
    };

    const result = await internalRequest(this.sdk, '/ai/battleCards/packs', 'POST', params);
    return result;
  }

  /**
   * Get a battle card pack by ID
   *
   * @param {Object} options - Options
   * @param {string} options.packId - The ID of the pack
   * @returns {Promise<Object>} Pack object
   *
   * @example
   * const pack = await sdk.ai.battleCards.getPack({
   *   packId: '251abc'
   * });
   */
  async getPack({ packId }) {
    this.sdk.validateParams(
      { packId },
      {
        packId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, `/ai/battleCards/packs/${packId}`, 'GET');
    return result;
  }

  /**
   * List battle card packs
   *
   * @param {Object} [options={}] - Query options
   * @param {number} [options.limit] - Maximum number of results
   * @param {string} [options.orderBy] - Field to order by
   * @param {string} [options.orderDirection] - Order direction
   * @returns {Promise<Object>} Object with results array
   *
   * @example
   * const packs = await sdk.ai.battleCards.listPacks({
   *   limit: 50,
   *   orderBy: 'createdAt',
   *   orderDirection: 'DESC'
   * });
   */
  async listPacks({
    limit,
    orderBy,
    orderDirection,
  } = {}) {
    const params = {
      query: { limit, orderBy, orderDirection },
    };

    const result = await internalRequest(this.sdk, '/ai/battleCards/packs', 'GET', params);
    return result;
  }

  /**
   * Update a battle card pack
   *
   * @param {Object} options - Update options
   * @param {string} options.packId - The ID of the pack
   * @param {string} [options.name] - New name
   * @param {string} [options.recordTypeId] - Record type ID
   * @returns {Promise<Object>} Updated pack object
   *
   * @example
   * const updated = await sdk.ai.battleCards.updatePack({
   *   packId: '251abc',
   *   name: 'Updated Pricing Pack'
   * });
   */
  async updatePack({ packId, name, recordTypeId }) {
    this.sdk.validateParams(
      { packId },
      {
        packId: { type: 'string', required: true },
        name: { type: 'string', required: false },
        recordTypeId: { type: 'string', required: false },
      },
    );

    const params = {
      body: { name, recordTypeId },
    };

    const result = await internalRequest(this.sdk, 
      `/ai/battleCards/packs/${packId}`,
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Delete a battle card pack
   *
   * @param {Object} options - Delete options
   * @param {string} options.packId - The ID of the pack
   * @returns {Promise<Object>} Success response
   *
   * @example
   * await sdk.ai.battleCards.deletePack({
   *   packId: '251abc'
   * });
   */
  async deletePack({ packId }) {
    this.sdk.validateParams(
      { packId },
      {
        packId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/ai/battleCards/packs/${packId}`,
      'DELETE',
    );
    return result;
  }

  // ========================================
  // Card CRUD Methods
  // ========================================

  /**
   * Create a battle card in a pack
   *
   * @param {Object} options - Card creation options
   * @param {string} options.packId - The ID of the pack
   * @param {string} options.title - Card title
   * @param {string} [options.body] - Card body
   * @param {string} [options.reply] - Suggested reply
   * @param {string} [options.dontSay] - Phrases to avoid
   * @param {Array} [options.triggers] - Trigger phrases
   * @param {number} [options.order] - Display order
   * @param {string} [options.recordTypeId] - Record type ID
   * @returns {Promise<Object>} Created card with id
   *
   * @example
   * const card = await sdk.ai.battleCards.createCard({
   *   packId: '251abc',
   *   title: 'Too expensive',
   *   body: 'Acknowledge the concern, then reframe value.',
   *   reply: 'I hear you — let me walk through what that includes.',
   *   triggers: ['too expensive', 'price']
   * });
   */
  async createCard({
    packId,
    title,
    body,
    reply,
    dontSay,
    triggers,
    order,
    recordTypeId,
  }) {
    this.sdk.validateParams(
      { packId, title },
      {
        packId: { type: 'string', required: true },
        title: { type: 'string', required: true },
        body: { type: 'string', required: false },
        reply: { type: 'string', required: false },
        dontSay: { type: 'string', required: false },
        triggers: { type: 'array', required: false },
        order: { type: 'number', required: false },
        recordTypeId: { type: 'string', required: false },
      },
    );

    const params = {
      body: { title, body, reply, dontSay, triggers, order, recordTypeId },
    };

    const result = await internalRequest(this.sdk, 
      `/ai/battleCards/packs/${packId}/cards`,
      'POST',
      params,
    );
    return result;
  }

  /**
   * Get a battle card by ID
   *
   * @param {Object} options - Options
   * @param {string} options.cardId - The ID of the card
   * @returns {Promise<Object>} Card object
   *
   * @example
   * const card = await sdk.ai.battleCards.getCard({
   *   cardId: '252abc'
   * });
   */
  async getCard({ cardId }) {
    this.sdk.validateParams(
      { cardId },
      {
        cardId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, `/ai/battleCards/cards/${cardId}`, 'GET');
    return result;
  }

  /**
   * List battle cards in a pack
   *
   * @param {Object} options - Options
   * @param {string} options.packId - The ID of the pack
   * @returns {Promise<Object>} Object with results array
   *
   * @example
   * const cards = await sdk.ai.battleCards.listCards({
   *   packId: '251abc'
   * });
   */
  async listCards({ packId }) {
    this.sdk.validateParams(
      { packId },
      {
        packId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, `/ai/battleCards/packs/${packId}/cards`, 'GET');
    return result;
  }

  /**
   * Update a battle card
   *
   * @param {Object} options - Update options
   * @param {string} options.cardId - The ID of the card
   * @param {string} [options.title] - Card title
   * @param {string} [options.body] - Card body
   * @param {string} [options.reply] - Suggested reply
   * @param {string} [options.dontSay] - Phrases to avoid
   * @param {Array} [options.triggers] - Trigger phrases
   * @param {number} [options.order] - Display order
   * @returns {Promise<Object>} Updated card object
   *
   * @example
   * const updated = await sdk.ai.battleCards.updateCard({
   *   cardId: '252abc',
   *   title: 'Budget concern'
   * });
   */
  async updateCard({
    cardId,
    title,
    body,
    reply,
    dontSay,
    triggers,
    order,
  }) {
    this.sdk.validateParams(
      { cardId },
      {
        cardId: { type: 'string', required: true },
        title: { type: 'string', required: false },
        body: { type: 'string', required: false },
        reply: { type: 'string', required: false },
        dontSay: { type: 'string', required: false },
        triggers: { type: 'array', required: false },
        order: { type: 'number', required: false },
      },
    );

    const params = {
      body: { title, body, reply, dontSay, triggers, order },
    };

    const result = await internalRequest(this.sdk, 
      `/ai/battleCards/cards/${cardId}`,
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Delete a battle card
   *
   * @param {Object} options - Delete options
   * @param {string} options.cardId - The ID of the card
   * @returns {Promise<Object>} Success response
   *
   * @example
   * await sdk.ai.battleCards.deleteCard({
   *   cardId: '252abc'
   * });
   */
  async deleteCard({ cardId }) {
    this.sdk.validateParams(
      { cardId },
      {
        cardId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/ai/battleCards/cards/${cardId}`,
      'DELETE',
    );
    return result;
  }

  // ========================================
  // Queue Pack Assignment
  // ========================================

  /**
   * List battle card packs assigned to a queue
   *
   * @param {Object} options - Options
   * @param {string} options.queueId - The ID of the queue
   * @returns {Promise<Object>} Assigned packs
   *
   * @example
   * const assigned = await sdk.ai.battleCards.listQueuePacks({
   *   queueId: 'queue_123'
   * });
   */
  async listQueuePacks({ queueId }) {
    this.sdk.validateParams(
      { queueId },
      {
        queueId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, `/ai/battleCards/queues/${queueId}`, 'GET');
    return result;
  }

  /**
   * Set battle card packs assigned to a queue
   *
   * @param {Object} options - Options
   * @param {string} options.queueId - The ID of the queue
   * @param {Array<string>} options.packIds - Pack IDs to assign
   * @returns {Promise<Object>} Updated assignment
   *
   * @example
   * await sdk.ai.battleCards.setQueuePacks({
   *   queueId: 'queue_123',
   *   packIds: ['251abc']
   * });
   */
  async setQueuePacks({ queueId, packIds }) {
    this.sdk.validateParams(
      { queueId, packIds },
      {
        queueId: { type: 'string', required: true },
        packIds: { type: 'array', required: true },
      },
    );

    const params = {
      body: { packIds },
    };

    const result = await internalRequest(this.sdk, 
      `/ai/battleCards/queues/${queueId}`,
      'PUT',
      params,
    );
    return result;
  }
}
