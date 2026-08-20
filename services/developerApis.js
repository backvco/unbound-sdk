import { internalRequest } from '../base.js';

/**
 * Developer portal My APIs — account-scoped folders, requests, vars, sharing.
 * API prefix: /developerApis
 */
export class DeveloperApisService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async getLibrary() {
    return internalRequest(this.sdk, '/developerApis', 'GET');
  }

  async createFolder(params = {}) {
    const { name, parentId, sort } = params;
    this.sdk.validateParams(
      { name, parentId, sort },
      {
        name: { type: 'string', required: false },
        parentId: { type: 'string', required: false },
        sort: { type: 'number', required: false },
      },
    );
    return internalRequest(this.sdk, '/developerApis/folders', 'POST', {
      body: { name, parentId, sort },
    });
  }

  async updateFolder(id, updates = {}) {
    this.sdk.validateParams(
      { id, updates },
      {
        id: { type: 'string', required: true },
        updates: { type: 'object', required: true },
      },
    );
    return internalRequest(this.sdk, `/developerApis/folders/${id}`, 'PUT', {
      body: updates,
    });
  }

  async deleteFolder(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/developerApis/folders/${id}`, 'DELETE');
  }

  async listFolderShares(folderId) {
    this.sdk.validateParams(
      { folderId },
      { folderId: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/developerApis/folders/${folderId}/shares`,
      'GET',
    );
  }

  async shareFolder(folderId, params) {
    const { userId, access } = params || {};
    this.sdk.validateParams(
      { folderId, userId, access },
      {
        folderId: { type: 'string', required: true },
        userId: { type: 'string', required: true },
        access: { type: 'string', required: false },
      },
    );
    return internalRequest(
      this.sdk,
      `/developerApis/folders/${folderId}/shares`,
      'POST',
      { body: { userId, access: access === 'full' ? 'full' : 'limited' } },
    );
  }

  async unshareFolder(folderId, userId) {
    this.sdk.validateParams(
      { folderId, userId },
      {
        folderId: { type: 'string', required: true },
        userId: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/developerApis/folders/${folderId}/shares/${userId}`,
      'DELETE',
    );
  }

  async createRequest(request = {}) {
    this.sdk.validateParams(
      { request },
      { request: { type: 'object', required: false } },
    );
    return internalRequest(this.sdk, '/developerApis/requests', 'POST', {
      body: request,
    });
  }

  async getRequest(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/developerApis/requests/${id}`, 'GET');
  }

  async updateRequest(id, updates = {}) {
    this.sdk.validateParams(
      { id, updates },
      {
        id: { type: 'string', required: true },
        updates: { type: 'object', required: true },
      },
    );
    return internalRequest(this.sdk, `/developerApis/requests/${id}`, 'PUT', {
      body: updates,
    });
  }

  async deleteRequest(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/developerApis/requests/${id}`, 'DELETE');
  }

  async cloneRequest(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(
      this.sdk,
      `/developerApis/requests/${id}/clone`,
      'POST',
      { body: {} },
    );
  }

  async listVars() {
    return internalRequest(this.sdk, '/developerApis/vars', 'GET');
  }

  async createVar(params = {}) {
    const { key, type, value, enabled } = params;
    this.sdk.validateParams(
      { key, type, value, enabled },
      {
        key: { type: 'string', required: false },
        type: { type: 'string', required: false },
        value: { type: 'string', required: false },
        enabled: { type: 'boolean', required: false },
      },
    );
    return internalRequest(this.sdk, '/developerApis/vars', 'POST', {
      body: { key, type, value, enabled },
    });
  }

  async updateVar(id, updates = {}) {
    this.sdk.validateParams(
      { id, updates },
      {
        id: { type: 'string', required: true },
        updates: { type: 'object', required: true },
      },
    );
    return internalRequest(this.sdk, `/developerApis/vars/${id}`, 'PUT', {
      body: updates,
    });
  }

  async deleteVar(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/developerApis/vars/${id}`, 'DELETE');
  }
}
