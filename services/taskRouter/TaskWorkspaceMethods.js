import { internalRequest } from '../../base.js';

// CC task-workspace methods (claim / observe / self-join-derived access / take)
// mixed onto TaskService.prototype. Split into its own file to keep
// TaskService.js from growing further past the 400-line guideline.
export const taskWorkspaceMethods = {
  /**
   * Claim an unassigned task (pending/waiting/parked with no assignee).
   * Force-assigns the task to the caller's worker with a normal ring/offer
   * (not assign-connected) -- the caller still sees the usual offer card
   * and accepts manually.
   *
   * @param {Object} options - Parameters
   * @param {string} options.taskId - The task ID to claim (required)
   * @returns {Promise<{taskId:string, workerId:string, status:string}>}
   */
  async claim(options = {}) {
    const { taskId } = options;

    this.sdk.validateParams(
      { taskId },
      { taskId: { type: 'string', required: true } },
    );

    return await internalRequest(
      this.sdk,
      `/taskRouter/tasks/${taskId}/claim`,
      'POST',
      {},
    );
  },

  /**
   * Send an observer-presence heartbeat for a task. Call on an interval
   * (< 45s) while a manager/queue member is watching a task read-only;
   * membership expires automatically if heartbeats stop.
   *
   * @param {Object} options - Parameters
   * @param {string} options.taskId - The task ID to observe (required)
   * @returns {Promise<{ok:boolean}>}
   */
  async observe(options = {}) {
    const { taskId } = options;

    this.sdk.validateParams(
      { taskId },
      { taskId: { type: 'string', required: true } },
    );

    return await internalRequest(
      this.sdk,
      `/taskRouter/tasks/${taskId}/observe`,
      'POST',
      {},
    );
  },

  /**
   * Stop observing a task (removes the caller from the observer set).
   *
   * @param {Object} options - Parameters
   * @param {string} options.taskId - The task ID to stop observing (required)
   * @returns {Promise<{ok:boolean}>}
   */
  async unobserve(options = {}) {
    const { taskId } = options;

    this.sdk.validateParams(
      { taskId },
      { taskId: { type: 'string', required: true } },
    );

    return await internalRequest(
      this.sdk,
      `/taskRouter/tasks/${taskId}/observe`,
      'DELETE',
      {},
    );
  },

  /**
   * List the current observers of a task. Manager-only.
   *
   * @param {Object} options - Parameters
   * @param {string} options.taskId - The task ID (required)
   * @returns {Promise<Array<{userId:string, name:string, since:string}>>}
   */
  async observers(options = {}) {
    const { taskId } = options;

    this.sdk.validateParams(
      { taskId },
      { taskId: { type: 'string', required: true } },
    );

    return await internalRequest(
      this.sdk,
      `/taskRouter/tasks/${taskId}/observers`,
      'GET',
      {},
    );
  },

  /**
   * Seize ownership of a currently-assigned task away from its owner.
   * Queue-manager only; reuses the normal transfer-offer chain with the
   * caller as target, so the caller gets the usual offer card and accepts
   * manually (ownership moves on accept, not on this call).
   *
   * @param {Object} options - Parameters
   * @param {string} options.taskId - The task ID to take (required)
   * @returns {Promise<{offerId:string}>}
   */
  async take(options = {}) {
    const { taskId } = options;

    this.sdk.validateParams(
      { taskId },
      { taskId: { type: 'string', required: true } },
    );

    return await internalRequest(
      this.sdk,
      `/taskRouter/tasks/${taskId}/take`,
      'POST',
      {},
    );
  },

  /**
   * Compute the caller's entry-point access mode for a task, used to drive
   * which open/join/take/claim actions the client offers.
   *
   * @param {Object} options - Parameters
   * @param {string} options.taskId - The task ID (required)
   * @returns {Promise<{
   *   mode: 'owner'|'helper'|'helperLimited'|'claim'|'observe'|'none',
   *   canJoin: boolean,
   *   canPrivate: boolean,
   *   canTake: boolean,
   *   canClaim: boolean,
   *   isQueueManager: boolean,
   *   isQueueMember: boolean,
   *   ownerName: string|null,
   * }>}
   */
  async access(options = {}) {
    const { taskId } = options;

    this.sdk.validateParams(
      { taskId },
      { taskId: { type: 'string', required: true } },
    );

    return await internalRequest(
      this.sdk,
      `/taskRouter/tasks/${taskId}/access`,
      'GET',
      {},
    );
  },

  /**
   * Exact per-status task counts (GAP B, cc-task-workspace-plan.md §2.2) --
   * replaces client-side approximations that count a page-size-capped
   * results list. ACL = logged-in user, scoped to the caller's account.
   *
   * @param {Object} options - Parameters
   * @param {string[]} options.statuses - Task statuses to count, e.g. ['parked']
   * @param {boolean} [options.mine] - Scope to the caller's own workerId
   *   (same filter as the mini-card strip's owned-tasks fetch)
   * @returns {Promise<{counts: Object<string, number>}>}
   */
  async counts(options = {}) {
    const { statuses, mine } = options;

    this.sdk.validateParams(
      { statuses },
      { statuses: { type: 'array', required: true } },
    );

    return await internalRequest(this.sdk, `/taskRouter/tasks/counts`, 'GET', {
      query: {
        statuses: statuses.join(','),
        ...(mine !== undefined ? { mine } : {}),
      },
    });
  },
};
