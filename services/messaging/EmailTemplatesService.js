import { internalRequest } from '../../base.js';

function pickDefined(fields) {
  const body = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) body[key] = value;
  }
  return body;
}

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
   * @param {Object} [params.design] - Block-tree design JSON (compiled server-side)
   * @param {string} [params.appearance] - `client` or `marketing` (immutable after create)
   * @param {boolean} [params.allowOneOff] - Usable as a one-off / compose send
   * @param {boolean} [params.allowCampaign] - Usable in campaigns / journeys
   * @param {string} [params.brandKitId] - Brand kit to apply
   * @param {string} [params.category] - Template category
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
   *   appearance: 'marketing',
   *   allowOneOff: true,
   *   allowCampaign: true,
   *   design: { type: 'email', children: [] },
   *   html: '<h1>Hello {{firstName}}</h1><p>{{body}}</p>',
   *   text: 'Hello {{firstName}}',
   *   variables: [
   *     { key: 'firstName', label: 'First Name', type: 'text', required: true },
   *     { key: 'body', label: 'Email Body', type: 'richtext' },
   *   ],
   * });
   */
  async create({
    name,
    subject,
    html,
    text,
    variables,
    design,
    appearance,
    allowOneOff,
    allowCampaign,
    brandKitId,
    category,
  }) {
    this.sdk.validateParams(
      { name, subject },
      {
        name: { type: 'string', required: true },
        subject: { type: 'string', required: true },
        html: { type: 'string', required: false },
        text: { type: 'string', required: false },
        variables: { type: 'array', required: false },
        design: { type: 'object', required: false },
        appearance: { type: 'string', required: false },
        allowOneOff: { type: 'boolean', required: false },
        allowCampaign: { type: 'boolean', required: false },
        brandKitId: { type: 'string', required: false },
        category: { type: 'string', required: false },
      },
    );

    const options = {
      body: pickDefined({
        name,
        subject,
        html,
        text,
        variables,
        design,
        appearance,
        allowOneOff,
        allowCampaign,
        brandKitId,
        category,
      }),
    };

    const result = await internalRequest(this.sdk, 
      '/messaging/email/template',
      'POST',
      options,
    );
    return result;
  }

  /**
   * Update email template. Only defined fields are sent. Appearance is
   * immutable after create and should usually be omitted.
   * @param {string} id - Template ID (required)
   * @param {Object} params - Update parameters
   * @param {string} [params.name] - Template name
   * @param {string} [params.subject] - Template subject
   * @param {string} [params.html] - HTML template body
   * @param {string} [params.text] - Plain text template body
   * @param {Object} [params.design] - Block-tree design JSON (compiled server-side)
   * @param {string} [params.appearance] - Usually omit; immutable after create
   * @param {boolean} [params.allowOneOff] - Usable as a one-off / compose send
   * @param {boolean} [params.allowCampaign] - Usable in campaigns / journeys
   * @param {string} [params.brandKitId] - Brand kit to apply
   * @param {string} [params.category] - Template category
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
   *   allowOneOff: true,
   *   allowCampaign: false,
   *   design: { type: 'email', children: [] },
   *   variables: [
   *     { key: 'firstName', label: 'First Name', type: 'text', required: true },
   *     { key: 'companyName', label: 'Company Name', type: 'text' },
   *   ],
   * });
   */
  async update(
    id,
    {
      name,
      subject,
      html,
      text,
      variables,
      design,
      appearance,
      allowOneOff,
      allowCampaign,
      brandKitId,
      category,
    },
  ) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
        name: { type: 'string', required: false },
        subject: { type: 'string', required: false },
        html: { type: 'string', required: false },
        text: { type: 'string', required: false },
        variables: { type: 'array', required: false },
        design: { type: 'object', required: false },
        appearance: { type: 'string', required: false },
        allowOneOff: { type: 'boolean', required: false },
        allowCampaign: { type: 'boolean', required: false },
        brandKitId: { type: 'string', required: false },
        category: { type: 'string', required: false },
      },
    );

    const options = {
      body: pickDefined({
        name,
        subject,
        html,
        text,
        variables,
        design,
        appearance,
        allowOneOff,
        allowCampaign,
        brandKitId,
        category,
      }),
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
   * Restore a system account template (ticketAutoReply, ticketReply, …)
   * to the platform default design. User templates cannot be reset.
   * @param {string} id - Template ID (required)
   */
  async reset(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/messaging/email/template/${id}/reset`,
      'POST',
    );
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
   * List email templates, optionally filtered by appearance / usage flags.
   * @param {Object} [filters]
   * @param {string} [filters.appearance] - `client` or `marketing`
   * @param {boolean} [filters.allowOneOff]
   * @param {boolean} [filters.allowCampaign]
   * @param {string} [filters.scope] - `user` (default), `system`, or `all`
   * @returns {Promise<Array>} List of email templates
   */
  async list({ appearance, allowOneOff, allowCampaign, scope } = {}) {
    const query = pickDefined({
      appearance,
      allowOneOff,
      allowCampaign,
      scope,
    });
    const options = Object.keys(query).length ? { query } : {};
    const result = await internalRequest(
      this.sdk,
      '/messaging/email/template',
      'GET',
      options,
    );
    return result;
  }

  /**
   * Render a template (saved or draft fields) with sample variables for
   * preview, without sending or saving.
   * @param {string} id - Template ID (required)
   * @param {Object} [body] - Draft fields to render
   * @param {string} [body.subject] - Draft subject
   * @param {string} [body.html] - Draft HTML body
   * @param {string} [body.text] - Draft plain-text body
   * @param {Object} [body.variables] - Variable substitution values
   * @returns {Promise<Object>} Rendered preview. May include `unresolvedTags`
   *   (string[]) for merge tags that were not substituted.
   * @example
   * const preview = await sdk.messaging.email.templates.preview('tpl_123', {
   *   subject: 'Welcome {{firstName}}',
   *   html: '<p>Hello {{firstName}}</p>',
   *   variables: { firstName: 'Jane' },
   * });
   * // preview.unresolvedTags → [] or ['companyName', ...]
   */
  async preview(id, { subject, html, text, variables } = {}) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const previewData = {};
    if (subject !== undefined) previewData.subject = subject;
    if (html !== undefined) previewData.html = html;
    if (text !== undefined) previewData.text = text;
    if (variables !== undefined) previewData.variables = variables;

    const options = {
      body: previewData,
    };

    const result = await internalRequest(this.sdk, 
      `/messaging/email/template/${id}/preview`,
      'POST',
      options,
    );
    return result;
  }

  /**
   * Send a test email of a template to an address.
   * @param {string} id - Template ID (required)
   * @param {string} to - Destination email address (required)
   * @param {Object} [body] - Optional overrides (from, subject, html, text, variables)
   * @returns {Promise<Object>} Send confirmation
   * @example
   * await sdk.messaging.email.templates.sendTest('tpl_123', 'a@b.com');
   * await sdk.messaging.email.templates.sendTest('tpl_123', 'a@b.com', {
   *   from: 'noreply@example.com',
   *   subject: 'Test subject',
   * });
   */
  async sendTest(id, to, body = {}) {
    this.sdk.validateParams(
      { id, to },
      {
        id: { type: 'string', required: true },
        to: { type: 'string', required: true },
      },
    );

    const options = {
      body: { to, ...body },
    };

    const result = await internalRequest(this.sdk, 
      `/messaging/email/template/${id}/test`,
      'POST',
      options,
    );
    return result;
  }

  /**
   * Autosave a draft design tree without compiling or snapshotting a version.
   * @param {string} id - Template ID (required)
   * @param {Object} body
   * @param {Object} body.design - Block-tree design JSON (required)
   * @returns {Promise<Object>} `{ id, draftDesignStorageId }`
   */
  async autosave(id, { design } = {}) {
    this.sdk.validateParams(
      { id, design },
      {
        id: { type: 'string', required: true },
        design: { type: 'object', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/email/template/${id}/autosave`,
      'POST',
      { body: { design } },
    );
    return result;
  }

  /**
   * List saved versions of a template.
   * @param {string} id - Template ID (required)
   * @returns {Promise<Array>} Version rows
   */
  async listVersions(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/email/template/${id}/versions`,
      'GET',
    );
    return result;
  }

  /**
   * Restore a previously saved version as the current template.
   * @param {string} id - Template ID (required)
   * @param {number|string} version - Version number (required)
   * @returns {Promise<Object>} Restored template
   */
  async restoreVersion(id, version) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );
    if (version === undefined || version === null || version === '') {
      throw new Error('Missing required parameter version');
    }

    const result = await internalRequest(this.sdk, 
      `/messaging/email/template/${id}/versions/${version}/restore`,
      'POST',
    );
    return result;
  }
}
