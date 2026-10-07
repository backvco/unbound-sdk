import { internalRequest } from '../base.js';

// Operator (receptionist) panels (plans/operator-panel-plan.md §4/§4.1).
export class OperatorPanelsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Non-deleted panels the caller can see, each with `isMyDefault`, plus
   * `prefs`.
   */
  async listMine() {
    return await internalRequest(this.sdk, '/operatorPanels/mine', 'GET', {});
  }

  /**
   * @param {string} id - panel id
   * @returns {Promise<Object>} render payload: ordered sections → items
   */
  async getResolved(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );
    return await internalRequest(
      this.sdk,
      `/operatorPanels/${id}/resolved`,
      'GET',
      {},
    );
  }

  /**
   * @param {Object} body - { defaultPanelId?, viewMode? }
   */
  async setPrefs(body) {
    this.sdk.validateParams(
      { body },
      { body: { type: 'object', required: true } },
    );
    return await internalRequest(this.sdk, '/operatorPanels/me/prefs', 'PUT', {
      body,
    });
  }

  /**
   * @param {Object} params - { panelId }
   */
  async listMessages({ panelId }) {
    this.sdk.validateParams(
      { panelId },
      { panelId: { type: 'string', required: true } },
    );
    return await internalRequest(this.sdk, '/operatorPanels/messages', 'GET', {
      query: { panelId },
    });
  }

  async list() {
    return await internalRequest(this.sdk, '/operatorPanels', 'GET', {});
  }

  /**
   * @param {Object} body - panel fields
   */
  async create(body) {
    this.sdk.validateParams(
      { body },
      { body: { type: 'object', required: true } },
    );
    return await internalRequest(this.sdk, '/operatorPanels', 'POST', {
      body,
    });
  }

  /**
   * @param {string} id - panel id
   * @param {Object} body - panel fields to update
   */
  async update(id, body) {
    this.sdk.validateParams(
      { id, body },
      {
        id: { type: 'string', required: true },
        body: { type: 'object', required: true },
      },
    );
    return await internalRequest(this.sdk, `/operatorPanels/${id}`, 'PUT', {
      body,
    });
  }

  /**
   * @param {string} id - panel id
   */
  async remove(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );
    return await internalRequest(this.sdk, `/operatorPanels/${id}`, 'DELETE', {});
  }

  /**
   * Replace a panel's full ordered item list.
   *
   * @param {string} id - panel id
   * @param {Array<Object>} items
   */
  async setItems(id, items) {
    this.sdk.validateParams(
      { id, items },
      {
        id: { type: 'string', required: true },
        items: { type: 'array', required: true },
      },
    );
    return await internalRequest(
      this.sdk,
      `/operatorPanels/${id}/items`,
      'PUT',
      { body: { items } },
    );
  }

  /**
   * @param {string} id - panel id
   * @param {Array<{principalType: 'user'|'group', principalId: string}>} access
   */
  async setAccess(id, access) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );
    return await internalRequest(
      this.sdk,
      `/operatorPanels/${id}/access`,
      'PUT',
      { body: { access } },
    );
  }

  /**
   * @param {string} id - panel id
   * @returns {Promise<{results: Array<{principalType: 'user'|'group', principalId: string, name: string|null}>}>}
   */
  async getAccess(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );
    return await internalRequest(
      this.sdk,
      `/operatorPanels/${id}/access`,
      'GET',
      {},
    );
  }

  /**
   * @param {string} kind - users | groups | queues | ringGroups | workflows | records
   * @param {string} [q] - search text
   */
  async search(kind, q) {
    this.sdk.validateParams(
      { kind },
      { kind: { type: 'string', required: true } },
    );
    return await internalRequest(
      this.sdk,
      `/operatorPanels/pickers/${kind}`,
      'GET',
      { query: q ? { q } : {} },
    );
  }

  /**
   * @param {Object} body - message template fields
   */
  async createMessage(body) {
    this.sdk.validateParams(
      { body },
      { body: { type: 'object', required: true } },
    );
    return await internalRequest(this.sdk, '/operatorPanels/messages', 'POST', {
      body,
    });
  }

  /**
   * @param {string} id - message id
   * @param {Object} body - message fields to update
   */
  async updateMessage(id, body) {
    this.sdk.validateParams(
      { id, body },
      {
        id: { type: 'string', required: true },
        body: { type: 'object', required: true },
      },
    );
    return await internalRequest(
      this.sdk,
      `/operatorPanels/messages/${id}`,
      'PUT',
      { body },
    );
  }

  /**
   * @param {string} id - message id
   */
  async deleteMessage(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );
    return await internalRequest(
      this.sdk,
      `/operatorPanels/messages/${id}`,
      'DELETE',
      {},
    );
  }
}
