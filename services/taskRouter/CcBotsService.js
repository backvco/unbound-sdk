import { internalRequest } from '../../base.js';

/**
 * CC worker bots — Setup → Bots (K21). Not Graham /chat/bots.
 */
export class CcBotsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Platform defaults for When to get help + model pickers.
   * @returns {Promise<Object>}
   */
  async defaults() {
    return internalRequest(this.sdk, '/taskRouter/ccBots/defaults', 'GET');
  }

  /**
   * List CC worker bots for the account.
   * @returns {Promise<Object>} { results }
   */
  async list() {
    return internalRequest(this.sdk, '/taskRouter/ccBots', 'GET');
  }

  /**
   * Create a named CC worker bot (user + worker, capacity 1).
   * @param {Object} params
   * @param {string} params.name
   * @param {string} params.slug
   * @param {string} [params.soulMd]
   * @param {string} [params.provider]
   * @param {string} [params.model]
   * @param {string} [params.queueId]
   * @param {string} [params.mailboxId]
   * @returns {Promise<Object>}
   */
  async create({
    name,
    slug,
    soulMd,
    provider,
    model,
    queueId,
    mailboxId,
  } = {}) {
    this.sdk.validateParams(
      { name, slug },
      {
        name: { type: 'string', required: true },
        slug: { type: 'string', required: true },
      },
    );
    const body = { name, slug };
    if (soulMd !== undefined) body.soulMd = soulMd;
    if (provider !== undefined) body.provider = provider;
    if (model !== undefined) body.model = model;
    if (queueId !== undefined) body.queueId = queueId;
    if (mailboxId !== undefined) body.mailboxId = mailboxId;
    return internalRequest(this.sdk, '/taskRouter/ccBots', 'POST', { body });
  }

  /**
   * Get one CC worker bot.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async get(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/taskRouter/ccBots/${id}`, 'GET');
  }

  /**
   * Patch name / soul / model / pause kill-switch.
   * @param {string} id
   * @param {Object} [params]
   * @returns {Promise<Object>}
   */
  async update(id, params = {}) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    const body = {};
    for (const key of ['name', 'soulMd', 'provider', 'model', 'paused']) {
      if (key in params) body[key] = params[key];
    }
    return internalRequest(this.sdk, `/taskRouter/ccBots/${id}`, 'PATCH', {
      body,
    });
  }

  /**
   * Login a CC bot into a queue (queueUsers + worker addQueues).
   * @param {string} id
   * @param {Object} params
   * @param {string} params.queueId
   * @returns {Promise<Object>}
   */
  async addToQueue(id, { queueId } = {}) {
    this.sdk.validateParams(
      { id, queueId },
      {
        id: { type: 'string', required: true },
        queueId: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/taskRouter/ccBots/${id}/queues`,
      'POST',
      { body: { queueId } },
    );
  }
}
