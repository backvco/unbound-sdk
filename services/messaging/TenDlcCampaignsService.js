import { TenDlcBrandsService } from './TenDlcBrandsService.js';
import { TenDlcCampaignManagementService } from './TenDlcCampaignManagementService.js';

import { internalRequest } from '../../base.js';
export class TenDlcCampaignsService {
  constructor(sdk) {
    this.sdk = sdk;
    this.brands = new TenDlcBrandsService(sdk);
    this.campaigns = new TenDlcCampaignManagementService(sdk);
  }

  /**
   * Get phone number campaign status for 10DLC
   * @param {string} phoneNumber - Phone number to check
   * @returns {Promise<Object>} Campaign status information
   */
  async getPhoneNumberCampaignStatus(phoneNumber) {
    this.sdk.validateParams(
      { phoneNumber },
      {
        phoneNumber: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/10dlc/phoneNumber/${encodeURIComponent(
        phoneNumber,
      )}/campaignStatus`,
      'GET',
    );
    return result;
  }
}
