import { TollFreeCampaignsService } from './TollFreeCampaignsService.js';
import { TenDlcCampaignsService } from './TenDlcCampaignsService.js';
import { internalRequest } from '../../base.js';

export class CampaignsService {
  constructor(sdk) {
    this.sdk = sdk;
    this.tollFree = new TollFreeCampaignsService(sdk);
    this.tenDlc = new TenDlcCampaignsService(sdk);
  }

  /**
   * Fetch a privacy-policy URL and regex-check SMS disclosure language.
   * Does not block registration — callers should warn, not fail.
   * @param {Object} params
   * @param {string} params.url
   * @param {'privacy'|'optin'} [params.kind]
   * @returns {Promise<Object>}
   */
  async checkPrivacyPolicy({ url, kind }) {
    this.sdk.validateParams(
      { url, kind },
      {
        url: { type: 'string', required: true },
        kind: { type: 'string', required: false },
      },
    );
    const body = { url };
    if (kind) body.kind = kind;
    return internalRequest(
      this.sdk,
      '/messaging/campaigns/privacy-check',
      'POST',
      { body },
    );
  }
}
