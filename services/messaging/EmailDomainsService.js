import { internalRequest } from '../../base.js';
export class EmailDomainsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Create domain verification
   * @param {Object} params - Domain parameters
   * @param {string} params.domain - Domain name (required)
   * @param {string} [params.primaryRegion] - Primary AWS region
   * @param {string} [params.secondaryRegion] - Secondary AWS region
   * @param {string} [params.mailFromSubdomain='mail'] - Mail-from subdomain
   * @returns {Promise<Object>} Created domain with DNS records to configure
   */
  async create({ domain, primaryRegion, secondaryRegion, mailFromSubdomain }) {
    this.sdk.validateParams(
      { domain },
      {
        domain: { type: 'string', required: true },
        primaryRegion: { type: 'string', required: false },
        secondaryRegion: { type: 'string', required: false },
        mailFromSubdomain: { type: 'string', required: false },
      },
    );

    const domainData = { domain };
    if (primaryRegion) domainData.primaryRegion = primaryRegion;
    if (secondaryRegion) domainData.secondaryRegion = secondaryRegion;
    if (mailFromSubdomain) domainData.mailFromSubdomain = mailFromSubdomain;

    const options = {
      body: domainData,
    };

    const result = await internalRequest(this.sdk, 
      '/messaging/email/validate/domain',
      'POST',
      options,
    );
    return result;
  }

  /**
   * Delete domain verification
   * @param {string} domainId - Domain ID (required)
   * @returns {Promise<Object>} Deletion confirmation
   */
  async delete(domainId) {
    this.sdk.validateParams(
      { domainId },
      {
        domainId: { type: 'string', required: true },
      },
    );

    const options = {
      body: { domainId },
    };

    const result = await internalRequest(this.sdk, 
      '/messaging/email/validate/domain',
      'DELETE',
      options,
    );
    return result;
  }

  /**
   * List all verified domains
   * @returns {Promise<Array>} List of verified domains with status, regions, and portal information
   * @example
   * // Returns array of domain objects:
   * // {
   * //   id: 'domain-id',
   * //   domain: 'mydomain.com',
   * //   primaryRegion: 'us-east-1',
   * //   secondaryRegion: 'us-west-2',
   * //   primaryRegionStatus: 'active',
   * //   secondaryRegionStatus: 'active',
   * //   portalId: 'portal-id',
   * //   portalName: 'My Portal',
   * //   recordTypeId: 'record-type-id',
   * //   isDeleted: false,
   * //   createdAt: '2023-...'
   * // }
   */
  async list() {
    const result = await internalRequest(this.sdk, 
      '/messaging/email/validate/domain',
      'GET',
    );
    return result;
  }

  /**
   * Get domain details by ID including DNS configuration
   * @param {string} domainId - Domain ID (required)
   * @returns {Promise<Object>} Domain details with DNS records to configure
   * @example
   * // Returns domain object with DNS records:
   * // {
   * //   id: 'domain-id',
   * //   domain: 'mydomain.com',
   * //   primaryRegion: 'us-east-1',
   * //   secondaryRegion: 'us-west-2',
   * //   primaryRegionStatus: 'active',
   * //   secondaryRegionStatus: 'active',
   * //   mailFrom: 'mail.mydomain.com',
   * //   portalId: 'portal-id',
   * //   portalName: 'My Portal',
   * //   brandId: 'brand-id',
   * //   recordTypeId: 'record-type-id',
   * //   createdAt: '2023-...',
   * //   dns: [
   * //     {
   * //       type: 'CNAME',
   * //       name: 'domainid._domainkey.mydomain.com',
   * //       value: 'domainid.dkim.example.com',
   * //       description: 'DKIM signature verification'
   * //     },
   * //     {
   * //       type: 'CNAME',
   * //       name: 'mail.mydomain.com',
   * //       value: 'mail.ses.amazonaws.com',
   * //       description: 'MAIL FROM domain routing'
   * //     },
   * //     {
   * //       type: 'TXT',
   * //       name: 'mydomain.com',
   * //       value: '"v=spf1 include:mail.mydomain.com ~all"',
   * //       description: 'SPF record for email authentication'
   * //     },
   * //     {
   * //       type: 'TXT',
   * //       name: '_dmarc.mydomain.com',
   * //       value: '"v=DMARC1; p=quarantine; rua=mailto:dmarc@...',
   * //       description: 'DMARC policy for email authentication and reporting'
   * //     }
   * //   ]
   * // }
   */
  async get(domainId) {
    this.sdk.validateParams(
      { domainId },
      {
        domainId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/email/validate/domain/${domainId}`,
      'GET',
    );
    return result;
  }

  /**
   * Validate DNS records for domain
   * @param {string} domain - Domain name (required)
   * @returns {Promise<Object>} DNS validation results
   */
  async validateDns(domain) {
    this.sdk.validateParams(
      { domain },
      {
        domain: { type: 'string', required: true },
      },
    );

    const options = {
      query: { domain },
    };

    const result = await internalRequest(this.sdk, 
      '/messaging/email/validate/domain/dns',
      'GET',
      options,
    );
    return result;
  }

  /**
   * Check domain verification status
   * @param {string} domain - Domain name (required)
   * @returns {Promise<Object>} Domain verification status
   */
  async checkStatus(domain) {
    this.sdk.validateParams(
      { domain },
      {
        domain: { type: 'string', required: true },
      },
    );

    const options = {
      query: { domain },
    };

    const result = await internalRequest(this.sdk, 
      '/messaging/email/validate/domain/status',
      'GET',
      options,
    );
    return result;
  }

  /**
   * Update domain settings
   * @param {Object} params - Update parameters
   * @param {string} params.domainId - Domain ID (required)
   * @param {string} [params.primaryRegion] - Primary AWS region
   * @param {string} [params.secondaryRegion] - Secondary AWS region
   * @param {boolean} [params.dkimEnabled] - Enable DKIM signing
   * @param {Object} [params.customDkim] - Custom DKIM configuration
   * @returns {Promise<Object>} Updated domain details
   */
  async update({
    domainId,
    primaryRegion,
    secondaryRegion,
    dkimEnabled,
    customDkim,
  }) {
    this.sdk.validateParams(
      { domainId },
      {
        domainId: { type: 'string', required: true },
        primaryRegion: { type: 'string', required: false },
        secondaryRegion: { type: 'string', required: false },
        dkimEnabled: { type: 'boolean', required: false },
        customDkim: { type: 'object', required: false },
      },
    );

    const updateData = { domainId };
    if (primaryRegion) updateData.primaryRegion = primaryRegion;
    if (secondaryRegion) updateData.secondaryRegion = secondaryRegion;
    if (dkimEnabled !== undefined) updateData.dkimEnabled = dkimEnabled;
    if (customDkim) updateData.customDkim = customDkim;

    const options = {
      body: updateData,
    };

    const result = await internalRequest(this.sdk, 
      '/messaging/email/validate/domain',
      'PUT',
      options,
    );
    return result;
  }
}
