import { internalRequest } from '../../base.js';

/**
 * Build the pause/unpause request body.
 * Pause requires `reasonId`; `reasonNote` is sent when provided (API requires
 * it when the reason is Other / `allowsNote`). Unpause is `{ paused: false }` only.
 *
 * @param {Object} options
 * @param {boolean} options.paused
 * @param {string} [options.reasonId]
 * @param {string} [options.reasonNote]
 * @returns {{paused: boolean, reasonId?: string, reasonNote?: string}}
 */
export function buildPausedBody({ paused, reasonId, reasonNote }) {
  if (paused === false) {
    return { paused: false };
  }

  const body = { paused: true };
  if (reasonId !== undefined) {
    body.reasonId = reasonId;
  }
  if (reasonNote !== undefined) {
    body.reasonNote = reasonNote;
  }
  return body;
}

export function validatePausedParams(sdk, { paused, reasonId, reasonNote }) {
  sdk.validateParams(
    { paused, reasonId, reasonNote },
    {
      paused: { type: 'boolean', required: true },
      reasonId: { type: 'string', required: paused === true },
      reasonNote: { type: 'string', required: false },
    },
  );
}

// Pause methods mixed onto WorkerService.prototype so WorkerService.js
// stays closer to the ~400-line guideline.
export const workerPauseMethods = {
  /**
   * Set the authenticated user's own worker paused state.
   * Pauses (or unpauses) the caller's own worker so it stays logged into its
   * queues but stops receiving new task offers. Requires Contact Center access.
   *
   * When `paused: true`, the body must include `reasonId` from the account
   * pause-reason list (`sdk.taskRouter.cc.listPauseReasons`). Include
   * `reasonNote` when the chosen reason is Other (`allowsNote`). Unpause
   * sends `{ paused: false }` only.
   *
   * @param {Object} options - Parameters
   * @param {boolean} options.paused - Whether the worker should be paused
   * @param {string} [options.reasonId] - Pause reason id (required when pausing)
   * @param {string} [options.reasonNote] - Free-text note (required by API when the reason `allowsNote`)
   * @returns {Promise<Object>} The updated worker
   *
   * @example
   * const worker = await sdk.taskRouter.worker.setPaused({
   *   paused: true,
   *   reasonId: 'reason-lunch',
   * });
   *
   * @example
   * const worker = await sdk.taskRouter.worker.setPaused({
   *   paused: true,
   *   reasonId: 'reason-other',
   *   reasonNote: 'Doctor appointment',
   * });
   *
   * @example
   * const worker = await sdk.taskRouter.worker.setPaused({ paused: false });
   */
  async setPaused(options = {}) {
    const { paused, reasonId, reasonNote } = options;

    validatePausedParams(this.sdk, { paused, reasonId, reasonNote });

    const result = await internalRequest(
      this.sdk,
      '/taskRouter/workers/me/paused',
      'PUT',
      { body: buildPausedBody({ paused, reasonId, reasonNote }) },
    );
    return result;
  },

  /**
   * Set another worker's paused state.
   * Pauses (or unpauses) a specific worker by workerId. The caller must be a
   * queue manager for at least one queue that worker is logged into or assigned to.
   *
   * When `paused: true`, the body must include `reasonId`. Include `reasonNote`
   * when the reason is Other (`allowsNote`). Unpause sends `{ paused: false }` only.
   *
   * @param {Object} options - Parameters
   * @param {string} options.workerId - The worker ID to update (required)
   * @param {boolean} options.paused - Whether the worker should be paused
   * @param {string} [options.reasonId] - Pause reason id (required when pausing)
   * @param {string} [options.reasonNote] - Free-text note (required by API when the reason `allowsNote`)
   * @returns {Promise<Object>} The updated worker
   *
   * @example
   * const worker = await sdk.taskRouter.worker.setWorkerPaused({
   *   workerId: '0860002026012400000006665842155429980',
   *   paused: true,
   *   reasonId: 'reason-break',
   * });
   */
  async setWorkerPaused(options = {}) {
    const { workerId, paused, reasonId, reasonNote } = options;

    this.sdk.validateParams(
      { workerId },
      { workerId: { type: 'string', required: true } },
    );
    validatePausedParams(this.sdk, { paused, reasonId, reasonNote });

    const result = await internalRequest(
      this.sdk,
      `/taskRouter/workers/${workerId}/paused`,
      'PUT',
      { body: buildPausedBody({ paused, reasonId, reasonNote }) },
    );
    return result;
  },
};
