import { internalRequest } from '../../base.js';
export class EmailTemplatesService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Create email template
   * @param {Object} params - Template parameters
   * @param {string} params.name - Template name (required)
   * @param {string} params.subject - Template subject (required)
   * @param {string} [params.html] - HTML template body
   * @param {string} [params.text] - Plain text template body
   * @param {Array<Object>} [params.variables] - Variable metadata definitions
   * @param {string} params.variables[].key - Variable key (unique, alphanumeric + underscores)
   * @param {string} params.variables[].label - Human-readable display name
   * @param {string} params.variables[].type - One of: text, textarea, url, image, richtext
   * @param {string} [params.variables[].defaultValue] - Default value
   * @param {boolean} [params.variables[].required] - Whether variable is required
   * @returns {Promise<Object>} Created template details with merged variables
   * @example
   * const template = await sdk.messaging.email.templates.create({
   *   name: 'Welcome Email',
   *   subject: 'Welcome {{firstName}}!',
   *   html: '<h1>Hello {{firstName}}</h1><p>{{body}}</p>',
   *   text: 'Hello {{firstName}}',
   *   variables: [
   *     { key: 'firstName', label: 'First Name', type: 'text', required: true },
   *     { key: 'body', label: 'Email Body', type: 'richtext' },
   *   ],
   * });
   */
  async create({ name, subject, html, text, variables }) {
    this.sdk.validateParams(
      { name, subject },
      {
        name: { type: 'string', required: true },
        subject: { type: 'string', required: true },
        html: { type: 'string', required: false },
        text: { type: 'string', required: false },
        variables: { type: 'array', required: false },
      },
    );

    const templateData = { name, subject };
    if (html) templateData.html = html;
    if (text) templateData.text = text;
    if (variables) templateData.variables = variables;

    const options = {
      body: templateData,
    };

    const result = await internalRequest(this.sdk, 
      '/messaging/email/template',
      'POST',
      options,
    );
    return result;
  }

  /**
   * Update email template
   * @param {string} id - Template ID (required)
   * @param {Object} params - Update parameters
   * @param {string} [params.name] - Template name
   * @param {string} [params.subject] - Template subject
   * @param {string} [params.html] - HTML template body
   * @param {string} [params.text] - Plain text template body
   * @param {Array<Object>} [params.variables] - Variable metadata definitions
   * @param {string} params.variables[].key - Variable key (unique, alphanumeric + underscores)
   * @param {string} params.variables[].label - Human-readable display name
   * @param {string} params.variables[].type - One of: text, textarea, url, image, richtext
   * @param {string} [params.variables[].defaultValue] - Default value
   * @param {boolean} [params.variables[].required] - Whether variable is required
   * @returns {Promise<Object>} Updated template details with merged variables
   * @example
   * const updated = await sdk.messaging.email.templates.update('tpl_123', {
   *   subject: 'Hi {{firstName}}, welcome to {{companyName}}!',
   *   variables: [
   *     { key: 'firstName', label: 'First Name', type: 'text', required: true },
   *     { key: 'companyName', label: 'Company Name', type: 'text' },
   *   ],
   * });
   */
  async update(id, { name, subject, html, text, variables }) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
        name: { type: 'string', required: false },
        subject: { type: 'string', required: false },
        html: { type: 'string', required: false },
        text: { type: 'string', required: false },
        variables: { type: 'array', required: false },
      },
    );

    const updateData = {};
    if (name) updateData.name = name;
    if (subject) updateData.subject = subject;
    if (html) updateData.html = html;
    if (text) updateData.text = text;
    if (variables) updateData.variables = variables;

    const options = {
      body: updateData,
    };

    const result = await internalRequest(this.sdk, 
      `/messaging/email/template/${id}`,
      'PUT',
      options,
    );
    return result;
  }

  /**
   * Delete email template
   * @param {string} id - Template ID (required)
   * @returns {Promise<Object>} Deletion confirmation
   */
  async delete(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/email/template/${id}`,
      'DELETE',
    );
    return result;
  }

  /**
   * Get email template by ID
   * @param {string} id - Template ID (required)
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
      `/messaging/email/template/${id}`,
      'GET',
    );
    return result;
  }

  /**
   * List all email templates
   * @returns {Promise<Array>} List of email templates
   */
  async list() {
    const result = await internalRequest(this.sdk, '/messaging/email/template', 'GET');
    return result;
  }
}
