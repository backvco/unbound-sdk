import { internalRequest } from '../../base.js';

// phoneNumbers/cnam.js :: CNAM methods :: caller-id name enable/update + carrier check
export const cnamMethods = {
  async updateCnam(id, { enabled, name }) {
    this.sdk.validateParams(
      { id, enabled, name },
      {
        id: { type: 'string', required: true },
        enabled: { type: 'boolean', required: true },
        name: { type: 'string', required: false },
      },
    );

    const params = {
      body: { enabled, ...(name !== undefined ? { name } : {}) },
    };

    const result = await internalRequest(this.sdk,
      `/phoneNumbers/${id}/cnam`,
      'PUT',
      params,
    );
    return result;
  },

  async checkCnam(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk,
      `/phoneNumbers/${id}/cnam/check`,
      'POST',
      {},
    );
    return result;
  },
};
