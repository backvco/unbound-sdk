import { internalRequest } from '../../base.js';

// phoneNumbers/carrier.js :: PhoneNumberCarrierService :: carrier sync/lookup/delete for owned numbers
export class PhoneNumberCarrierService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async sync(carrier, { updateVoiceConnection, updateMessagingConnection }) {
    this.sdk.validateParams(
      { carrier },
      {
        carrier: { type: 'string', required: true },
        updateVoiceConnection: { type: 'boolean', required: false },
        updateMessagingConnection: { type: 'boolean', required: false },
      },
    );

    const params = {
      query: { updateVoiceConnection, updateMessagingConnection },
    };

    const result = await internalRequest(this.sdk,
      `/phoneNumbers/carrier/syncPhoneNumbers/${carrier}`,
      'POST',
      params,
    );
    return result;
  }

  async getDetails(phoneNumber) {
    this.sdk.validateParams(
      { phoneNumber },
      {
        phoneNumber: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk,
      `/phoneNumbers/carrier/${phoneNumber}`,
      'GET',
    );
    return result;
  }

  async delete(phoneNumber) {
    this.sdk.validateParams(
      { phoneNumber },
      {
        phoneNumber: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk,
      `/phoneNumbers/carrier/${phoneNumber}`,
      'DELETE',
    );
    return result;
  }
}
