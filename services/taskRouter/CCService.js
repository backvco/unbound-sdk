export class CCService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Resolve the caller's Contact Center queue scope + role.
   * Managers see every non-deleted queue; agents see only the queues they
   * belong to (queueUsers).
   *
   * @returns {Promise<Object>} result
   * @returns {boolean} result.isManager - Whether the caller has queue-manager scope
   * @returns {string|null} result.workerId - The caller's own worker id, if any
   * @returns {Array<Object>} result.queues - Accessible queues [{id, name, slaThreshold, slaTargetPct, timezone}]
   *
   * @example
   * const scope = await sdk.taskRouter.cc.getScope();
   * console.log(scope.isManager, scope.queues.length);
   */
  async getScope() {
    const result = await this.sdk._fetch('/taskRouter/cc/scope', 'GET', {});
    return result;
  }

  /**
   * Get a live Contact Center snapshot (KPIs, per-queue summaries, team roster
   * with active tasks) scoped to a set of queues.
   *
   * @param {Object} [options] - Parameters
   * @param {string[]} [options.queueIds] - Queue ids to scope to (must be a subset of the caller's accessible queues). Omit/empty for full scope.
   * @returns {Promise<Object>} result
   * @returns {Object} result.kpis - Aggregate KPIs (inQueueNow, longestWaitSec, myHandledToday, myAvgHandleSecToday, slaTodayPct, slaTargetPct)
   * @returns {Array<Object>} result.queues - Per-queue summaries (id, name, waiting, longestWaitSec, agentsAvailable, agentsTotal, slaPct, slaThreshold, slaTargetPct, timezone, health)
   * @returns {Array<Object>} result.team - Team roster with active tasks
   *
   * @example
   * const snapshot = await sdk.taskRouter.cc.getSnapshot({ queueIds: ['q1', 'q2'] });
   * console.log(snapshot.kpis.inQueueNow);
   */
  async getSnapshot(options = {}) {
    const { queueIds } = options;

    this.sdk.validateParams(
      { queueIds },
      {
        queueIds: { type: 'array', required: false },
      },
    );

    const params = {};
    if (queueIds && queueIds.length) {
      params.query = { queueIds: queueIds.join(',') };
    }

    const result = await this.sdk._fetch(
      '/taskRouter/cc/snapshot',
      'GET',
      params,
    );
    return result;
  }

  /**
   * Get on-queue session history for a worker (self allowed; another
   * worker's sessions require the queue-manager scope).
   *
   * @param {Object} [options] - Parameters
   * @param {string} [options.workerId] - Worker id to fetch sessions for (defaults to the caller's own worker)
   * @param {string} [options.from] - ISO-8601 range start
   * @param {string} [options.to] - ISO-8601 range end
   * @returns {Promise<Object>} result
   * @returns {Array<Object>} result.sessions - [{id, startedAt, endedAt, onQueueSec, breakSec, doneCount}]
   *
   * @example
   * const { sessions } = await sdk.taskRouter.cc.getSessions({ workerId: 'w1', from: '2026-08-12T00:00:00Z', to: '2026-08-19T00:00:00Z' });
   */
  async getSessions(options = {}) {
    const { workerId, from, to } = options;

    this.sdk.validateParams(
      { workerId, from, to },
      {
        workerId: { type: 'string', required: false },
        from: { type: 'string', required: false },
        to: { type: 'string', required: false },
      },
    );

    const query = {};
    if (workerId) query.workerId = workerId;
    if (from) query.from = from;
    if (to) query.to = to;

    const result = await this.sdk._fetch('/taskRouter/cc/sessions', 'GET', {
      query,
    });
    return result;
  }

  /**
   * Get windowed composite agent rankings (top/struggling) per queue + an
   * 'all' rollup, scored from sentiment/SLA/volume/acceptance. `struggling`
   * arrays are only present when the caller has the queue-manager scope
   * (see `strugglingIncluded` on the result).
   *
   * @param {Object} [options] - Parameters
   * @param {string[]} [options.queueIds] - Queue ids to scope to (must be a subset of the caller's accessible queues). Omit/empty for full scope.
   * @param {string} options.from - ISO-8601 window start
   * @param {string} options.to - ISO-8601 window end
   * @returns {Promise<Object>} result
   * @returns {Object} result.queues - Per-queue rankings, keyed by queueId: `{ top: [{workerId,name,score}], struggling?: [...] }`
   * @returns {Object} result.all - Same shape, aggregated across every scoped queue
   * @returns {boolean} result.strugglingIncluded - Whether `struggling` arrays were included
   *
   * @example
   * const { queues, all } = await sdk.taskRouter.cc.getRankings({
   *   queueIds: ['q1'],
   *   from: '2026-08-12T00:00:00Z',
   *   to: '2026-08-19T00:00:00Z',
   * });
   * console.log(all.top[0].name, all.top[0].score);
   */
  async getRankings(options = {}) {
    const { queueIds, from, to } = options;

    this.sdk.validateParams(
      { queueIds, from, to },
      {
        queueIds: { type: 'array', required: false },
        from: { type: 'string', required: true },
        to: { type: 'string', required: true },
      },
    );

    const query = { from, to };
    if (queueIds && queueIds.length) {
      query.queueIds = queueIds.join(',');
    }

    const result = await this.sdk._fetch('/taskRouter/cc/rankings', 'GET', {
      query,
    });
    return result;
  }

  /**
   * Set a queue's composite ranking-weights override. Manager-only
   * (`taskrouter:queue:manage`). Weights must be integers 0-100 that sum to
   * exactly 100.
   *
   * @param {Object} options - Parameters
   * @param {string} options.queueId - Queue id to update
   * @param {Object} options.weights - `{sentiment, aht, volume, acceptance}` ints summing to 100
   * @returns {Promise<Object>} result
   * @returns {string} result.queueId
   * @returns {Object} result.rankingWeights - The stored weights
   *
   * @example
   * await sdk.taskRouter.cc.setQueueRankingWeights({
   *   queueId: 'q1',
   *   weights: { sentiment: 40, aht: 30, volume: 5, acceptance: 25 },
   * });
   */
  async setQueueRankingWeights(options = {}) {
    const { queueId, weights } = options;

    this.sdk.validateParams(
      { queueId, weights },
      {
        queueId: { type: 'string', required: true },
        weights: { type: 'object', required: true },
      },
    );

    const result = await this.sdk._fetch(
      `/taskRouter/cc/queues/${queueId}/rankingWeights`,
      'PUT',
      { body: weights },
    );
    return result;
  }

  /**
   * Get one agent's Contact Center performance summary (KPIs, per-day
   * charts, live tasks, on-queue sessions) over a date/date-range, with a
   * comparison window for deltas. Self allowed; another worker's summary
   * requires the queue-manager scope.
   *
   * @param {Object} options - Parameters
   * @param {string} options.workerId - Worker id to summarize
   * @param {string} options.from - ISO-8601 window start
   * @param {string} options.to - ISO-8601 window end
   * @param {string} [options.compareFrom] - ISO-8601 comparison window start (defaults to the preceding equal-length period)
   * @param {string} [options.compareTo] - ISO-8601 comparison window end
   * @returns {Promise<Object>} result
   * @returns {Object} result.kpis - tasksHandled, offersAccepted, avgHandleSec, slaMet, avgSentiment, composite, onQueue
   * @returns {Array<Object>} result.tasksPerDay - [{date, count}]
   * @returns {Array<Object>} result.trend - [{date, sentiment, slaPct}]
   * @returns {Array<Object>} result.liveNow - Current tasks (only when the window includes today)
   * @returns {Array<Object>} result.sessions - On-queue session log
   *
   * @example
   * const summary = await sdk.taskRouter.cc.getAgentSummary({
   *   workerId: 'w1',
   *   from: '2026-08-12T00:00:00Z',
   *   to: '2026-08-19T00:00:00Z',
   * });
   * console.log(summary.kpis.tasksHandled.value);
   */
  async getAgentSummary(options = {}) {
    const { workerId, from, to, compareFrom, compareTo } = options;

    this.sdk.validateParams(
      { workerId, from, to, compareFrom, compareTo },
      {
        workerId: { type: 'string', required: true },
        from: { type: 'string', required: true },
        to: { type: 'string', required: true },
        compareFrom: { type: 'string', required: false },
        compareTo: { type: 'string', required: false },
      },
    );

    const query = { from, to };
    if (compareFrom) query.compareFrom = compareFrom;
    if (compareTo) query.compareTo = compareTo;

    const result = await this.sdk._fetch(
      `/taskRouter/cc/agents/${workerId}/summary`,
      'GET',
      { query },
    );
    return result;
  }

  /**
   * Log a worker into or out of a queue. Manager-only
   * (`taskrouter:queue:manage`). Mutates the worker's queue membership
   * through task-router (audited).
   *
   * @param {Object} options - Parameters
   * @param {string} options.workerId - Worker id to update
   * @param {string} options.queueId - Queue id to log in/out of
   * @param {'login'|'logout'} options.action - Whether to add or remove the queue
   * @returns {Promise<Object>} result
   * @returns {string} result.workerId
   * @returns {string} result.status
   * @returns {Array<string>} result.queues - The worker's updated queue list
   *
   * @example
   * await sdk.taskRouter.cc.setWorkerQueue({ workerId: 'w1', queueId: 'q1', action: 'login' });
   */
  async setWorkerQueue(options = {}) {
    const { workerId, queueId, action } = options;

    this.sdk.validateParams(
      { workerId, queueId, action },
      {
        workerId: { type: 'string', required: true },
        queueId: { type: 'string', required: true },
        action: { type: 'string', required: true },
      },
    );

    const result = await this.sdk._fetch(
      `/taskRouter/cc/workers/${workerId}/queues`,
      'PUT',
      { body: { queueId, action } },
    );
    return result;
  }

  /**
   * Force a worker offline (out of every queue), closing their on-queue
   * session. Manager-only (`taskrouter:queue:manage`, audited).
   *
   * @param {Object} options - Parameters
   * @param {string} options.workerId - Worker id to log out
   * @returns {Promise<Object>} result
   * @returns {string} result.workerId
   * @returns {string} result.status
   * @returns {Array<string>} result.queues
   *
   * @example
   * await sdk.taskRouter.cc.forceLogoutWorker({ workerId: 'w1' });
   */
  async forceLogoutWorker(options = {}) {
    const { workerId } = options;

    this.sdk.validateParams(
      { workerId },
      { workerId: { type: 'string', required: true } },
    );

    const result = await this.sdk._fetch(
      `/taskRouter/cc/workers/${workerId}/forceLogout`,
      'POST',
      {},
    );
    return result;
  }
}
