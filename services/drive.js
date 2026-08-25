import { internalRequest } from '../base.js';
import { StorageService } from './storage.js';

export class DriveService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async status() {
    const result = await internalRequest(this.sdk, '/drive/status', 'GET');
    return result;
  }

  /**
   * List Google Drive files and folders.
   * @param {Object} [options]
   * @param {string} [options.folderId]
   * @param {string} [options.search]
   * @param {number} [options.page]
   * @param {number} [options.pageSize]
   * @returns {Promise<Object>}
   */
  async listFiles({ folderId, search, page, pageSize } = {}) {
    this.sdk.validateParams(
      { folderId, search, page, pageSize },
      {
        folderId: { type: 'string', required: false },
        search: { type: 'string', required: false },
        page: { type: 'number', required: false },
        pageSize: { type: 'number', required: false },
      },
    );

    const query = {};
    if (folderId !== undefined) query.folderId = folderId;
    if (search !== undefined) query.search = search;
    if (page !== undefined) query.page = page;
    if (pageSize !== undefined) query.pageSize = pageSize;

    const result = await internalRequest(this.sdk, '/drive/files', 'GET', {
      query,
    });
    return result;
  }

  /**
   * Create a Google Drive folder.
   * @param {Object} options
   * @param {string} options.name
   * @param {string} [options.parentId]
   * @returns {Promise<Object>}
   */
  async createFolder({ name, parentId } = {}) {
    this.sdk.validateParams(
      { name, parentId },
      {
        name: { type: 'string', required: true },
        parentId: { type: 'string', required: false },
      },
    );

    const body = { name };
    if (parentId !== undefined) body.parentId = parentId;

    const result = await internalRequest(this.sdk, '/drive/folders', 'POST', {
      body,
    });
    return result;
  }

  /**
   * Rename and/or move a Google Drive folder.
   * @param {string} id
   * @param {Object} [updates]
   * @param {string} [updates.name]
   * @param {string} [updates.parentId]
   * @returns {Promise<Object>}
   */
  async updateFolder(id, { name, parentId } = {}) {
    this.sdk.validateParams(
      { id, name, parentId },
      {
        id: { type: 'string', required: true },
        name: { type: 'string', required: false },
        parentId: { type: 'string', required: false },
      },
    );

    const body = {};
    if (name !== undefined) body.name = name;
    if (parentId !== undefined) body.parentId = parentId;

    const result = await internalRequest(
      this.sdk,
      `/drive/folders/${id}`,
      'PATCH',
      { body },
      true,
    );
    return result;
  }

  async deleteFolder(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(
      this.sdk,
      `/drive/folders/${id}`,
      'DELETE',
    );
    return result;
  }

  /**
   * Rename a Google Drive file.
   * @param {string} id
   * @param {Object} [updates]
   * @param {string} [updates.name]
   * @returns {Promise<Object>}
   */
  async updateFile(id, { name } = {}) {
    this.sdk.validateParams(
      { id, name },
      {
        id: { type: 'string', required: true },
        name: { type: 'string', required: false },
      },
    );

    const body = {};
    if (name !== undefined) body.name = name;

    const result = await internalRequest(
      this.sdk,
      `/drive/files/${id}`,
      'PATCH',
      { body },
      true,
    );
    return result;
  }

  /**
   * Move Drive files into a folder.
   * @param {Object} options
   * @param {string[]} options.ids
   * @param {string} [options.folderId]
   * @returns {Promise<Object>}
   */
  async moveFiles({ ids, folderId } = {}) {
    this.sdk.validateParams(
      { ids, folderId },
      {
        ids: { type: 'array', required: true },
        folderId: { type: 'string', required: false },
      },
    );

    const body = { ids };
    if (folderId !== undefined) body.folderId = folderId;

    const result = await internalRequest(
      this.sdk,
      '/drive/files/move',
      'PATCH',
      { body },
      true,
    );
    return result;
  }

  async deleteFile(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(
      this.sdk,
      `/drive/files/${id}`,
      'DELETE',
    );
    return result;
  }

  /**
   * Upload a file to Google Drive.
   * @param {Object} config
   * @param {Object} config.file - Buffer, File, or stream
   * @param {string} [config.fileName]
   * @param {string} [config.parentId]
   * @param {Function} [config.onProgress]
   * @returns {Promise<Object>}
   */
  async upload({ file, fileName, parentId, onProgress } = {}) {
    this.sdk.validateParams(
      { file, fileName, parentId },
      {
        file: { type: 'object', required: true },
        fileName: { type: 'string', required: false },
        parentId: { type: 'string', required: false },
      },
    );

    const formFields = [];
    if (parentId) formFields.push(['parentId', parentId]);

    const storage = new StorageService(this.sdk);
    return storage._performUpload(
      file,
      fileName,
      formFields,
      '/drive/upload',
      'POST',
      onProgress,
    );
  }

  async browserToken() {
    const result = await internalRequest(
      this.sdk,
      '/drive/browserToken',
      'POST',
    );
    return result;
  }
}
