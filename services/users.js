import { internalRequest } from '../base.js';

// agent-reporting-plan.md P0 — status reasons (§5.1) + a typed wrapper over
// the existing status-set path (objects.updateById on the `users` object;
// see app1-api src/services/objects/functions/customHandlers/update/users.js).
// No existing "users" service in the SDK to extend — this is a new one.
export class UsersService {
  constructor(sdk) {
    this.sdk = sdk;
    this.statusReasons = {
      list: (...args) => this.listStatusReasons(...args),
      create: (...args) => this.createStatusReason(...args),
      update: (...args) => this.updateStatusReason(...args),
      remove: (...args) => this.removeStatusReason(...args),
    };
    this.status = {
      set: (...args) => this.setStatus(...args),
    };
  }

  /**
   * List agent status reasons (includes system rows).
   * @returns {Promise<Object>} Object with results: Array of status reasons
   * @example
   * const { results } = await sdk.users.statusReasons.list();
   */
  async listStatusReasons() {
    return internalRequest(this.sdk, '/userStatusReasons', 'GET');
  }

  /**
   * Create an admin-defined status reason.
   * @param {Object} reason
   * @param {string} reason.code - Unique code (required)
   * @param {string} reason.label - Display label (required)
   * @param {string} reason.state - 'Away' | 'Busy' | 'Offline' (required)
   * @param {string} [reason.emoji]
   * @param {number} [reason.maxSeconds]
   * @param {boolean} [reason.isPaid]
   * @param {number} [reason.order]
   * @returns {Promise<Object>} Created status reason
   * @example
   * await sdk.users.statusReasons.create({ code: 'standup', label: 'Standup', state: 'Away' });
   */
  async createStatusReason({ code, label, state, emoji, maxSeconds, isPaid, order }) {
    this.sdk.validateParams(
      { code, label, state },
      {
        code: { type: 'string', required: true },
        label: { type: 'string', required: true },
        state: { type: 'string', required: true },
      },
    );

    const body = { code, label, state };
    if (emoji !== undefined) body.emoji = emoji;
    if (maxSeconds !== undefined) body.maxSeconds = maxSeconds;
    if (isPaid !== undefined) body.isPaid = isPaid;
    if (order !== undefined) body.order = order;

    return internalRequest(this.sdk, '/userStatusReasons', 'POST', { body });
  }

  /**
   * Update a status reason (label/emoji/maxSeconds/isPaid/order only —
   * code/state are immutable for every row).
   * @param {string} id
   * @param {Object} data
   * @returns {Promise<Object>} Updated status reason
   * @example
   * await sdk.users.statusReasons.update('usr_break', { maxSeconds: 600 });
   */
  async updateStatusReason(id, data) {
    id = String(id);
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });

    return internalRequest(this.sdk, `/userStatusReasons/${id}`, 'PUT', {
      body: data,
    });
  }

  /**
   * Delete (soft) an admin-defined status reason. System reasons cannot be
   * deleted.
   * @param {string} id
   * @returns {Promise<Object>} Deletion confirmation
   * @example
   * await sdk.users.statusReasons.remove('usr_standup');
   */
  async removeStatusReason(id) {
    id = String(id);
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });

    return internalRequest(this.sdk, `/userStatusReasons/${id}`, 'DELETE');
  }

  /**
   * Set the current user's (or another user's, with permission) presence
   * status. Thin typed wrapper over
   * `sdk.objects.updateById({ object: 'users', ... })` — the underlying
   * write path is unchanged, this just gives status-set a discoverable,
   * typed entry point that also carries `reasonId`.
   * @param {string} userId
   * @param {Object} status
   * @param {string} status.state - e.g. 'Available' | 'Away' | 'Busy' | 'Offline'
   * @param {string} [status.reasonId] - id from statusReasons.list()
   * @param {string} [status.label] - custom label, when no reasonId applies
   * @param {string} [status.emoji] - custom emoji, when no reasonId applies
   * @returns {Promise<Object>} Updated user
   * @example
   * await sdk.users.status.set('user-123', { state: 'Away', reasonId: 'usr_break' });
   */
  async setStatus(userId, { state, reasonId, label, emoji } = {}) {
    userId = String(userId);
    this.sdk.validateParams(
      { userId, state },
      {
        userId: { type: 'string', required: true },
        state: { type: 'string', required: true },
      },
    );

    const status = { state };
    if (reasonId !== undefined) status.reasonId = reasonId;
    if (label !== undefined) status.label = label;
    if (emoji !== undefined) status.emoji = emoji;

    return this.sdk.objects.updateById({
      object: 'users',
      id: userId,
      update: { status },
    });
  }
}
