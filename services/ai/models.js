import { internalRequest } from '../../base.js';

/**
 * Platform model catalog — product names only (no vendor provider/model).
 */
export class ModelsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * List platform models available to this account.
   * @returns {Promise<Object>} { models, features, recommended }
   */
  async list() {
    return internalRequest(this.sdk, '/ai/models', 'GET');
  }
}
