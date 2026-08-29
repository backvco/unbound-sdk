import { internalRequest } from '../base.js';
export class LookupService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async cnam(phoneNumber) {
    this.sdk.validateParams(
      { phoneNumber },
      {
        phoneNumber: { type: 'string', required: true },
      },
    );

    const params = {
      query: { phoneNumber },
    };

    const result = await internalRequest(this.sdk, '/lookup/cnam', 'GET', params);
    return result;
  }

  async lrn(phoneNumber, cnam = false) {
    this.sdk.validateParams(
      { phoneNumber, cnam },
      {
        phoneNumber: { type: 'string', required: true },
        cnam: { type: 'boolean', required: false },
      },
    );

    const params = {
      query: { phoneNumber, cnam },
    };

    const result = await internalRequest(this.sdk, '/lookup/lrn', 'GET', params);
    return result;
  }

  async number(phoneNumber) {
    this.sdk.validateParams(
      { phoneNumber },
      {
        phoneNumber: { type: 'string', required: true },
      },
    );

    const params = {
      query: { phoneNumber },
    };

    const result = await internalRequest(this.sdk, '/lookup/number', 'GET', params);
    return result;
  }
}
