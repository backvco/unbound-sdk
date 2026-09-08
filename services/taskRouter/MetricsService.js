import { internalRequest } from '../../base.js';
export class MetricsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Get current task router metrics
   * Retrieves real-time metrics for task router queues, tasks, and workers.
   * This provides insights into queue performance, wait times, task counts, and worker activity.
   *
   * Accepts either `(params)` or `(accountId, params)` -- every client
   * caller uses the former (e.g. `getCurrent({ queueId })`), and
   * `accountId` is optional (the API route scopes by the authenticated
   * account already). Sent as a query string, not a body: this hits
   * `/taskRouter/metrics/current` over GET, and base.js's `_httpRequest`
   * deletes `body` on any GET request, so a body-only payload here was
   * silently discarded before ever reaching the server.
   *
   * @param {Object|string} [paramsOrAccountId] - Either the params object (preferred) or an accountId string
   * @param {Object} [maybeParams] - Metric parameters, when the first argument is an accountId
   * @param {string} [params.period] - Time period for metrics calculation. Options: '5min', '15min', '30min', '1hour', '24hour'
   * @param {string} [params.queueId] - Specific queue ID to filter metrics. If not provided, returns metrics for all queues
   * @param {string} [params.metricType] - Type of metrics to retrieve: 'queue', 'task', 'worker', or 'all' (default: 'all')
   * @param {number} [params.limit=100] - Maximum number of metric records to return (default: 100)
   * @returns {Promise<Object>} Object containing the requested metrics
   * @returns {Object} result.metrics - The metrics data organized by type
   * @returns {Object} [result.metrics.queue] - Queue-level metrics (if metricType is 'queue' or 'all')
   * @returns {number} result.metrics.queue.tasksWaiting - Number of tasks currently waiting in queue
   * @returns {number} result.metrics.queue.tasksAssigned - Number of tasks currently assigned to workers
   * @returns {number} result.metrics.queue.tasksConnected - Number of tasks currently connected/active
   * @returns {number} result.metrics.queue.avgWaitTime - Average wait time in seconds for tasks in this period
   * @returns {number} result.metrics.queue.longestWaitTime - Longest current wait time in seconds
   * @returns {Object} [result.metrics.task] - Task-level metrics (if metricType is 'task' or 'all')
   * @returns {number} result.metrics.task.created - Number of tasks created in this period
   * @returns {number} result.metrics.task.completed - Number of tasks completed in this period
   * @returns {number} result.metrics.task.abandoned - Number of tasks abandoned in this period
   * @returns {Object} [result.metrics.worker] - Worker-level metrics (if metricType is 'worker' or 'all')
   * @returns {number} result.metrics.worker.available - Number of workers currently available
   * @returns {number} result.metrics.worker.busy - Number of workers currently busy with tasks
   * @returns {number} result.metrics.worker.offline - Number of workers currently offline
   * @returns {string} result.period - The time period used for calculations
   * @returns {string} [result.queueId] - The queue ID if filtered to a specific queue
   *
   * @example
   * // Get all current metrics for all queues
   * const metrics = await sdk.taskRouter.metrics.getCurrent({
   *   period: '15min',
   *   metricType: 'all'
   * });
   * console.log(metrics.metrics.queue.tasksWaiting); // 5
   * console.log(metrics.metrics.worker.available); // 12
   *
   * @example
   * // Get queue-specific metrics for last 5 minutes
   * const queueMetrics = await sdk.taskRouter.metrics.getCurrent({
   *   period: '5min',
   *   queueId: 'queue456',
   *   metricType: 'queue',
   *   limit: 50
   * });
   * console.log(queueMetrics.metrics.queue.avgWaitTime); // 45.3
   *
   * @example
   * // Get worker metrics for last hour
   * const workerMetrics = await sdk.taskRouter.metrics.getCurrent({
   *   period: '1hour',
   *   metricType: 'worker'
   * });
   * console.log(workerMetrics.metrics.worker.available); // 8
   * console.log(workerMetrics.metrics.worker.busy); // 4
   *
   * @example
   * // Get task completion metrics for last 24 hours
   * const taskMetrics = await sdk.taskRouter.metrics.getCurrent({
   *   period: '24hour',
   *   metricType: 'task',
   *   limit: 200
   * });
   * console.log(taskMetrics.metrics.task.created); // 150
   * console.log(taskMetrics.metrics.task.completed); // 142
   */
  async getCurrent(paramsOrAccountId, maybeParams) {
    const isParamsFirst =
      paramsOrAccountId !== null && typeof paramsOrAccountId === 'object';
    const accountId = isParamsFirst ? undefined : paramsOrAccountId;
    const params = (isParamsFirst ? paramsOrAccountId : maybeParams) || {};
    const { period, queueId, metricType, limit = 100 } = params;

    this.sdk.validateParams(
      { period, queueId, metricType, limit },
      {
        period: { type: 'string', required: false },
        queueId: { type: 'string', required: false },
        metricType: { type: 'string', required: false },
        limit: { type: 'number', required: false },
      },
    );

    const query = { limit };

    if (accountId !== undefined) {
      query.accountId = accountId;
    }

    if (period !== undefined) {
      query.period = period;
    }

    if (queueId !== undefined) {
      query.queueId = queueId;
    }

    if (metricType !== undefined) {
      query.metricType = metricType;
    }

    const result = await internalRequest(this.sdk,
      '/taskRouter/metrics/current',
      'GET',
      { query },
    );
    return result;
  }

  /**
   * Get windowed queue/company metrics with a compare-window delta, per
   * queue + an 'all' rollup (avg wait, avg handle, service level, longest
   * wait, live depth/workers, and a waiting-count sparkline).
   *
   * @param {Object} params - Parameters
   * @param {string[]} [params.queueIds] - Queue ids to scope to. Omit/empty for all queues.
   * @param {string} params.from - ISO-8601 window start
   * @param {string} params.to - ISO-8601 window end
   * @param {string} params.compareFrom - ISO-8601 compare-window start
   * @param {string} params.compareTo - ISO-8601 compare-window end
   * @returns {Promise<Object>} result
   * @returns {Object} result.window - `{from, to}`
   * @returns {Object} result.compare - `{from, to}`
   * @returns {Object} result.all - Rollup across every scoped queue (avgWaitSec, avgHandleSec, serviceLevelPct, longestWaitSec, depth, workersAvailable, workersTotal, waitingSparkline, deltas)
   * @returns {Object} result.queues - Same shape as `result.all`, keyed by queueId
   *
   * @example
   * const { all, queues } = await sdk.taskRouter.metrics.getWindow({
   *   queueIds: ['q1', 'q2'],
   *   from: '2026-08-19T22:00:00Z',
   *   to: '2026-08-19T23:00:00Z',
   *   compareFrom: '2026-08-19T21:00:00Z',
   *   compareTo: '2026-08-19T22:00:00Z',
   * });
   * console.log(all.serviceLevelPct, all.deltas.serviceLevelPct);
   */
  async getWindow(params = {}) {
    const { queueIds, from, to, compareFrom, compareTo } = params;

    this.sdk.validateParams(
      { queueIds, from, to, compareFrom, compareTo },
      {
        queueIds: { type: 'array', required: false },
        from: { type: 'string', required: true },
        to: { type: 'string', required: true },
        compareFrom: { type: 'string', required: false },
        compareTo: { type: 'string', required: false },
      },
    );

    const query = { from, to };
    if (queueIds && queueIds.length) query.queueIds = queueIds.join(',');
    if (compareFrom) query.compareFrom = compareFrom;
    if (compareTo) query.compareTo = compareTo;

    const result = await internalRequest(this.sdk, 
      '/taskRouter/metrics/window',
      'GET',
      { query },
    );
    return result;
  }
}
