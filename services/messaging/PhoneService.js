import { internalRequest } from '../../base.js';

export class PhoneService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Autocomplete people/companies for the phone dialer (app1-api#198 / app1-api#255).
   * Same auth as other `/messaging/` routes (checkApiAuth).
   *
   * @param {Object} [options]
   * @param {string} [options.q] - Search query (API requires 1–200 chars)
   * @param {number} [options.limit] - Max suggestions (API default 20, max 50)
   * @returns {Promise<Object>} { suggestions: [{ phone, channelId, name?, title?, company?, personId?, companyId? }] }
   * @example
   * const { suggestions } = await sdk.messaging.phone.dialerAutocomplete({
   *   q: '555',
   *   limit: 8,
   * });
   */
  async dialerAutocomplete({ q, limit } = {}) {
    this.sdk.validateParams(
      { q, limit },
      {
        q: { type: 'string', required: false },
        limit: { type: 'number', required: false },
      },
    );
    return internalRequest(
      this.sdk,
      '/messaging/phone/dialer-autocomplete',
      'GET',
      { query: { q, limit } },
    );
  }
}
