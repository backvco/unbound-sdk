import { internalRequest } from '../base.js';

export class EmergencyService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async getMyLocation() {
    return await internalRequest(this.sdk, '/emergency/me', 'GET', {});
  }

  async saveMyLocation(body) {
    this.sdk.validateParams(
      { body },
      { body: { type: 'object', required: true } },
    );
    return await internalRequest(this.sdk, '/emergency/me', 'PUT', { body });
  }

  async validateAddress(body) {
    this.sdk.validateParams(
      { body },
      { body: { type: 'object', required: true } },
    );
    return await internalRequest(this.sdk, '/emergency/validate', 'POST', {
      body,
    });
  }

  async listSites() {
    return await internalRequest(this.sdk, '/emergency/sites', 'GET', {});
  }

  async createSite(body) {
    this.sdk.validateParams(
      { body },
      { body: { type: 'object', required: true } },
    );
    return await internalRequest(this.sdk, '/emergency/sites', 'POST', { body });
  }

  async updateSite(id, body) {
    this.sdk.validateParams(
      { id, body },
      {
        id: { type: 'string', required: true },
        body: { type: 'object', required: true },
      },
    );
    return await internalRequest(this.sdk, `/emergency/sites/${id}`, 'PATCH', {
      body,
    });
  }

  async deleteSite(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return await internalRequest(this.sdk, `/emergency/sites/${id}`, 'DELETE', {});
  }

  async addFloor(id, body) {
    this.sdk.validateParams(
      { id, body },
      {
        id: { type: 'string', required: true },
        body: { type: 'object', required: true },
      },
    );
    return await internalRequest(
      this.sdk,
      `/emergency/sites/${id}/floors`,
      'POST',
      { body },
    );
  }

  async deleteFloor(id, floorId) {
    this.sdk.validateParams(
      { id, floorId },
      {
        id: { type: 'string', required: true },
        floorId: { type: 'string', required: true },
      },
    );
    return await internalRequest(
      this.sdk,
      `/emergency/sites/${id}/floors/${floorId}`,
      'DELETE',
      {},
    );
  }

  async listAlertRules() {
    return await internalRequest(this.sdk, '/emergency/alert-rules', 'GET', {});
  }

  async createAlertRule(body) {
    this.sdk.validateParams(
      { body },
      { body: { type: 'object', required: true } },
    );
    return await internalRequest(this.sdk, '/emergency/alert-rules', 'POST', {
      body,
    });
  }

  async updateAlertRule(id, body) {
    this.sdk.validateParams(
      { id, body },
      {
        id: { type: 'string', required: true },
        body: { type: 'object', required: true },
      },
    );
    return await internalRequest(
      this.sdk,
      `/emergency/alert-rules/${id}`,
      'PATCH',
      { body },
    );
  }

  async deleteAlertRule(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return await internalRequest(
      this.sdk,
      `/emergency/alert-rules/${id}`,
      'DELETE',
      {},
    );
  }

  async listPoolNumbers() {
    return await internalRequest(this.sdk, '/emergency/pool', 'GET', {});
  }

  async markPoolNumber(body) {
    this.sdk.validateParams(
      { body },
      { body: { type: 'object', required: true } },
    );
    return await internalRequest(this.sdk, '/emergency/pool', 'POST', { body });
  }

  async unmarkPoolNumber(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return await internalRequest(this.sdk, `/emergency/pool/${id}`, 'DELETE', {});
  }
}
