import { internalRequest } from '../../base.js';

// queues.overflowRules / queues.pendingCounts (queue-capacity-overflow-plan.md
// v4, P4 contract D). Kept as its own file per CLAUDE.md's 400-line guideline
// rather than folding into TaskService.js.
export class QueueService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Get the queue's overflow rules (queueOverflowRules table). When the
   * queue has no normalized rows yet, the API synthesizes editable rules
   * from the legacy waitPolicy/closedPolicy columns instead of returning
   * an empty array.
   *
   * @param {string} queueId - The queue ID (required)
   * @returns {Promise<Object>} result
   * @returns {Object[]} result.overflowRules - Rows for the queue (one per queueId x channel x trigger)
   * @returns {boolean} result.synthesized - True when the rules were derived from legacy waitPolicy/closedPolicy, not read from queueOverflowRules
   *
   * @example
   * const { overflowRules } = await sdk.taskRouter.queues.getOverflowRules('queue123');
   */
  async getOverflowRules(queueId) {
    this.sdk.validateParams(
      { queueId },
      { queueId: { type: 'string', required: true } },
    );

    return await internalRequest(
      this.sdk,
      `/taskRouter/queues/${queueId}/overflowRules`,
      'GET',
    );
  }

  /**
   * Replace the full set of overflow rules for a queue.
   *
   * @param {string} queueId - The queue ID (required)
   * @param {Object[]} rules - The complete set of overflow rules to store for this queue (replaces any existing rows)
   * @param {string} rules[].channel - 'phoneCall' | 'chat' | 'email' | 'sms' | 'fax' | 'other' | 'whatsApp' | 'rcs'
   * @param {string} rules[].trigger - 'maxWait' | 'noAgents' | 'capacity' | 'closed'
   * @param {string} rules[].action - 'none' | 'complete' | 'leaveMessage' | 'callback' | 'routeToQueue' | 'rebalance' | 'routeToWorkflow' | 'routeToDestination'
   * @param {Object} [rules[].options] - Action-specific options (e.g. maxWaitSeconds, targetWorkflowId, destination)
   * @param {string[]} [rules[].candidateQueueIds] - Candidate queue ids for routeToQueue/rebalance actions
   * @returns {Promise<Object>} result
   * @returns {Object[]} result.overflowRules - The stored rules, as written
   *
   * @example
   * await sdk.taskRouter.queues.setOverflowRules('queue123', [
   *   { channel: 'phoneCall', trigger: 'maxWait', action: 'routeToWorkflow', options: { targetWorkflowId: 'wf1' } },
   * ]);
   */
  async setOverflowRules(queueId, rules) {
    this.sdk.validateParams(
      { queueId, rules },
      {
        queueId: { type: 'string', required: true },
        rules: { type: 'array', required: true },
      },
    );

    return await internalRequest(
      this.sdk,
      `/taskRouter/queues/${queueId}/overflowRules`,
      'PUT',
      { body: { overflowRules: rules } },
    );
  }

  /**
   * Get the queue's current pending counts per channel. Thin proxy onto
   * task-router's authoritative, committed counts (not a SQL COUNT(*)).
   *
   * @param {string} queueId - The queue ID (required)
   * @returns {Promise<Object>} result
   * @returns {string} result.queueId
   * @returns {Object} result.counts - Keyed by channel, e.g. `{ phoneCall: { pending, asyncWait, voicemail } }`
   *
   * @example
   * const { counts } = await sdk.taskRouter.queues.getPendingCounts('queue123');
   * const waitingCalls = counts.phoneCall?.pending ?? 0;
   */
  async getPendingCounts(queueId) {
    this.sdk.validateParams(
      { queueId },
      { queueId: { type: 'string', required: true } },
    );

    return await internalRequest(
      this.sdk,
      `/taskRouter/queues/${queueId}/pendingCounts`,
      'GET',
    );
  }
}
