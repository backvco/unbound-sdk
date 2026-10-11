import { internalRequest } from '../base.js';

export class EmergencyService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async getMyLocation() {
    return await internalRequest(this.sdk, '/emergency/me', 'GET', {});
  }

  async deleteMyLocation() {
    return await internalRequest(this.sdk, '/emergency/me', 'DELETE', {});
  }

  async listPersonalPlaces() {
    return await internalRequest(this.sdk, '/emergency/personal', 'GET', {});
  }

  async deletePersonalPlace(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return await internalRequest(this.sdk, `/emergency/personal/${id}`, 'DELETE', {});
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

  async listSiteDevices(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return await internalRequest(this.sdk, `/emergency/sites/${id}/devices`, 'GET', {});
  }

  async listSiteCalls(id, query = {}) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return await internalRequest(this.sdk, `/emergency/sites/${id}/calls`, 'GET', {
      query,
    });
  }

  // A1b #12 (per-report-detail.md #12): account-wide compliance log, same
  // admin:emergencylocation:manage scope as every other admin route here --
  // no new scope. query: { from, to } ISO, exclusive-end (same contract as
  // reporting.getCallLog), optional digits ('911'|'933') (r1 fix: was a
  // fixed `range` enum that couldn't express ReportShell's picker).
  async report(query = {}) {
    return await internalRequest(this.sdk, '/emergency/calls', 'GET', {
      query,
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
