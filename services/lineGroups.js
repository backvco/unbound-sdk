import { internalRequest } from '../base.js';

// Line groups (plans/line-groups-plan.md). CRUD, lines, and members are
// dedicated routes. Routing pickers use routingTargets().
export class LineGroupsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async list() {
    return await internalRequest(this.sdk, '/lineGroups', 'GET', {});
  }

  /**
   * @param {string} id
   * @returns {Promise<Object>} group with lines and members
   */
  async get(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return await internalRequest(this.sdk, `/lineGroups/${id}`, 'GET', {});
  }

  /**
   * @param {Object} body - name, extension?, timers, privacy, lines?, members?
   */
  async create(body) {
    this.sdk.validateParams(
      { body },
      { body: { type: 'object', required: true } },
    );
    return await internalRequest(this.sdk, '/lineGroups', 'POST', { body });
  }

  async update(id, body) {
    this.sdk.validateParams(
      { id, body },
      {
        id: { type: 'string', required: true },
        body: { type: 'object', required: true },
      },
    );
    return await internalRequest(this.sdk, `/lineGroups/${id}`, 'PATCH', {
      body,
    });
  }

  async delete(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return await internalRequest(this.sdk, `/lineGroups/${id}`, 'DELETE', {});
  }

  /**
   * @param {string|number} extension
   * @param {string} [excludeId] extensions row to ignore while editing
   */
  async extensionAvailable(extension, excludeId) {
    this.sdk.validateParams(
      { extension },
      { extension: { type: 'string', required: true } },
    );
    const params = {
      query: {
        extension,
        ...(excludeId ? { excludeId } : {}),
      },
    };
    return await internalRequest(
      this.sdk,
      '/lineGroups/extensions/available',
      'GET',
      params,
    );
  }

  async routingTargets() {
    return await internalRequest(
      this.sdk,
      '/lineGroups/routingTargets',
      'GET',
      {},
    );
  }

  async addLine(id, body = {}) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return await internalRequest(this.sdk, `/lineGroups/${id}/lines`, 'POST', {
      body,
    });
  }

  async updateLine(id, lineId, body) {
    this.sdk.validateParams(
      { id, lineId, body },
      {
        id: { type: 'string', required: true },
        lineId: { type: 'string', required: true },
        body: { type: 'object', required: true },
      },
    );
    return await internalRequest(
      this.sdk,
      `/lineGroups/${id}/lines/${lineId}`,
      'PATCH',
      { body },
    );
  }

  async deleteLine(id, lineId) {
    this.sdk.validateParams(
      { id, lineId },
      {
        id: { type: 'string', required: true },
        lineId: { type: 'string', required: true },
      },
    );
    return await internalRequest(
      this.sdk,
      `/lineGroups/${id}/lines/${lineId}`,
      'DELETE',
      {},
    );
  }

  async addMember(id, userId) {
    this.sdk.validateParams(
      { id, userId },
      {
        id: { type: 'string', required: true },
        userId: { type: 'string', required: true },
      },
    );
    return await internalRequest(
      this.sdk,
      `/lineGroups/${id}/members`,
      'POST',
      { body: { userId } },
    );
  }

  async deleteMember(id, memberId) {
    this.sdk.validateParams(
      { id, memberId },
      {
        id: { type: 'string', required: true },
        memberId: { type: 'string', required: true },
      },
    );
    return await internalRequest(
      this.sdk,
      `/lineGroups/${id}/members/${memberId}`,
      'DELETE',
      {},
    );
  }
}
