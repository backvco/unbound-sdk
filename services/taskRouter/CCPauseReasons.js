import { internalRequest } from '../../base.js';

// Pause-reason CRUD mixed onto CCService.prototype so CCService.js stays
// under the ~400-line guideline.
export const ccPauseReasonMethods = {
  /**
   * List account pause reasons for the Contact Center picker.
   * Returns enabled, non-system Away reasons (seeded Break, Lunch, Meeting,
   * Training, Coaching, Other). Other has `allowsNote: true`; an account can
   * disable Other via `isEnabled`.
   *
   * @returns {Promise<Object>} result
   * @returns {Array<Object>} result.reasons - [{id, label, order, isEnabled, allowsNote, isSystem}]
   *
   * @example
   * const { reasons } = await sdk.taskRouter.cc.listPauseReasons();
   * const other = reasons.find((r) => r.allowsNote);
   */
  async listPauseReasons() {
    const result = await internalRequest(
      this.sdk,
      '/taskRouter/cc/pauseReasons',
      'GET',
      {},
    );
    return result;
  },

  /**
   * Create a pause reason. Manager-only (`taskrouter:queue:manage`).
   *
   * @param {Object} options - Parameters
   * @param {string} options.label - Display label
   * @param {number} [options.order] - Sort order
   * @param {boolean} [options.isEnabled] - Whether the reason appears in the picker
   * @param {boolean} [options.allowsNote] - Whether pausing with this reason requires `reasonNote`
   * @returns {Promise<Object>} The created pause reason
   *
   * @example
   * const reason = await sdk.taskRouter.cc.createPauseReason({
   *   label: 'Shift huddle',
   *   order: 7,
   * });
   */
  async createPauseReason(options = {}) {
    const { label, order, isEnabled, allowsNote } = options;

    this.sdk.validateParams(
      { label, order, isEnabled, allowsNote },
      {
        label: { type: 'string', required: true },
        order: { type: 'number', required: false },
        isEnabled: { type: 'boolean', required: false },
        allowsNote: { type: 'boolean', required: false },
      },
    );

    const body = { label };
    if (order !== undefined) body.order = order;
    if (isEnabled !== undefined) body.isEnabled = isEnabled;
    if (allowsNote !== undefined) body.allowsNote = allowsNote;

    const result = await internalRequest(
      this.sdk,
      '/taskRouter/cc/pauseReasons',
      'POST',
      { body },
    );
    return result;
  },

  /**
   * Update a pause reason (label, order, isEnabled, allowsNote).
   * Manager-only (`taskrouter:queue:manage`).
   *
   * @param {Object} options - Parameters
   * @param {string} options.id - Pause reason id
   * @param {string} [options.label] - Display label
   * @param {number} [options.order] - Sort order
   * @param {boolean} [options.isEnabled] - Whether the reason appears in the picker
   * @param {boolean} [options.allowsNote] - Whether pausing with this reason requires `reasonNote`
   * @returns {Promise<Object>} The updated pause reason
   *
   * @example
   * await sdk.taskRouter.cc.updatePauseReason({
   *   id: 'reason-other',
   *   isEnabled: false,
   * });
   */
  async updatePauseReason(options = {}) {
    const { id, label, order, isEnabled, allowsNote } = options;

    this.sdk.validateParams(
      { id, label, order, isEnabled, allowsNote },
      {
        id: { type: 'string', required: true },
        label: { type: 'string', required: false },
        order: { type: 'number', required: false },
        isEnabled: { type: 'boolean', required: false },
        allowsNote: { type: 'boolean', required: false },
      },
    );

    const body = {};
    if (label !== undefined) body.label = label;
    if (order !== undefined) body.order = order;
    if (isEnabled !== undefined) body.isEnabled = isEnabled;
    if (allowsNote !== undefined) body.allowsNote = allowsNote;

    const result = await internalRequest(
      this.sdk,
      `/taskRouter/cc/pauseReasons/${id}`,
      'PUT',
      { body },
    );
    return result;
  },

  /**
   * Soft-delete a pause reason. Manager-only. System seed rows cannot be deleted.
   *
   * @param {Object} options - Parameters
   * @param {string} options.id - Pause reason id
   * @returns {Promise<Object>} Success response
   *
   * @example
   * await sdk.taskRouter.cc.deletePauseReason({ id: 'reason-custom' });
   */
  async deletePauseReason(options = {}) {
    const { id } = options;

    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );

    const result = await internalRequest(
      this.sdk,
      `/taskRouter/cc/pauseReasons/${id}`,
      'DELETE',
      {},
    );
    return result;
  },
};
