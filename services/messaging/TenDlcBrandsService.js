import { internalRequest } from '../../base.js';
export class TenDlcBrandsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * List all 10DLC brands with optional filtering
   * @param {Object} [params] - Filter parameters
   * @param {number} [params.page=1] - Page number
   * @param {number} [params.limit=50] - Items per page
   * @param {string} [params.name] - Filter by brand name
   * @param {string} [params.status] - Filter by status
   * @param {string} [params.operatorType='contains'] - Filter operator: contains, equals, startsWith, endsWith
   * @returns {Promise<Array>} List of brands
   */
  async list({ page, limit, name, status, operatorType } = {}) {
    const queryParams = new URLSearchParams();

    if (page !== undefined) queryParams.append('page', page);
    if (limit !== undefined) queryParams.append('limit', limit);
    if (name) queryParams.append('name', name);
    if (status) queryParams.append('status', status);
    if (operatorType) queryParams.append('operatorType', operatorType);

    const url = queryParams.toString()
      ? `/messaging/campaigns/10dlc/brand?${queryParams.toString()}`
      : '/messaging/campaigns/10dlc/brand';

    const result = await internalRequest(this.sdk, url, 'GET');
    return result;
  }

  /**
   * Create a new 10DLC brand
   * @param {Object} params - Brand parameters
   * @param {string} params.name - Brand display name (required)
   * @param {string} params.entityType - Entity type: PRIVATE_PROFIT, PUBLIC_PROFIT, NON_PROFIT (required)
   * @param {string} [params.cspId] - CSP ID for resellers
   * @param {string} params.companyName - Company name (required)
   * @param {string} [params.ein] - Employer Identification Number
   * @param {string} params.address1 - Street address (required)
   * @param {string} [params.address2] - Street address line 2
   * @param {string} params.city - City (required)
   * @param {string} params.state - State (required)
   * @param {string} params.postalCode - Postal code (required)
   * @param {string} params.country - Country (required)
   * @param {string} [params.pocFirstName] - Point of contact first name
   * @param {string} [params.pocLastName] - Point of contact last name
   * @param {string} params.pocEmail - Point of contact email (required)
   * @param {string} params.pocPhone - Point of contact phone (required)
   * @param {string} [params.stockSymbol] - Stock symbol for public companies
   * @param {string} [params.stockExchange] - Stock exchange for public companies
   * @param {string} [params.website] - Company website
   * @param {string} params.vertical - Business vertical (required)
   * @param {string} [params.altBusinessId] - Alternative business ID
   * @param {string} [params.altBusinessIdType] - Alternative business ID type
   * @param {string} [params.brandRelationship] - Brand relationship
   * @returns {Promise<Object>} Created brand details
   */
  async create({
    name,
    entityType,
    cspId,
    companyName,
    ein,
    address1,
    address2,
    city,
    state,
    postalCode,
    country,
    pocFirstName,
    pocLastName,
    pocEmail,
    pocPhone,
    stockSymbol,
    stockExchange,
    website,
    vertical,
    altBusinessId,
    altBusinessIdType,
    brandRelationship,
  }) {
    this.sdk.validateParams(
      {
        name,
        entityType,
        companyName,
        address1,
        city,
        state,
        postalCode,
        country,
        pocEmail,
        pocPhone,
        vertical,
      },
      {
        name: { type: 'string', required: true },
        entityType: { type: 'string', required: true },
        cspId: { type: 'string', required: false },
        companyName: { type: 'string', required: true },
        ein: { type: 'string', required: false },
        address1: { type: 'string', required: true },
        address2: { type: 'string', required: false },
        city: { type: 'string', required: true },
        state: { type: 'string', required: true },
        postalCode: { type: 'string', required: true },
        country: { type: 'string', required: true },
        pocFirstName: { type: 'string', required: false },
        pocLastName: { type: 'string', required: false },
        pocEmail: { type: 'string', required: true },
        pocPhone: { type: 'string', required: true },
        stockSymbol: { type: 'string', required: false },
        stockExchange: { type: 'string', required: false },
        website: { type: 'string', required: false },
        vertical: { type: 'string', required: true },
        altBusinessId: { type: 'string', required: false },
        altBusinessIdType: { type: 'string', required: false },
        brandRelationship: { type: 'string', required: false },
      },
    );

    const brandData = {
      name,
      entityType,
      companyName,
      address1,
      city,
      state,
      postalCode,
      country,
      pocEmail,
      pocPhone,
      vertical,
    };
    if (cspId) brandData.cspId = cspId;
    if (ein) brandData.ein = ein;
    if (address2) brandData.address2 = address2;
    if (pocFirstName) brandData.pocFirstName = pocFirstName;
    if (pocLastName) brandData.pocLastName = pocLastName;
    if (stockSymbol) brandData.stockSymbol = stockSymbol;
    if (stockExchange) brandData.stockExchange = stockExchange;
    if (website) brandData.website = website;
    if (altBusinessId) brandData.altBusinessId = altBusinessId;
    if (altBusinessIdType) brandData.altBusinessIdType = altBusinessIdType;
    if (brandRelationship) brandData.brandRelationship = brandRelationship;

    const options = {
      body: brandData,
    };

    const result = await internalRequest(this.sdk, 
      '/messaging/campaigns/10dlc/brand',
      'POST',
      options,
    );
    return result;
  }

  /**
   * Get a 10DLC brand by ID
   * @param {string} brandId - Brand ID (required)
   * @returns {Promise<Object>} Brand details
   */
  async get(brandId) {
    this.sdk.validateParams(
      { brandId },
      {
        brandId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/10dlc/brand/${brandId}`,
      'GET',
    );
    return result;
  }

  /**
   * Update a 10DLC brand
   * @param {string} brandId - Brand ID to update (required)
   * @param {Object} params - Brand parameters to update
   * @param {string} [params.name] - Brand display name
   * @param {string} [params.entityType] - Entity type: PRIVATE_PROFIT, PUBLIC_PROFIT, NON_PROFIT
   * @param {string} [params.cspId] - CSP ID for resellers
   * @param {string} [params.companyName] - Company name
   * @param {string} [params.ein] - Employer Identification Number
   * @param {string} [params.address1] - Street address
   * @param {string} [params.address2] - Street address line 2
   * @param {string} [params.city] - City
   * @param {string} [params.state] - State
   * @param {string} [params.postalCode] - Postal code
   * @param {string} [params.country] - Country
   * @param {string} [params.pocFirstName] - Point of contact first name
   * @param {string} [params.pocLastName] - Point of contact last name
   * @param {string} [params.pocEmail] - Point of contact email
   * @param {string} [params.pocPhone] - Point of contact phone
   * @param {string} [params.stockSymbol] - Stock symbol for public companies
   * @param {string} [params.stockExchange] - Stock exchange for public companies
   * @param {string} [params.website] - Company website
   * @param {string} [params.vertical] - Business vertical
   * @param {string} [params.altBusinessId] - Alternative business ID
   * @param {string} [params.altBusinessIdType] - Alternative business ID type
   * @param {string} [params.brandRelationship] - Brand relationship
   * @param {string} [params.businessContactEmail] - Business contact email for 2025 compliance
   * @param {string} [params.firstName] - First name for 2025 compliance
   * @param {string} [params.lastName] - Last name for 2025 compliance
   * @param {string} [params.mobilePhone] - Mobile phone for 2025 compliance
   * @returns {Promise<Object>} Updated brand details
   */
  async update(
    brandId,
    {
      name,
      entityType,
      cspId,
      companyName,
      ein,
      address1,
      address2,
      city,
      state,
      postalCode,
      country,
      pocFirstName,
      pocLastName,
      pocEmail,
      pocPhone,
      stockSymbol,
      stockExchange,
      website,
      vertical,
      altBusinessId,
      altBusinessIdType,
      brandRelationship,
      businessContactEmail,
      firstName,
      lastName,
      mobilePhone,
    } = {},
  ) {
    this.sdk.validateParams(
      { brandId },
      {
        brandId: { type: 'string', required: true },
        name: { type: 'string', required: false },
        entityType: { type: 'string', required: false },
        cspId: { type: 'string', required: false },
        companyName: { type: 'string', required: false },
        ein: { type: 'string', required: false },
        address1: { type: 'string', required: false },
        address2: { type: 'string', required: false },
        city: { type: 'string', required: false },
        state: { type: 'string', required: false },
        postalCode: { type: 'string', required: false },
        country: { type: 'string', required: false },
        pocFirstName: { type: 'string', required: false },
        pocLastName: { type: 'string', required: false },
        pocEmail: { type: 'string', required: false },
        pocPhone: { type: 'string', required: false },
        stockSymbol: { type: 'string', required: false },
        stockExchange: { type: 'string', required: false },
        website: { type: 'string', required: false },
        vertical: { type: 'string', required: false },
        altBusinessId: { type: 'string', required: false },
        altBusinessIdType: { type: 'string', required: false },
        brandRelationship: { type: 'string', required: false },
        businessContactEmail: { type: 'string', required: false },
        firstName: { type: 'string', required: false },
        lastName: { type: 'string', required: false },
        mobilePhone: { type: 'string', required: false },
      },
    );

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (entityType !== undefined) updateData.entityType = entityType;
    if (cspId !== undefined) updateData.cspId = cspId;
    if (companyName !== undefined) updateData.companyName = companyName;
    if (ein !== undefined) updateData.ein = ein;
    if (address1 !== undefined) updateData.address1 = address1;
    if (address2 !== undefined) updateData.address2 = address2;
    if (city !== undefined) updateData.city = city;
    if (state !== undefined) updateData.state = state;
    if (postalCode !== undefined) updateData.postalCode = postalCode;
    if (country !== undefined) updateData.country = country;
    if (pocFirstName !== undefined) updateData.pocFirstName = pocFirstName;
    if (pocLastName !== undefined) updateData.pocLastName = pocLastName;
    if (pocEmail !== undefined) updateData.pocEmail = pocEmail;
    if (pocPhone !== undefined) updateData.pocPhone = pocPhone;
    if (stockSymbol !== undefined) updateData.stockSymbol = stockSymbol;
    if (stockExchange !== undefined) updateData.stockExchange = stockExchange;
    if (website !== undefined) updateData.website = website;
    if (vertical !== undefined) updateData.vertical = vertical;
    if (altBusinessId !== undefined) updateData.altBusinessId = altBusinessId;
    if (altBusinessIdType !== undefined)
      updateData.altBusinessIdType = altBusinessIdType;
    if (brandRelationship !== undefined)
      updateData.brandRelationship = brandRelationship;
    if (businessContactEmail !== undefined)
      updateData.businessContactEmail = businessContactEmail;
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (mobilePhone !== undefined) updateData.mobilePhone = mobilePhone;

    const options = {
      body: updateData,
    };

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/10dlc/brand/${brandId}`,
      'PUT',
      options,
    );
    return result;
  }

  /**
   * Delete a 10DLC brand
   * @param {string} brandId - Brand ID to delete (required)
   * @returns {Promise<Object>} Deletion confirmation
   */
  async delete(brandId) {
    this.sdk.validateParams(
      { brandId },
      {
        brandId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/10dlc/brand/${brandId}`,
      'DELETE',
    );
    return result;
  }

  /**
   * Revet (re-vet) a 10DLC brand - resubmit brand for carrier approval
   * @param {string} brandId - Brand ID to revet (required)
   * @returns {Promise<Object>} Revet confirmation and updated brand status
   */
  async revet(brandId) {
    this.sdk.validateParams(
      { brandId },
      {
        brandId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/10dlc/brand/${brandId}/revet`,
      'PUT',
    );
    return result;
  }

  /**
   * Get brand feedback from carriers
   * @param {string} brandId - Brand ID to get feedback for (required)
   * @returns {Promise<Object>} Brand feedback details from carriers
   */
  async getFeedback(brandId) {
    this.sdk.validateParams(
      { brandId },
      {
        brandId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/10dlc/brand/${brandId}/feedback`,
      'GET',
    );
    return result;
  }

  /**
   * Create external brand vetting for higher throughput approval
   * @param {string} brandId - Brand ID to create external vetting for (required)
   * @param {Object} [vettingData] - External vetting data
   * @returns {Promise<Object>} External vetting creation confirmation
   */
  async createExternalVetting(brandId, vettingData) {
    this.sdk.validateParams(
      { brandId },
      {
        brandId: { type: 'string', required: true },
        vettingData: { type: 'object', required: false },
      },
    );

    const options = {
      body: vettingData || {},
    };

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/10dlc/brand/${brandId}/externalVetting`,
      'POST',
      options,
    );
    return result;
  }

  /**
   * Get brand external vetting responses
   * @param {string} brandId - Brand ID to get vetting responses for (required)
   * @returns {Promise<Object>} External vetting responses
   */
  async getExternalVettingResponses(brandId) {
    this.sdk.validateParams(
      { brandId },
      {
        brandId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/10dlc/brand/${brandId}/externalvetting/responses`,
      'GET',
    );
    return result;
  }

  /**
   * Resend two-factor authentication email for PUBLIC_PROFIT brands
   * @param {string} brandId - Brand ID to resend 2FA for
   * @returns {Promise<Object>} Success message and details
   */
  async resend2fa(brandId) {
    this.sdk.validateParams(
      { brandId },
      {
        brandId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/campaigns/10dlc/brand/${brandId}/resend-2fa`,
      'POST',
    );
    return result;
  }
}
