/**
 * Developer portal My APIs — account-scoped folders, requests, vars, sharing.
 * API prefix: /developerApis
 */
export class DeveloperApisService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Full library for the current user (owned + shared folders/requests + personal vars).
   * @returns {Promise<{ folders: object[], requests: object[], vars: object[], shares: object[] }>}
   */
  async getLibrary() {
    return this.sdk._fetch('/developerApis', 'GET');
  }

  // ——— Folders ———

  /**
   * @param {{ name?: string, parentId?: string|null, sort?: number }} [params]
   */
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
    return this.sdk._fetch('/developerApis/folders', 'POST', {
      body: { name, parentId, sort },
    });
  }

  /**
   * @param {string} id
   * @param {{ name?: string, parentId?: string|null, sort?: number }} updates
   */
  async updateFolder(id, updates = {}) {
    this.sdk.validateParams(
      { id, updates },
      {
        id: { type: 'string', required: true },
        updates: { type: 'object', required: true },
      },
    );
    return this.sdk._fetch(`/developerApis/folders/${id}`, 'PUT', {
      body: updates,
    });
  }

  /**
   * @param {string} id
   */
  async deleteFolder(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return this.sdk._fetch(`/developerApis/folders/${id}`, 'DELETE');
  }

  // ——— Folder sharing ———

  /**
   * @param {string} folderId
   */
  async listFolderShares(folderId) {
    this.sdk.validateParams(
      { folderId },
      { folderId: { type: 'string', required: true } },
    );
    return this.sdk._fetch(`/developerApis/folders/${folderId}/shares`, 'GET');
  }

  /**
   * Share a folder with a user.
   * @param {string} folderId
   * @param {{ userId: string, access?: 'full'|'limited' }} params
   */
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
    return this.sdk._fetch(`/developerApis/folders/${folderId}/shares`, 'POST', {
      body: { userId, access: access === 'full' ? 'full' : 'limited' },
    });
  }

  /**
   * @param {string} folderId
   * @param {string} userId
   */
  async unshareFolder(folderId, userId) {
    this.sdk.validateParams(
      { folderId, userId },
      {
        folderId: { type: 'string', required: true },
        userId: { type: 'string', required: true },
      },
    );
    return this.sdk._fetch(
      `/developerApis/folders/${folderId}/shares/${userId}`,
      'DELETE',
    );
  }

  // ——— Requests ———

  /**
   * @param {object} [request] freeform request body
   */
  async createRequest(request = {}) {
    this.sdk.validateParams(
      { request },
      { request: { type: 'object', required: false } },
    );
    return this.sdk._fetch('/developerApis/requests', 'POST', {
      body: request,
    });
  }

  /**
   * @param {string} id
   */
  async getRequest(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return this.sdk._fetch(`/developerApis/requests/${id}`, 'GET');
  }

  /**
   * @param {string} id
   * @param {object} updates
   */
  async updateRequest(id, updates = {}) {
    this.sdk.validateParams(
      { id, updates },
      {
        id: { type: 'string', required: true },
        updates: { type: 'object', required: true },
      },
    );
    return this.sdk._fetch(`/developerApis/requests/${id}`, 'PUT', {
      body: updates,
    });
  }

  /**
   * @param {string} id
   */
  async deleteRequest(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return this.sdk._fetch(`/developerApis/requests/${id}`, 'DELETE');
  }

  /**
   * Clone a request (caller becomes owner of the copy).
   * @param {string} id
   */
  async cloneRequest(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return this.sdk._fetch(`/developerApis/requests/${id}/clone`, 'POST', {
      body: {},
    });
  }

  // ——— Vars (personal) ———

  async listVars() {
    return this.sdk._fetch('/developerApis/vars', 'GET');
  }

  /**
   * @param {{ key?: string, type?: 'default'|'secret', value?: string, enabled?: boolean }} [params]
   */
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
    return this.sdk._fetch('/developerApis/vars', 'POST', {
      body: { key, type, value, enabled },
    });
  }

  /**
   * @param {string} id
   * @param {{ key?: string, type?: string, value?: string, enabled?: boolean }} updates
   */
  async updateVar(id, updates = {}) {
    this.sdk.validateParams(
      { id, updates },
      {
        id: { type: 'string', required: true },
        updates: { type: 'object', required: true },
      },
    );
    return this.sdk._fetch(`/developerApis/vars/${id}`, 'PUT', {
      body: updates,
    });
  }

  /**
   * @param {string} id
   */
  async deleteVar(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return this.sdk._fetch(`/developerApis/vars/${id}`, 'DELETE');
  }
}
