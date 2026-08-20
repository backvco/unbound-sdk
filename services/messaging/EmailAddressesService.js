import { internalRequest } from '../../base.js';
export class EmailAddressesService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Create email address verification
   * @param {string} emailAddress - Email address to verify (required)
   * @returns {Promise<Object>} Email verification details
   */
  async create(emailAddress) {
    this.sdk.validateParams(
      { emailAddress },
      {
        emailAddress: { type: 'string', required: true },
      },
    );

    const options = {
      body: { emailAddress },
    };

    const result = await internalRequest(this.sdk, 
      '/messaging/email/validate/emailAddress',
      'POST',
      options,
    );
    return result;
  }

  /**
   * Delete email address verification
   * @param {string} emailAddress - Email address to remove (required)
   * @returns {Promise<Object>} Deletion confirmation
   */
  async delete(emailAddress) {
    this.sdk.validateParams(
      { emailAddress },
      {
        emailAddress: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/email/validate/emailAddress/${encodeURIComponent(
        emailAddress,
      )}`,
      'DELETE',
    );
    return result;
  }

  /**
   * List all verified email addresses
   * @returns {Promise<Array>} List of verified email addresses
   */
  async list() {
    const result = await internalRequest(this.sdk, 
      '/messaging/email/validate/emailAddress',
      'GET',
    );
    return result;
  }

  /**
   * Check email address verification status
   * @param {string} emailAddress - Email address to check (required)
   * @returns {Promise<Object>} Email verification status
   */
  async checkStatus(emailAddress) {
    this.sdk.validateParams(
      { emailAddress },
      {
        emailAddress: { type: 'string', required: true },
      },
    );

    const options = {
      query: { emailAddress },
    };

    const result = await internalRequest(this.sdk, 
      '/messaging/email/validate/emailAddress/status',
      'GET',
      options,
    );
    return result;
  }
}
