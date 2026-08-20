import { internalRequest } from '../../base.js';
export class SmsTemplatesService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Create SMS template
   * @param {Object} params - Template parameters
   * @param {string} params.name - Template name (required)
   * @param {string} params.message - Template message (required)
   * @param {Object} [params.variables] - Template variables
   * @returns {Promise<Object>} Created template details
   */
  async create({ name, message, variables }) {
    this.sdk.validateParams(
      { name, message },
      {
        name: { type: 'string', required: true },
        message: { type: 'string', required: true },
        variables: { type: 'object', required: false },
      },
    );

    const templateData = { name, message };
    if (variables) templateData.variables = variables;

    const options = {
      body: templateData,
    };

    const result = await internalRequest(this.sdk, 
      '/messaging/sms/templates',
      'POST',
      options,
    );
    return result;
  }

  /**
   * Update SMS template
   * @param {string} id - Template ID
   * @param {Object} params - Update parameters
   * @param {string} [params.name] - Template name
   * @param {string} [params.message] - Template message
   * @param {Object} [params.variables] - Template variables
   * @returns {Promise<Object>} Updated template details
   */
  async update(id, { name, message, variables }) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
        name: { type: 'string', required: false },
        message: { type: 'string', required: false },
        variables: { type: 'object', required: false },
      },
    );

    const updateData = {};
    if (name) updateData.name = name;
    if (message) updateData.message = message;
    if (variables) updateData.variables = variables;

    const options = {
      body: updateData,
    };

    const result = await internalRequest(this.sdk, 
      `/messaging/sms/templates/${id}`,
      'PUT',
      options,
    );
    return result;
  }

  /**
   * Delete SMS template
   * @param {string} id - Template ID
   * @returns {Promise<Object>} Deletion result
   */
  async delete(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/sms/templates/${id}`,
      'DELETE',
    );
    return result;
  }

  /**
   * Get SMS template by ID
   * @param {string} id - Template ID
   * @returns {Promise<Object>} Template details
   */
  async get(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/sms/templates/${id}`,
      'GET',
    );
    return result;
  }

  /**
   * List all SMS templates
   * @returns {Promise<Array>} List of templates
   */
  async list() {
    const result = await internalRequest(this.sdk, '/messaging/sms/templates', 'GET');
    return result;
  }
}
