import { internalRequest } from '../base.js';
export class GenerateIdService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async createId({ service, serviceCode }) {
    // Either service or serviceCode is required
    if (!service && !serviceCode) {
      throw new Error('Either service or serviceCode parameter is required');
    }

    this.sdk.validateParams(
      { service, serviceCode },
      {
        service: { type: 'string', required: false },
        serviceCode: { type: 'string', required: false },
      },
    );

    const params = {
      query: { service, serviceCode },
    };

    const result = await internalRequest(this.sdk, '/generateId/', 'POST', params);
    return result;
  }

  async validateId(input) {
    this.sdk.validateParams(
      { input },
      {
        input: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, `/generateId/${input}`, 'GET');
    return result;
  }
}
