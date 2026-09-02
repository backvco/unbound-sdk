import { internalRequest } from '../../base.js';
export class TenDlcCampaignManagementService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * List all 10DLC campaigns with optional filtering
   * @param {Object} [params] - Filter parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=50] - Items per page
   * @param {string} [params.name] - Filter by campaign name
   * @param {string} [params.status] - Filter by status
   * @param {string} [params.operatorType='contains'] - Filter operator: contains, equals, startsWith, endsWith
   * @returns {Promise<Array>} List of campaigns
   */
  async list({ page, limit, name, status, operatorType } = {}) {
    const queryParams = new URLSearchParams();

    if (page !== undefined) queryParams.append('page', page);
    if (limit !== undefined) queryParams.append('limit', limit);
    if (name) queryParams.append('name', name);
    if (status) queryParams.append('status', status);
    if (operatorType) queryParams.append('operatorType', operatorType);

    const url = queryParams.toString()
      ? `/messaging/campaigns/10dlc/campaign?${queryParams.toString()}`
      : '/messaging/campaigns/10dlc/campaign';

    const result = await internalRequest(this.sdk, url, 'GET');
    return result;
  }

  /**
   * Create a new 10DLC campaign draft
   * @param {Object} params - Campaign parameters
   * @param {string} params.name - Campaign name (required)
   * @param {string} params.brandId - Brand ID (required)
   * @param {string} [params.description] - Campaign description
   * @param {string} [params.messageFlow] - How users opt in
   * @param {string} [params.useCase] - Use case category
   * @param {string[]} [params.samples] - Sample messages (2-5)
   * @param {boolean} [params.autoRenewal] - Auto-renew campaign
   * @param {string} [params.vertical] - Vertical category
   * @param {string[]} [params.subUseCases] - Sub use cases
   * @param {string} [params.helpMessage] - Response to HELP keyword
   * @param {string[]} [params.helpKeywords] - Help keywords
   * @param {string} [params.optInMessage] - Opt-in message
   * @param {string[]} [params.optInKeywords] - Opt-in keywords
   * @param {string} [params.optOutMessage] - Opt-out message
   * @param {string[]} [params.optOutKeywords] - Opt-out keywords
   * @param {boolean} [params.affiliateMarketing] - Affiliate marketing
   * @param {boolean} [params.ageGated] - Age gated content
   * @param {boolean} [params.directLending] - Direct lending
   * @param {boolean} [params.embeddedLink] - Messages contain URLs
   * @param {boolean} [params.embeddedPhone] - Messages contain phone numbers
   * @param {boolean} [params.numberPool] - Using number pool
   * @param {boolean} [params.subscriberHelp] - HELP keyword supported
   * @param {boolean} [params.subscriberOptin] - Subscribers opted in
   * @param {boolean} [params.subscriberOptout] - Subscribers can opt out
   * @param {boolean} [params.termsAndConditions] - T&C accepted
   * @param {string[]} [params.mnoIds] - MNO IDs
   * @param {string} [params.referenceId] - Custom reference ID
   * @returns {Promise<Object>} Created campaign details
   */
  async create({
    name,
    brandId,
    description,
    messageFlow,
    useCase,
    samples,
    autoRenewal,
    vertical,
    subUseCases,
    helpMessage,
    helpKeywords,
    optInMessage,
    optInKeywords,
    optOutMessage,
    optOutKeywords,
    affiliateMarketing,
    ageGated,
    directLending,
    embeddedLink,
    embeddedPhone,
    numberPool,
    subscriberHelp,
    subscriberOptin,
    subscriberOptout,
    termsAndConditions,
    mnoIds,
    referenceId,
  }) {
    this.sdk.validateParams(
      { name, brandId },
      {
        name: { type: 'string', required: true },
        brandId: { type: 'string', required: true },
      },
    );

    const campaignData = {
      name,
      brandId,
      description,
      messageFlow,
      useCase,
      samples,
    };

    if (autoRenewal !== undefined) campaignData.autoRenewal = autoRenewal;
    if (vertical !== undefined) campaignData.vertical = vertical;
    if (subUseCases !== undefined) campaignData.subUseCases = subUseCases;
    if (helpMessage !== undefined) campaignData.helpMessage = helpMessage;
    if (helpKeywords !== undefined) campaignData.helpKeywords = helpKeywords;
    if (optInMessage !== undefined) campaignData.optInMessage = optInMessage;
    if (optInKeywords !== undefined) campaignData.optInKeywords = optInKeywords;
    if (optOutMessage !== undefined) campaignData.optOutMessage = optOutMessage;
    if (optOutKeywords !== undefined)
      campaignData.optOutKeywords = optOutKeywords;
    if (affiliateMarketing !== undefined)
      campaignData.affiliateMarketing = affiliateMarketing;
    if (ageGated !== undefined) campaignData.ageGated = ageGated;
    if (directLending !== undefined) campaignData.directLending = directLending;
    if (embeddedLink !== undefined) campaignData.embeddedLink = embeddedLink;
    if (embeddedPhone !== undefined) campaignData.embeddedPhone = embeddedPhone;
    if (numberPool !== undefined) campaignData.numberPool = numberPool;
    if (subscriberHelp !== undefined)
      campaignData.subscriberHelp = subscriberHelp;
    if (subscriberOptin !== undefined)
      campaignData.subscriberOptin = subscriberOptin;
    if (subscriberOptout !== undefined)
      campaignData.subscriberOptout = subscriberOptout;
    if (termsAndConditions !== undefined)
      campaignData.termsAndConditions = termsAndConditions;
    if (mnoIds !== undefined) campaignData.mnoIds = mnoIds;
    if (referenceId !== undefined) campaignData.referenceId = referenceId;

    const result = await internalRequest(this.sdk, 
      '/messaging/campaigns/10dlc/campaign',
      'POST',
      { body: campaignData },
    );
    return result;
  }

  /**
   * Submit a draft 10DLC campaign to TCR for registration
   * @param {string} campaignId - Campaign ID to submit
   * @param {Object} params - Submit parameters
   * @param {boolean} params.termsAndConditions - Must be true to accept carrier T&C
   * @returns {Promise<Object>} Submission result with campaign status
   */
  async submit(campaignId, { termsAndConditions } = {}) {
    this.sdk.validateParams(
      { campaignId, termsAndConditions },
      {
        campaignId: { type: 'string', required: true },
        termsAndConditions: { type: 'boolean', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/10dlc/campaign/${campaignId}/submit`,
      'POST',
      { body: { termsAndConditions } },
    );
    return result;
  }

  /**
   * Duplicate an existing campaign as a new Draft
   * @param {string} campaignId - Source campaign ID to copy from
   * @param {Object} [params] - Optional parameters
   * @param {string} [params.name] - Name for the new campaign (defaults to "Original Name (Copy)")
   * @returns {Promise<Object>} New draft campaign details
   */
  async duplicate(campaignId, { name } = {}) {
    this.sdk.validateParams(
      { campaignId },
      {
        campaignId: { type: 'string', required: true },
      },
    );

    const body = {};
    if (name !== undefined) body.name = name;

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/10dlc/campaign/${campaignId}/duplicate`,
      'POST',
      { body },
    );
    return result;
  }

  /**
   * Get a 10DLC campaign by ID
   */
  async get(campaignId) {
    this.sdk.validateParams(
      { campaignId },
      {
        campaignId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/10dlc/campaign/${campaignId}`,
      'GET',
    );
    return result;
  }

  /**
   * Update a 10DLC campaign
   * @param {string} campaignId - Campaign ID to update
   * @param {Object} params - Update parameters
   * @param {string} [params.name] - Campaign name
   * @param {string} [params.description] - Campaign description
   * @param {string} [params.messageFlow] - How users opt in
   * @param {string} [params.useCase] - Use case category
   * @param {string} [params.vertical] - Vertical category
   * @param {string[]} [params.samples] - Sample messages (up to 5)
   * @param {string[]} [params.subUseCases] - Sub use cases
   * @param {string} [params.webhookUrl] - Webhook URL
   * @param {string} [params.helpMessage] - Response to HELP keyword
   * @param {string[]} [params.helpKeywords] - Help keywords
   * @param {string} [params.optInMessage] - Opt-in message
   * @param {string[]} [params.optInKeywords] - Opt-in keywords
   * @param {string} [params.optOutMessage] - Opt-out message
   * @param {string[]} [params.optOutKeywords] - Opt-out keywords
   * @param {boolean} [params.affiliateMarketing] - Affiliate marketing
   * @param {boolean} [params.ageGated] - Age gated content
   * @param {boolean} [params.directLending] - Direct lending
   * @param {boolean} [params.embeddedLink] - Messages contain URLs
   * @param {boolean} [params.embeddedPhone] - Messages contain phone numbers
   * @param {boolean} [params.numberPool] - Using number pool
   * @param {boolean} [params.autoRenewal] - Auto-renew campaign
   * @param {boolean} [params.subscriberHelp] - HELP keyword supported
   * @param {boolean} [params.subscriberOptin] - Subscribers opted in
   * @param {boolean} [params.subscriberOptout] - Subscribers can opt out
   * @param {boolean} [params.termsAndConditions] - T&C accepted
   * @param {string[]} [params.mnoIds] - MNO IDs
   * @returns {Promise<Object>} Updated campaign information
   */
  async update(
    campaignId,
    {
      name,
      description,
      messageFlow,
      useCase,
      vertical,
      samples,
      subUseCases,
      webhookUrl,
      helpMessage,
      helpKeywords,
      optInMessage,
      optInKeywords,
      optOutMessage,
      optOutKeywords,
      affiliateMarketing,
      ageGated,
      directLending,
      embeddedLink,
      embeddedPhone,
      numberPool,
      autoRenewal,
      subscriberHelp,
      subscriberOptin,
      subscriberOptout,
      termsAndConditions,
      mnoIds,
    } = {},
  ) {
    this.sdk.validateParams(
      { campaignId },
      {
        campaignId: { type: 'string', required: true },
      },
    );

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (messageFlow !== undefined) updateData.messageFlow = messageFlow;
    if (useCase !== undefined) updateData.useCase = useCase;
    if (vertical !== undefined) updateData.vertical = vertical;
    if (samples !== undefined) updateData.samples = samples;
    if (subUseCases !== undefined) updateData.subUseCases = subUseCases;
    if (webhookUrl !== undefined) updateData.webhookUrl = webhookUrl;
    if (helpMessage !== undefined) updateData.helpMessage = helpMessage;
    if (helpKeywords !== undefined) updateData.helpKeywords = helpKeywords;
    if (optInMessage !== undefined) updateData.optInMessage = optInMessage;
    if (optInKeywords !== undefined) updateData.optInKeywords = optInKeywords;
    if (optOutMessage !== undefined) updateData.optOutMessage = optOutMessage;
    if (optOutKeywords !== undefined)
      updateData.optOutKeywords = optOutKeywords;
    if (affiliateMarketing !== undefined)
      updateData.affiliateMarketing = affiliateMarketing;
    if (ageGated !== undefined) updateData.ageGated = ageGated;
    if (directLending !== undefined) updateData.directLending = directLending;
    if (embeddedLink !== undefined) updateData.embeddedLink = embeddedLink;
    if (embeddedPhone !== undefined) updateData.embeddedPhone = embeddedPhone;
    if (numberPool !== undefined) updateData.numberPool = numberPool;
    if (autoRenewal !== undefined) updateData.autoRenewal = autoRenewal;
    if (subscriberHelp !== undefined)
      updateData.subscriberHelp = subscriberHelp;
    if (subscriberOptin !== undefined)
      updateData.subscriberOptin = subscriberOptin;
    if (subscriberOptout !== undefined)
      updateData.subscriberOptout = subscriberOptout;
    if (termsAndConditions !== undefined)
      updateData.termsAndConditions = termsAndConditions;
    if (mnoIds !== undefined) updateData.mnoIds = mnoIds;

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/10dlc/campaign/${campaignId}`,
      'PUT',
      { body: updateData },
    );
    return result;
  }

  /**
   * Delete a 10DLC campaign
   */
  async delete(campaignId) {
    this.sdk.validateParams(
      { campaignId },
      {
        campaignId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/10dlc/campaign/${campaignId}`,
      'DELETE',
    );
    return result;
  }

  /**
   * Get campaign operation status
   */
  async getOperationStatus(campaignId) {
    this.sdk.validateParams(
      { campaignId },
      {
        campaignId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/10dlc/campaign/${campaignId}/operationStatus`,
      'GET',
    );
    return result;
  }

  /**
   * Get MNO campaign metadata
   */
  async getMnoMetaData(campaignId) {
    this.sdk.validateParams(
      { campaignId },
      {
        campaignId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/10dlc/campaign/${campaignId}/mnoMetaData`,
      'GET',
    );
    return result;
  }

  /**
   * List phone numbers assigned to a campaign
   * @param {string} campaignId - Campaign ID
   * @returns {Promise<Array>} List of phone numbers with linking status
   */
  async listPhoneNumbers(campaignId) {
    this.sdk.validateParams(
      { campaignId },
      {
        campaignId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/10dlc/campaign/${campaignId}/phoneNumbers`,
      'GET',
    );
    return result;
  }

  /**
   * Add phone number to campaign
   */
  async addPhoneNumber(campaignId, phoneNumberData) {
    this.sdk.validateParams(
      { campaignId, phoneNumberData },
      {
        campaignId: { type: 'string', required: true },
        phoneNumberData: { type: 'object', required: true },
      },
    );

    const options = {
      body: phoneNumberData,
    };

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/10dlc/campaign/${campaignId}/phoneNumber`,
      'POST',
      options,
    );
    return result;
  }

  /**
   * Update phone number in campaign
   */
  async updatePhoneNumber(campaignId, phoneNumberData) {
    this.sdk.validateParams(
      { campaignId, phoneNumberData },
      {
        campaignId: { type: 'string', required: true },
        phoneNumberData: { type: 'object', required: true },
      },
    );

    const options = {
      body: phoneNumberData,
    };

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/10dlc/campaign/${campaignId}/phoneNumber`,
      'PUT',
      options,
    );
    return result;
  }

  /**
   * Bulk-add/move phone numbers onto a campaign
   * @param {string} campaignId - Campaign ID
   * @param {Object} options
   * @param {string[]} options.phoneNumbers - Phone numbers in E.164 format (1-200)
   * @param {boolean} [options.force] - Move numbers off another campaign instead
   *   of returning a 409 conflict
   * @returns {Promise<Object>} `{ id, results: [{ phoneNumber, status, ... }] }`
   */
  async addPhoneNumbers(campaignId, { phoneNumbers, force } = {}) {
    this.sdk.validateParams(
      { campaignId, phoneNumbers },
      {
        campaignId: { type: 'string', required: true },
        phoneNumbers: { type: 'array', required: true },
      },
    );

    const options = {
      body: { phoneNumbers, force },
    };

    const result = await internalRequest(this.sdk,
      `/messaging/campaigns/10dlc/campaign/${campaignId}/phoneNumbers`,
      'POST',
      options,
    );
    return result;
  }

  /**
   * Remove phone number from campaign
   */
  async removePhoneNumber(campaignId, phoneNumberData) {
    this.sdk.validateParams(
      { campaignId, phoneNumberData },
      {
        campaignId: { type: 'string', required: true },
        phoneNumberData: { type: 'object', required: true },
      },
    );

    const options = {
      body: phoneNumberData,
    };

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/10dlc/campaign/${campaignId}/phoneNumber`,
      'DELETE',
      options,
    );
    return result;
  }
}
