import { internalRequest } from '../../base.js';

/**
 * Mail-app email signatures. Exposed as `sdk.messaging.email.signatures`.
 */
export class EmailSignaturesService {
  constructor(sdk) {
    this.sdk = sdk;
    this.me = new EmailSignatureMeService(sdk);
    this.templates = new EmailSignatureTemplatesService(sdk);
    this.groups = new EmailSignatureGroupsService(sdk);
  }

  /**
   * Merge fields the signature editor can insert.
   * @returns {Promise<Object>} { fields }
   * @example
   * const { fields } = await sdk.messaging.email.signatures.fields();
   */
  async fields() {
    return internalRequest(this.sdk, '/messaging/email/signatures/fields', 'GET');
  }

  /**
   * Render a signature for a user.
   * @param {Object} params
   * @param {string} params.html - Signature HTML, including merge tags
   * @param {string} [params.userId] - User to render. Defaults to the caller.
   * @returns {Promise<Object>} { html }
   * @example
   * const { html } = await sdk.messaging.email.signatures.preview({
   *   html: 'Hello {{firstName}}',
   * });
   */
  async preview({ html, userId } = {}) {
    this.sdk.validateParams(
      { html, userId },
      {
        html: { type: 'string', required: true },
        userId: { type: 'string', required: false },
      },
    );
    const body = { html };
    if (userId !== undefined) body.userId = userId;
    return internalRequest(this.sdk, '/messaging/email/signatures/preview', 'POST', {
      body,
    });
  }
}

class EmailSignatureMeService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * The caller's effective signature, including shared and forced options.
   * @returns {Promise<Object>}
   * @example
   * const me = await sdk.messaging.email.signatures.me.get();
   */
  async get() {
    return internalRequest(this.sdk, '/messaging/email/signatures/me', 'GET');
  }

  /**
   * Save the caller's signature choice. Personal html is ignored unless the
   * active option is their own signature.
   * @param {Object} body
   * @param {string} [body.activeId] - `personal` or a shared template id
   * @param {string} [body.html] - Personal signature HTML
   * @param {boolean} [body.addOnNew]
   * @param {boolean} [body.addOnReply]
   * @returns {Promise<Object>}
   * @example
   * await sdk.messaging.email.signatures.me.update({
   *   activeId: 'personal',
   *   html: '<p>{{fullName__g}}</p>',
   *   addOnNew: true,
   *   addOnReply: true,
   * });
   */
  async update(body = {}) {
    return internalRequest(this.sdk, '/messaging/email/signatures/me', 'PUT', {
      body,
    });
  }

  /**
   * Copy a shared signature onto the caller so they can edit it.
   * @param {string} templateId
   * @returns {Promise<Object>}
   * @example
   * await sdk.messaging.email.signatures.me.copy('351...');
   */
  async copy(templateId) {
    this.sdk.validateParams(
      { templateId },
      { templateId: { type: 'string', required: true } },
    );
    return internalRequest(this.sdk, '/messaging/email/signatures/me/copy', 'POST', {
      body: { templateId },
    });
  }
}

class EmailSignatureTemplatesService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * List account signature templates and their assignments.
   * @returns {Promise<Object>} { templates }
   * @example
   * const { templates } = await sdk.messaging.email.signatures.templates.list();
   */
  async list() {
    return internalRequest(
      this.sdk,
      '/messaging/email/signatures/templates',
      'GET',
    );
  }

  /**
   * Create an account signature template.
   * @param {Object} body
   * @param {string} body.name
   * @param {string} [body.html]
   * @param {number} [body.priority]
   * @returns {Promise<Object>}
   * @example
   * await sdk.messaging.email.signatures.templates.create({
   *   name: 'Standard',
   *   html: '<p>{{fullName__g}}</p>',
   *   priority: 0,
   * });
   */
  async create(body = {}) {
    this.sdk.validateParams(
      { name: body.name },
      { name: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      '/messaging/email/signatures/templates',
      'POST',
      { body },
    );
  }

  /**
   * Update an account signature template.
   * @param {string} id
   * @param {Object} body
   * @returns {Promise<Object>}
   * @example
   * await sdk.messaging.email.signatures.templates.update('351...', {
   *   name: 'Standard',
   *   html: '<p>{{fullName__g}}</p>',
   * });
   */
  async update(id, body = {}) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(
      this.sdk,
      `/messaging/email/signatures/templates/${id}`,
      'PUT',
      { body },
    );
  }

  /**
   * Delete an account signature template.
   * @param {string} id
   * @returns {Promise<Object>}
   * @example
   * await sdk.messaging.email.signatures.templates.delete('351...');
   */
  async delete(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(
      this.sdk,
      `/messaging/email/signatures/templates/${id}`,
      'DELETE',
    );
  }

  /**
   * Assign a template to a user or group as shared or forced.
   * @param {string} id - Template id
   * @param {Object} body
   * @param {string} body.principalType - `user` or `group`
   * @param {string} body.principalId
   * @param {string} body.mode - `shared` or `forced`
   * @returns {Promise<Object>}
   * @example
   * await sdk.messaging.email.signatures.templates.assign('351...', {
   *   principalType: 'user',
   *   principalId: '002...',
   *   mode: 'shared',
   * });
   */
  async assign(id, body = {}) {
    this.sdk.validateParams(
      { id, ...body },
      {
        id: { type: 'string', required: true },
        principalType: { type: 'string', required: true },
        principalId: { type: 'string', required: true },
        mode: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/messaging/email/signatures/templates/${id}/assignments`,
      'POST',
      { body },
    );
  }

  /**
   * Remove one assignment from a template.
   * @param {string} templateId
   * @param {string} assignmentId
   * @returns {Promise<Object>}
   * @example
   * await sdk.messaging.email.signatures.templates.unassign('351...', '352...');
   */
  async unassign(templateId, assignmentId) {
    this.sdk.validateParams(
      { templateId, assignmentId },
      {
        templateId: { type: 'string', required: true },
        assignmentId: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/messaging/email/signatures/templates/${templateId}/assignments/${assignmentId}`,
      'DELETE',
    );
  }
}

class EmailSignatureGroupsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Search groups for signature assignment. Returns at most 20 name matches,
   * or the named ids. An empty query returns no rows.
   * @param {Object} [params]
   * @param {string} [params.q]
   * @param {string[]} [params.ids]
   * @returns {Promise<Object>} { results }
   * @example
   * const { results } = await sdk.messaging.email.signatures.groups.search({
   *   q: 'support',
   * });
   */
  async search({ q, ids } = {}) {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (ids?.length) params.set('ids', ids.join(','));
    const query = params.toString();
    return internalRequest(
      this.sdk,
      `/messaging/email/signatures/groups${query ? `?${query}` : ''}`,
      'GET',
    );
  }
}
