import { internalRequest } from '../../base.js';
export class TollFreeCampaignsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Create toll-free campaign
   * @param {Object} params - Campaign parameters
   * @param {string} params.name - Campaign name (required)
   * @param {string} [params.campaignDescription] - Campaign description
   * @param {string} [params.address1] - Business address line 1
   * @param {string} [params.address2] - Business address line 2
   * @param {string} [params.city] - Business city
   * @param {string} [params.state] - Business state
   * @param {string} [params.zip] - Business zip code
   * @param {string} [params.pocFirstName] - Point of contact first name
   * @param {string} [params.pocLastName] - Point of contact last name
   * @param {string} [params.pocPhoneNumber] - Point of contact phone
   * @param {string} [params.pocEmail] - Point of contact email
   * @param {string} [params.businessName] - Business name
   * @param {string} [params.website] - Business website
   * @param {string} [params.messageVolume] - Expected message volume
   * @param {string} [params.optInWorkflow] - Opt-in workflow description
   * @param {Array<string>} [params.optInWorkflowUrls] - Opt-in workflow image URLs
   * @param {Array<string>} [params.phoneNumbers] - Phone numbers for campaign
   * @param {string} [params.productionMessageExample] - Production message example
   * @param {string} [params.useCase] - Use case category
   * @param {string} [params.useCaseDescription] - Use case description
   * @param {string} [params.webhookUrl] - Webhook URL
   * @param {string} [params.businessRegistrationNumber] - Business registration number
   * @param {string} [params.businessRegistrationType] - Business registration type
   * @param {string} [params.businessRegistrationCountry] - Business registration country (ISO 3166-1 alpha-2)
   * @param {string} [params.doingBusinessAs] - Doing business as name
   * @param {string} [params.entityType] - Entity type
   * @param {string} [params.optInConfirmationResponse] - Opt-in confirmation response
   * @param {string} [params.helpMessageResponse] - Help message response
   * @param {string} [params.privacyPolicyURL] - Privacy policy URL
   * @param {string} [params.termsAndConditionURL] - Terms and conditions URL
   * @param {boolean} [params.ageGatedContent] - Age gated content flag
   * @param {string} [params.optInKeywords] - Opt-in keywords
   * @returns {Promise<Object>} Created campaign details
   */
  async create({
    name,
    campaignDescription,
    address1,
    address2,
    city,
    state,
    zip,
    pocFirstName,
    pocLastName,
    pocPhoneNumber,
    pocEmail,
    businessName,
    website,
    messageVolume,
    optInWorkflow,
    optInWorkflowUrls,
    phoneNumbers,
    productionMessageExample,
    useCase,
    useCaseDescription,
    webhookUrl,
    businessRegistrationNumber,
    businessRegistrationType,
    businessRegistrationCountry,
    doingBusinessAs,
    entityType,
    optInConfirmationResponse,
    helpMessageResponse,
    privacyPolicyURL,
    termsAndConditionURL,
    ageGatedContent,
    optInKeywords,
  }) {
    this.sdk.validateParams(
      { name },
      {
        name: { type: 'string', required: true },
      },
    );

    const campaignData = { name };

    if (campaignDescription !== undefined)
      campaignData.campaignDescription = campaignDescription;
    if (address1 !== undefined) campaignData.address1 = address1;
    if (address2 !== undefined) campaignData.address2 = address2;
    if (city !== undefined) campaignData.city = city;
    if (state !== undefined) campaignData.state = state;
    if (zip !== undefined) campaignData.zip = zip;
    if (pocFirstName !== undefined) campaignData.pocFirstName = pocFirstName;
    if (pocLastName !== undefined) campaignData.pocLastName = pocLastName;
    if (pocPhoneNumber !== undefined)
      campaignData.pocPhoneNumber = pocPhoneNumber;
    if (pocEmail !== undefined) campaignData.pocEmail = pocEmail;
    if (businessName !== undefined) campaignData.businessName = businessName;
    if (website !== undefined) campaignData.website = website;
    if (messageVolume !== undefined) campaignData.messageVolume = messageVolume;
    if (optInWorkflow !== undefined) campaignData.optInWorkflow = optInWorkflow;
    if (optInWorkflowUrls !== undefined)
      campaignData.optInWorkflowUrls = optInWorkflowUrls;
    if (phoneNumbers !== undefined) campaignData.phoneNumbers = phoneNumbers;
    if (productionMessageExample !== undefined)
      campaignData.productionMessageExample = productionMessageExample;
    if (useCase !== undefined) campaignData.useCase = useCase;
    if (useCaseDescription !== undefined)
      campaignData.useCaseDescription = useCaseDescription;
    if (webhookUrl !== undefined) campaignData.webhookUrl = webhookUrl;
    if (businessRegistrationNumber !== undefined)
      campaignData.businessRegistrationNumber = businessRegistrationNumber;
    if (businessRegistrationType !== undefined)
      campaignData.businessRegistrationType = businessRegistrationType;
    if (businessRegistrationCountry !== undefined)
      campaignData.businessRegistrationCountry = businessRegistrationCountry;
    if (doingBusinessAs !== undefined)
      campaignData.doingBusinessAs = doingBusinessAs;
    if (entityType !== undefined) campaignData.entityType = entityType;
    if (optInConfirmationResponse !== undefined)
      campaignData.optInConfirmationResponse = optInConfirmationResponse;
    if (helpMessageResponse !== undefined)
      campaignData.helpMessageResponse = helpMessageResponse;
    if (privacyPolicyURL !== undefined)
      campaignData.privacyPolicyURL = privacyPolicyURL;
    if (termsAndConditionURL !== undefined)
      campaignData.termsAndConditionURL = termsAndConditionURL;
    if (ageGatedContent !== undefined)
      campaignData.ageGatedContent = ageGatedContent;
    if (optInKeywords !== undefined) campaignData.optInKeywords = optInKeywords;

    const result = await internalRequest(this.sdk, 
      '/messaging/campaigns/tollfree',
      'POST',
      { body: campaignData },
    );
    return result;
  }

  /**
   * Get toll-free campaign by ID
   * @param {string} campaignId - Campaign ID
   * @returns {Promise<Object>} Campaign details
   */
  async get(campaignId) {
    this.sdk.validateParams(
      { campaignId },
      {
        campaignId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/tollfree/${campaignId}`,
      'GET',
    );
    return result;
  }

  /**
   * Update toll-free campaign
   * @param {string} campaignId - Campaign ID to update
   * @param {Object} params - Update parameters
   * @returns {Promise<Object>} Updated campaign information
   */
  async update(
    campaignId,
    {
      name,
      campaignDescription,
      address1,
      address2,
      city,
      state,
      zip,
      pocFirstName,
      pocLastName,
      pocPhoneNumber,
      pocEmail,
      businessName,
      website,
      messageVolume,
      optInWorkflow,
      optInWorkflowUrls,
      phoneNumbers,
      productionMessageExample,
      useCase,
      useCaseDescription,
      webhookUrl,
      businessRegistrationNumber,
      businessRegistrationType,
      businessRegistrationCountry,
      doingBusinessAs,
      entityType,
      optInConfirmationResponse,
      helpMessageResponse,
      privacyPolicyURL,
      termsAndConditionURL,
      ageGatedContent,
      optInKeywords,
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
    if (campaignDescription !== undefined)
      updateData.campaignDescription = campaignDescription;
    if (address1 !== undefined) updateData.address1 = address1;
    if (address2 !== undefined) updateData.address2 = address2;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (zip !== undefined) updateData.zip = zip;
    if (pocFirstName !== undefined) updateData.pocFirstName = pocFirstName;
    if (pocLastName !== undefined) updateData.pocLastName = pocLastName;
    if (pocPhoneNumber !== undefined)
      updateData.pocPhoneNumber = pocPhoneNumber;
    if (pocEmail !== undefined) updateData.pocEmail = pocEmail;
    if (businessName !== undefined) updateData.businessName = businessName;
    if (website !== undefined) updateData.website = website;
    if (messageVolume !== undefined) updateData.messageVolume = messageVolume;
    if (optInWorkflow !== undefined) updateData.optInWorkflow = optInWorkflow;
    if (optInWorkflowUrls !== undefined)
      updateData.optInWorkflowUrls = optInWorkflowUrls;
    if (phoneNumbers !== undefined) updateData.phoneNumbers = phoneNumbers;
    if (productionMessageExample !== undefined)
      updateData.productionMessageExample = productionMessageExample;
    if (useCase !== undefined) updateData.useCase = useCase;
    if (useCaseDescription !== undefined)
      updateData.useCaseDescription = useCaseDescription;
    if (webhookUrl !== undefined) updateData.webhookUrl = webhookUrl;
    if (businessRegistrationNumber !== undefined)
      updateData.businessRegistrationNumber = businessRegistrationNumber;
    if (businessRegistrationType !== undefined)
      updateData.businessRegistrationType = businessRegistrationType;
    if (businessRegistrationCountry !== undefined)
      updateData.businessRegistrationCountry = businessRegistrationCountry;
    if (doingBusinessAs !== undefined)
      updateData.doingBusinessAs = doingBusinessAs;
    if (entityType !== undefined) updateData.entityType = entityType;
    if (optInConfirmationResponse !== undefined)
      updateData.optInConfirmationResponse = optInConfirmationResponse;
    if (helpMessageResponse !== undefined)
      updateData.helpMessageResponse = helpMessageResponse;
    if (privacyPolicyURL !== undefined)
      updateData.privacyPolicyURL = privacyPolicyURL;
    if (termsAndConditionURL !== undefined)
      updateData.termsAndConditionURL = termsAndConditionURL;
    if (ageGatedContent !== undefined)
      updateData.ageGatedContent = ageGatedContent;
    if (optInKeywords !== undefined) updateData.optInKeywords = optInKeywords;

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/tollfree/${campaignId}`,
      'PUT',
      { body: updateData },
    );
    return result;
  }

  async delete(campaignId) {
    this.sdk.validateParams(
      { campaignId },
      {
        campaignId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/tollfree/${campaignId}`,
      'DELETE',
    );
    return result;
  }

  /**
   * List all toll-free campaigns with optional filtering
   * @param {Object} [params] - Filter parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=50] - Items per page
   * @param {string} [params.name] - Filter by campaign name
   * @param {string} [params.status] - Filter by status
   * @param {string} [params.operatorType='contains'] - Filter operator
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
      ? `/messaging/campaigns/tollfree?${queryParams.toString()}`
      : '/messaging/campaigns/tollfree';

    const result = await internalRequest(this.sdk, url, 'GET');
    return result;
  }

  async refreshStatus(campaignId) {
    this.sdk.validateParams(
      { campaignId },
      {
        campaignId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/tollfree/refresh/${campaignId}`,
      'GET',
    );
    return result;
  }

  /**
   * Submit a draft toll-free campaign for verification
   * @param {string} campaignId - Campaign ID to submit
   * @param {Object} params - Submit parameters
   * @param {boolean} params.termsAndConditions - Must be true to accept T&C
   * @returns {Promise<Object>} Submission result
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
      `/messaging/campaigns/tollfree/${campaignId}/submit`,
      'POST',
      { body: { termsAndConditions } },
    );
    return result;
  }

  /**
   * Duplicate an existing campaign as a new Draft
   * @param {string} campaignId - Source campaign ID
   * @param {Object} [params] - Optional parameters
   * @param {string} [params.name] - Name for the new campaign
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
      `/messaging/campaigns/tollfree/${campaignId}/duplicate`,
      'POST',
      { body },
    );
    return result;
  }

  /**
   * List phone numbers assigned to a campaign
   * @param {string} campaignId - Campaign ID
   * @returns {Promise<Array>} List of phone numbers
   */
  async listPhoneNumbers(campaignId) {
    this.sdk.validateParams(
      { campaignId },
      {
        campaignId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/tollfree/${campaignId}/phoneNumbers`,
      'GET',
    );
    return result;
  }

  /**
   * Add phone number to campaign
   * @param {string} campaignId - Campaign ID
   * @param {Object} params - Phone number data
   * @param {string} params.phoneNumber - Phone number to add
   * @returns {Promise<Object>} Result
   */
  async addPhoneNumber(campaignId, { phoneNumber }) {
    this.sdk.validateParams(
      { campaignId, phoneNumber },
      {
        campaignId: { type: 'string', required: true },
        phoneNumber: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/tollfree/${campaignId}/phoneNumber`,
      'POST',
      { body: { phoneNumber } },
    );
    return result;
  }

  /**
   * Remove phone number from campaign
   * @param {string} campaignId - Campaign ID
   * @param {Object} params - Phone number data
   * @param {string} params.phoneNumber - Phone number to remove
   * @returns {Promise<Object>} Result
   */
  async removePhoneNumber(campaignId, { phoneNumber }) {
    this.sdk.validateParams(
      { campaignId, phoneNumber },
      {
        campaignId: { type: 'string', required: true },
        phoneNumber: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/tollfree/${campaignId}/phoneNumber`,
      'DELETE',
      { body: { phoneNumber } },
    );
    return result;
  }

  async getPhoneNumberCampaignStatus(phoneNumber) {
    this.sdk.validateParams(
      { phoneNumber },
      {
        phoneNumber: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/tollfree/phoneNumber/${encodeURIComponent(
        phoneNumber,
      )}/campaignStatus`,
      'GET',
    );
    return result;
  }
}
