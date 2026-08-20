import { internalRequest } from '../base.js';
/**
 * Triggers Service — object-change automations (workflow or outbound webhook).
 *
 * Watch create/update/delete on a trigger-enabled object, filter on the
 * current row and/or the field that changed, then run a workflow session
 * or POST to a URL.
 *
 * @example
 * const { results } = await sdk.triggers.list({ objectName: 'people' });
 *
 * @example
 * await sdk.triggers.create({
 *   name: 'Hot lead',
 *   objectName: 'people',
 *   actions: ['update'],
 *   recordFilter: { type: { op: 'eq', value: 'lead' } },
 *   changeFilters: [{
 *     field: 'leadScore',
 *     previous: { op: 'lt', value: 20 },
 *     updated: { op: 'gt', value: 100 },
 *   }],
 *   actionType: 'workflow',
 *   actionConfig: { workflowVersionId: '052…' },
 * });
 */
export class TriggersService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * List objects that may have triggers (`objectMetaData.triggersEnabled`).
   *
   * @returns {Promise<{results: Array<{id: string, name: string}>}>}
   *
   * @example
   * const { results } = await sdk.triggers.listObjects();
   */
  async listObjects() {
    return internalRequest(this.sdk, '/triggers/objects', 'GET', {});
  }

  /**
   * List triggers for the account.
   *
   * @param {object} [args]
   * @param {string} [args.objectName] - Filter to one object (e.g. `'people'`)
   * @param {('enabled'|'paused'|'disabled')} [args.status]
   * @param {number} [args.limit=200]
   * @returns {Promise<{results: object[]}>}
   *
   * @example
   * await sdk.triggers.list({ objectName: 'people', status: 'enabled' });
   */
  async list({ objectName, status, limit } = {}) {
    const query = {};
    if (objectName) query.objectName = objectName;
    if (status) query.status = status;
    if (limit) query.limit = limit;
    return internalRequest(this.sdk, '/triggers/', 'GET', { query });
  }

  /**
   * Get a trigger by id.
   *
   * @param {string} id
   * @returns {Promise<object>}
   *
   * @example
   * const trigger = await sdk.triggers.get('173…');
   */
  async get(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/triggers/${id}`, 'GET', {});
  }

  /**
   * Create a trigger.
   *
   * @param {object} args
   * @param {string} args.name
   * @param {string} [args.description]
   * @param {string} args.objectName - Must have `triggersEnabled` (people, company, opportunities, projects, or custom `__c`)
   * @param {Array<'create'|'update'|'delete'>} args.actions
   * @param {('enabled'|'paused'|'disabled')} [args.status='enabled']
   * @param {Object<string, {op: string, value: *}|*>} [args.recordFilter] - Current-row match (new row on create/update, old on delete)
   * @param {Array<{field: string, previous?: {op: string, value: *}, updated?: {op: string, value: *}}>} [args.changeFilters] - Field must be in `changedFields`; optional previous/updated checks
   * @param {('workflow'|'webhook')} args.actionType
   * @param {object} args.actionConfig
   * @param {string} [args.actionConfig.workflowVersionId] - Required when `actionType` is `'workflow'`
   * @param {string} [args.actionConfig.workflowId]
   * @param {string[]} [args.actionConfig.includeValues] - Field values to include (previous + updated). Empty = names only. `['*']` = every non-encrypted field. Encrypted columns are never sent.
   * @param {string} [args.actionConfig.primaryUrl] - Required when `actionType` is `'webhook'`; must be `https://`
   * @param {string} [args.actionConfig.secondaryUrl] - Failover URL; must be `https://` if set
   * @param {string} [args.actionConfig.credentialId] - Stored webhook authorization id
   * @param {number} [args.timeoutMinutes=15] - Queued-fire TTL, 1–1440
   * @param {number} [args.retries=3] - Webhook retries, 0–5
   * @returns {Promise<object>} Created trigger
   *
   * @example
   * await sdk.triggers.create({
   *   name: 'Notify CRM',
   *   objectName: 'people',
   *   actions: ['update'],
   *   actionType: 'webhook',
   *   actionConfig: {
   *     primaryUrl: 'https://example.com/hooks/lead',
   *     secondaryUrl: 'https://backup.example.com/hooks/lead',
   *     includeValues: ['leadScore', 'email'],
   *   },
   *   timeoutMinutes: 15,
   *   retries: 3,
   * });
   */
  async create({
    name,
    description,
    objectName,
    actions,
    status,
    recordFilter,
    changeFilters,
    actionType,
    actionConfig,
    timeoutMinutes,
    retries,
    recordTypeId,
  }) {
    const body = {
      name,
      description,
      objectName,
      actions,
      status,
      recordFilter,
      changeFilters,
      actionType,
      actionConfig,
      timeoutMinutes,
      retries,
      recordTypeId,
    };

    this.sdk.validateParams(
      { name, objectName, actions, actionType, actionConfig },
      {
        name: { type: 'string', required: true },
        objectName: { type: 'string', required: true },
        actions: { type: 'object', required: true },
        actionType: { type: 'string', required: true },
        actionConfig: { type: 'object', required: true },
      },
    );

    return internalRequest(this.sdk, '/triggers/', 'POST', { body });
  }

  /**
   * Update a trigger. Only provided fields are changed.
   *
   * @param {string} id
   * @param {object} args - Same shape as {@link TriggersService#create}; all keys optional
   * @returns {Promise<object>} Updated trigger
   *
   * @example
   * await sdk.triggers.update('173…', { status: 'paused' });
   */
  async update(id, args = {}) {
    this.sdk.validateParams(
      { id, args },
      {
        id: { type: 'string', required: true },
        args: { type: 'object', required: true },
      },
    );
    return internalRequest(this.sdk, `/triggers/${id}`, 'PUT', { body: args });
  }

  /**
   * Soft-delete a trigger.
   *
   * @param {string} id
   * @returns {Promise<{id: string, deleted: boolean}>}
   *
   * @example
   * await sdk.triggers.delete('173…');
   */
  async delete(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/triggers/${id}`, 'DELETE', {});
  }

  /**
   * Alias of {@link TriggersService#delete}.
   *
   * @param {string} id
   * @returns {Promise<{id: string, deleted: boolean}>}
   */
  async remove(id) {
    return this.delete(id);
  }

  /**
   * Set trigger status without a full update.
   *
   * @param {string} id
   * @param {('enabled'|'paused'|'disabled')} status
   * @param {object} [opts]
   * @param {string} [opts.pausedReason] - Stored when `status` is `'paused'`
   * @returns {Promise<object>} Updated trigger
   *
   * @example
   * await sdk.triggers.setStatus('173…', 'paused', { pausedReason: 'rate limit' });
   */
  async setStatus(id, status, { pausedReason } = {}) {
    this.sdk.validateParams(
      { id, status },
      {
        id: { type: 'string', required: true },
        status: { type: 'string', required: true },
      },
    );
    return internalRequest(this.sdk, `/triggers/${id}/status`, 'POST', {
      body: { status, pausedReason },
    });
  }

  /**
   * Recent execution log for a trigger (queued / fired / dropped / rejected / timeout).
   *
   * @param {string} id
   * @param {object} [opts]
   * @param {number} [opts.limit=50]
   * @returns {Promise<{results: object[]}>}
   *
   * @example
   * const { results } = await sdk.triggers.listFires('173…', { limit: 20 });
   */
  async listFires(id, { limit } = {}) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    const query = {};
    if (limit) query.limit = limit;
    return internalRequest(this.sdk, `/triggers/${id}/fires`, 'GET', { query });
  }
}
