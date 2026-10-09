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

  /**
   * Get a queue's per-channel skill-tier routing steps
   * (skill-proficiency-tiers-plan.md D2/§3.3). Step 0 (Expert only, full
   * requirements) is implicit and never included in the returned list.
   *
   * @param {string} queueId - The queue ID (required)
   * @returns {Promise<Object>} result
   * @returns {string} result.queueId
   * @returns {Object} result.routingSteps - Keyed by channel ('phoneCall'|'chat'|'email'|'sms'),
   *   e.g. `{ phoneCall: { steps: [{afterSec, allowedTiers, ignoreOptionalSkills, dropRequiredSkillIds}], learningNeverAutoRoute } }`
   *
   * @example
   * const { routingSteps } = await sdk.taskRouter.queues.getRoutingSteps('queue123');
   */
  async getRoutingSteps(queueId) {
    this.sdk.validateParams(
      { queueId },
      { queueId: { type: 'string', required: true } },
    );

    return await internalRequest(
      this.sdk,
      `/taskRouter/queues/${queueId}/routingSteps`,
      'GET',
    );
  }

  /**
   * Replace a queue's per-channel skill-tier routing steps. `afterSec`
   * must be strictly increasing within each channel's `steps` list; the
   * API validates this and rejects out-of-order steps.
   *
   * @param {string} queueId - The queue ID (required)
   * @param {Object} routingSteps - Keyed by channel ('phoneCall'|'chat'|'email'|'sms')
   * @param {Object[]} routingSteps[channel].steps - `[{afterSec, allowedTiers, ignoreOptionalSkills, dropRequiredSkillIds}]`
   * @param {boolean} [routingSteps[channel].learningNeverAutoRoute] - Coach-only: never auto-route Learning-tier workers on this channel
   * @returns {Promise<Object>} result
   * @returns {string} result.queueId
   * @returns {Object} result.routingSteps - The stored steps, as written (normalized)
   *
   * @example
   * await sdk.taskRouter.queues.setRoutingSteps('queue123', {
   *   phoneCall: {
   *     steps: [
   *       { afterSec: 30, allowedTiers: ['expert', 'proficient'], ignoreOptionalSkills: false, dropRequiredSkillIds: [] },
   *       { afterSec: 90, allowedTiers: ['expert', 'proficient', 'learning'], ignoreOptionalSkills: true, dropRequiredSkillIds: [] },
   *     ],
   *     learningNeverAutoRoute: false,
   *   },
   * });
   */
  async setRoutingSteps(queueId, routingSteps) {
    this.sdk.validateParams(
      { queueId, routingSteps },
      {
        queueId: { type: 'string', required: true },
        routingSteps: { type: 'object', required: true },
      },
    );

    return await internalRequest(
      this.sdk,
      `/taskRouter/queues/${queueId}/routingSteps`,
      'PUT',
      { body: { routingSteps } },
    );
  }

  /**
   * List a queue's alert rules (queueAlertRules table). Each rule fires
   * when its trigger metric crosses `threshold` by `comparator` and
   * stays there for `sustainSeconds` (proactive-alerts-plan.md §13/D1-D7).
   *
   * @param {string} queueId - The queue ID (required)
   * @returns {Promise<Object>} result
   * @returns {Object[]} result.alertRules - Rules for the queue
   *
   * @example
   * const { alertRules } = await sdk.taskRouter.queues.alerts.list('queue123');
   */
  async alertsList(queueId) {
    this.sdk.validateParams(
      { queueId },
      { queueId: { type: 'string', required: true } },
    );

    return await internalRequest(
      this.sdk,
      `/taskRouter/queues/${queueId}/alertRules`,
      'GET',
    );
  }

  /**
   * Create a new alert rule on a queue.
   *
   * @param {string} queueId - The queue ID (required)
   * @param {Object} rule - The rule to create
   * @param {string} rule.channel - 'phoneCall' | 'chat' | 'email' | 'sms' | 'fax' | 'other' | 'whatsApp' | 'rcs' | 'all'
   * @param {string} rule.trigger - 'pendingTasks' | 'longestWait' | 'serviceLevel' | 'availableAgents' | 'abandonmentRate' | 'abandonCount' | 'occupancy' | 'overflowMaxWait' | 'overflowNoAgents' | 'overflowCapacity' | 'overflowClosed'
   * @param {string} [rule.comparator] - 'gte' | 'lte' (defaults per trigger: serviceLevel/availableAgents -> lte, else gte)
   * @param {number} rule.threshold
   * @param {number} [rule.hysteresisValue]
   * @param {number} [rule.windowMinutes] - Required 1-60 iff trigger is 'abandonCount'
   * @param {number} [rule.sustainSeconds]
   * @param {number} [rule.cooldownSeconds]
   * @param {number} [rule.dailyCap]
   * @param {string} [rule.scheduleId]
   * @param {boolean} [rule.sendRecovery]
   * @param {number} [rule.escalateAfterSeconds]
   * @param {Object[]} rule.actions - `[{type:'email'|'sms'|'notification', userIds:[], teamIds:[]} | {type:'chat', channelId?, userIds?} | {type:'workflow', workflowId}]`
   * @param {Object[]} [rule.escalateActions] - Same shape as `actions`
   * @param {boolean} [rule.isEnabled]
   * @returns {Promise<Object>} result
   * @returns {Object} result.alertRule - The created rule
   *
   * @example
   * await sdk.taskRouter.queues.alerts.create('queue123', {
   *   channel: 'phoneCall',
   *   trigger: 'longestWait',
   *   threshold: 60,
   *   sustainSeconds: 60,
   *   actions: [{ type: 'notification', userIds: ['user1'], teamIds: [] }],
   * });
   */
  async alertsCreate(queueId, rule) {
    this.sdk.validateParams(
      { queueId, rule },
      {
        queueId: { type: 'string', required: true },
        rule: { type: 'object', required: true },
      },
    );

    return await internalRequest(
      this.sdk,
      `/taskRouter/queues/${queueId}/alertRules`,
      'POST',
      { body: rule },
    );
  }

  /**
   * Patch an existing alert rule.
   *
   * @param {string} queueId - The queue ID (required)
   * @param {string} ruleId - The alert rule ID (required)
   * @param {Object} patch - Partial fields to update (same shape as `create`'s `rule`)
   * @returns {Promise<Object>} result
   * @returns {Object} result.alertRule - The updated rule
   *
   * @example
   * await sdk.taskRouter.queues.alerts.update('queue123', 'rule1', { threshold: 90 });
   */
  async alertsUpdate(queueId, ruleId, patch) {
    this.sdk.validateParams(
      { queueId, ruleId, patch },
      {
        queueId: { type: 'string', required: true },
        ruleId: { type: 'string', required: true },
        patch: { type: 'object', required: true },
      },
    );

    return await internalRequest(
      this.sdk,
      `/taskRouter/queues/${queueId}/alertRules/${ruleId}`,
      'PATCH',
      { body: patch },
    );
  }

  /**
   * Delete an alert rule.
   *
   * @param {string} queueId - The queue ID (required)
   * @param {string} ruleId - The alert rule ID (required)
   * @returns {Promise<Object>} result
   *
   * @example
   * await sdk.taskRouter.queues.alerts.remove('queue123', 'rule1');
   */
  async alertsRemove(queueId, ruleId) {
    this.sdk.validateParams(
      { queueId, ruleId },
      {
        queueId: { type: 'string', required: true },
        ruleId: { type: 'string', required: true },
      },
    );

    return await internalRequest(
      this.sdk,
      `/taskRouter/queues/${queueId}/alertRules/${ruleId}`,
      'DELETE',
    );
  }

  /**
   * List a queue's alert event history (queueAlertEvents table): fired,
   * escalated, cleared, and suppressed events.
   *
   * @param {string} queueId - The queue ID (required)
   * @param {Object} [options]
   * @param {number} [options.limit] - Max rows to return (default 50)
   * @param {string} [options.before] - ISO timestamp cursor; only events before this time
   * @returns {Promise<Object>} result
   * @returns {Object[]} result.alertEvents
   *
   * @example
   * const { alertEvents } = await sdk.taskRouter.queues.alerts.history('queue123', { limit: 20 });
   */
  async alertsHistory(queueId, { limit, before } = {}) {
    this.sdk.validateParams(
      { queueId },
      { queueId: { type: 'string', required: true } },
    );

    const query = {};
    if (limit !== undefined) query.limit = limit;
    if (before !== undefined) query.before = before;

    return await internalRequest(
      this.sdk,
      `/taskRouter/queues/${queueId}/alertEvents`,
      'GET',
      { query },
    );
  }
}

// Exposes alert-rule methods as `sdk.taskRouter.queues.alerts.*` while
// keeping them implemented as plain methods on QueueService above (so they
// share `this.sdk`/validateParams without a second internalRequest wiring).
Object.defineProperty(QueueService.prototype, 'alerts', {
  get() {
    return {
      list: (queueId) => this.alertsList(queueId),
      create: (queueId, rule) => this.alertsCreate(queueId, rule),
      update: (queueId, ruleId, patch) => this.alertsUpdate(queueId, ruleId, patch),
      remove: (queueId, ruleId) => this.alertsRemove(queueId, ruleId),
      history: (queueId, options) => this.alertsHistory(queueId, options),
    };
  },
});
