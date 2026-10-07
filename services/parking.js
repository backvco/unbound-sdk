import { internalRequest } from '../base.js';

// Call parking (plans/call-parking-plan.md). P0: pools + slots CRUD only.
// park/retrieve/listActive are P1/P3 -- stubs below, no routes yet.
export class ParkingService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async listPools() {
    return await internalRequest(this.sdk, '/parking/pools', 'GET', {});
  }

  /**
   * @param {Object} body - name, rangeStart?, slotCount?, recordTypeId?,
   *   accessMode?, access?: [{principalType, principalId}]
   */
  async createPool(body) {
    this.sdk.validateParams(
      { body },
      { body: { type: 'object', required: true } },
    );
    return await internalRequest(this.sdk, '/parking/pools', 'POST', { body });
  }

  async updatePool(id, body) {
    this.sdk.validateParams(
      { id, body },
      {
        id: { type: 'string', required: true },
        body: { type: 'object', required: true },
      },
    );
    return await internalRequest(this.sdk, `/parking/pools/${id}`, 'PATCH', {
      body,
    });
  }

  /**
   * @param {string} id
   * @param {Array<{principalType: 'user'|'group', principalId: string}>} access
   */
  async setPoolAccess(id, access) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );
    return await internalRequest(
      this.sdk,
      `/parking/pools/${id}/access`,
      'PUT',
      { body: { access } },
    );
  }

  async deletePool(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );
    return await internalRequest(this.sdk, `/parking/pools/${id}`, 'DELETE', {});
  }

  /**
   * @param {string} id pool id
   * @param {number} [count] how many slots to add, default 1
   */
  async addSlots(id, count) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );
    return await internalRequest(
      this.sdk,
      `/parking/pools/${id}/slots`,
      'POST',
      { body: { count } },
    );
  }

  async deleteSlot(slotId) {
    this.sdk.validateParams(
      { slotId },
      { slotId: { type: 'string', required: true } },
    );
    return await internalRequest(
      this.sdk,
      `/parking/slots/${slotId}`,
      'DELETE',
      {},
    );
  }

  /**
   * @param {Object} body - { callId, slotId? } -- omit slotId for next-free
   */
  async park(body) {
    this.sdk.validateParams(
      { body },
      { body: { type: 'object', required: true } },
    );
    return await internalRequest(this.sdk, '/parking/park', 'POST', { body });
  }

  /**
   * @param {string} slotId
   */
  async retrieve(slotId) {
    this.sdk.validateParams(
      { slotId },
      { slotId: { type: 'string', required: true } },
    );
    return await internalRequest(this.sdk, '/parking/retrieve', 'POST', {
      body: { slotId },
    });
  }

  async listActive() {
    return await internalRequest(this.sdk, '/parking/active', 'GET', {});
  }
}
