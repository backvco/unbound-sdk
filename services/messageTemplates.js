import { internalRequest } from '../base.js';

/**
 * Account-level stored message template groups. Distinct from SMS
 * `/messaging/templates/` (messagesSmsMmsTemplates) and email campaign
 * templates. Widget enablement is `sdk.webchat.widgets.update(widgetId,
 * { slashConfig })` — two-arg; no extra widget method here.
 */
export class MessageTemplateGroupsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * List stored message template groups (ACL-filtered).
   * @returns {Promise<{results: Object[]}>}
   */
  async list() {
    return internalRequest(this.sdk, '/messageTemplates/groups', 'GET');
  }

  /**
   * Get a stored message template group by id.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async get(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/messageTemplates/groups/${id}`, 'GET');
  }

  /**
   * Create a stored message template group.
   * @param {Object} options
   * @param {string} options.name
   * @param {'active'|'archived'} [options.status]
   * @param {number} [options.sortOrder]
   * @param {string|null} [options.recordTypeId]
   * @returns {Promise<Object>}
   */
  async create(options) {
    this.sdk.validateParams(
      { name: options?.name },
      { name: { type: 'string', required: true } },
    );

    return internalRequest(this.sdk, '/messageTemplates/groups', 'POST', {
      body: { ...options },
    });
  }

  /**
   * Update a stored message template group. Changing recordTypeId
   * cascades to child templates on the API.
   * @param {string} id
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async update(id, options) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });

    return internalRequest(this.sdk, `/messageTemplates/groups/${id}`, 'PUT', {
      body: { ...options },
    });
  }

  /**
   * Soft-delete a group and cascade-soft-delete its templates.
   * @param {string} id
   * @returns {Promise<{id: string, deleted: boolean}>}
   */
  async delete(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(
      this.sdk,
      `/messageTemplates/groups/${id}`,
      'DELETE',
    );
  }
}

/**
 * Stored message templates (composer slash replies). Bodies are included
 * on CRUD; the slash catalog omits them — use expand() to interpolate.
 */
export class MessageTemplatesCrudService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * List stored message templates (ACL-filtered).
   * @param {Object} [options]
   * @param {string} [options.groupId]
   * @returns {Promise<{results: Object[]}>}
   */
  async list(options = {}) {
    const { groupId } = options;
    return internalRequest(this.sdk, '/messageTemplates/templates', 'GET', {
      query: { groupId },
    });
  }

  /**
   * Get a stored message template by id (includes body).
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async get(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(
      this.sdk,
      `/messageTemplates/templates/${id}`,
      'GET',
    );
  }

  /**
   * Create a stored message template. slug must be unique among
   * non-deleted templates account-wide.
   * @param {Object} options
   * @param {string} options.groupId
   * @param {string} options.name
   * @param {string} options.slug
   * @param {string} options.body
   * @param {'draft'|'active'} [options.status]
   * @param {number} [options.sortOrder]
   * @returns {Promise<Object>}
   */
  async create(options) {
    this.sdk.validateParams(
      {
        groupId: options?.groupId,
        name: options?.name,
        slug: options?.slug,
        body: options?.body,
      },
      {
        groupId: { type: 'string', required: true },
        name: { type: 'string', required: true },
        slug: { type: 'string', required: true },
        body: { type: 'string', required: true },
      },
    );

    return internalRequest(this.sdk, '/messageTemplates/templates', 'POST', {
      body: { ...options },
    });
  }

  /**
   * Update a stored message template.
   * @param {string} id
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async update(id, options) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });

    return internalRequest(
      this.sdk,
      `/messageTemplates/templates/${id}`,
      'PUT',
      { body: { ...options } },
    );
  }

  /**
   * Soft-delete a stored message template.
   * @param {string} id
   * @returns {Promise<{id: string, deleted: boolean}>}
   */
  async delete(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(
      this.sdk,
      `/messageTemplates/templates/${id}`,
      'DELETE',
    );
  }
}

export class MessageTemplatesService {
  constructor(sdk) {
    this.sdk = sdk;
    this.groups = new MessageTemplateGroupsService(sdk);
    this.templates = new MessageTemplatesCrudService(sdk);
  }

  /**
   * Agent slash palette for a surface. Catalog rows omit body.
   * Webchat requires engagementSessionId and widget match.
   * @param {Object} options
   * @param {'webchat'|'sms'|'email'|'whatsapp'} options.channel
   * @param {string} options.configId
   * @param {string} options.engagementSessionId
   * @returns {Promise<{commands: Object[], templates: Object[]}>}
   */
  async slashCatalog({ channel, configId, engagementSessionId }) {
    this.sdk.validateParams(
      { channel, configId, engagementSessionId },
      {
        channel: { type: 'string', required: true },
        configId: { type: 'string', required: true },
        engagementSessionId: { type: 'string', required: true },
      },
    );

    return internalRequest(this.sdk, '/messageTemplates/slash-catalog', 'POST', {
      body: { channel, configId, engagementSessionId },
    });
  }

  /**
   * Interpolate a catalog-visible template for a surface/session.
   * @param {Object} options
   * @param {'webchat'|'sms'|'email'|'whatsapp'} options.channel
   * @param {string} options.configId
   * @param {string} options.templateId
   * @param {string} options.engagementSessionId
   * @returns {Promise<{body: string}>}
   */
  async expand({ channel, configId, templateId, engagementSessionId }) {
    this.sdk.validateParams(
      { channel, configId, templateId, engagementSessionId },
      {
        channel: { type: 'string', required: true },
        configId: { type: 'string', required: true },
        templateId: { type: 'string', required: true },
        engagementSessionId: { type: 'string', required: true },
      },
    );

    return internalRequest(
      this.sdk,
      `/messageTemplates/templates/${templateId}/expand`,
      'POST',
      { body: { channel, configId, engagementSessionId } },
    );
  }
}
