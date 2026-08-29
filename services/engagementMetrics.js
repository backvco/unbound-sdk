import { internalRequest } from '../base.js';
export class EngagementMetricsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Get engagement metrics with flexible filtering and configurable response options
   * @param {Object} options - Query options
   * @param {string[]} [options.queueIds] - Array of queue IDs to filter by
   * @param {string[]} [options.statuses] - Array of statuses to filter by (new, working, wrapUp, completed)
   * @param {string[]} [options.userIds] - Array of user IDs to filter by
   * @param {boolean} [options.includeSummary=true] - Include overall summary metrics
   * @param {boolean} [options.includeByQueue=true] - Include metrics grouped by queue and status
   * @param {boolean} [options.includeQueuePerformance=false] - Include queue performance metrics
   * @param {boolean} [options.includeAgentPerformance=false] - Include agent performance metrics
   * @returns {Promise<Object>} Metrics data
   */
  async getMetrics({
    queueIds = [],
    statuses = [],
    userIds = [],
    includeSummary = true,
    includeByQueue = true,
    includeQueuePerformance = false,
    includeAgentPerformance = false,
  } = {}) {
    this.sdk.validateParams(
      {
        queueIds,
        statuses,
        userIds,
        includeSummary,
        includeByQueue,
        includeQueuePerformance,
        includeAgentPerformance,
      },
      {
        queueIds: { type: 'array', required: false },
        statuses: { type: 'array', required: false },
        userIds: { type: 'array', required: false },
        includeSummary: { type: 'boolean', required: false },
        includeByQueue: { type: 'boolean', required: false },
        includeQueuePerformance: { type: 'boolean', required: false },
        includeAgentPerformance: { type: 'boolean', required: false },
      },
    );

    const params = {
      query: {
        queueIds: Array.isArray(queueIds) ? queueIds.join(',') : queueIds,
        statuses: Array.isArray(statuses) ? statuses.join(',') : statuses,
        userIds: Array.isArray(userIds) ? userIds.join(',') : userIds,
        includeSummary,
        includeByQueue,
        includeQueuePerformance,
        includeAgentPerformance,
      },
    };

    const result = await internalRequest(this.sdk, '/engagementMetrics/', 'GET', params);
    return result;
  }

  /**
   * Get basic engagement metrics summary
   * @param {Object} options - Filter options
   * @param {string[]} [options.queueIds] - Array of queue IDs to filter by
   * @param {string[]} [options.statuses] - Array of statuses to filter by
   * @returns {Promise<Object>} Summary metrics
   */
  async getSummary({ queueIds = [], statuses = [] } = {}) {
    return this.getMetrics({
      queueIds,
      statuses,
      includeSummary: true,
      includeByQueue: false,
      includeQueuePerformance: false,
      includeAgentPerformance: false,
    });
  }

  /**
   * Get metrics grouped by queue and status
   * @param {Object} options - Filter options
   * @param {string[]} [options.queueIds] - Array of queue IDs to filter by
   * @param {string[]} [options.statuses] - Array of statuses to filter by
   * @returns {Promise<Object>} Queue-grouped metrics
   */
  async getByQueue({ queueIds = [], statuses = [] } = {}) {
    return this.getMetrics({
      queueIds,
      statuses,
      includeSummary: false,
      includeByQueue: true,
      includeQueuePerformance: false,
      includeAgentPerformance: false,
    });
  }

  /**
   * Get queue performance metrics
   * @param {Object} options - Filter options
   * @param {string[]} [options.queueIds] - Array of queue IDs to filter by
   * @returns {Promise<Object>} Queue performance metrics
   */
  async getQueuePerformance({ queueIds = [] } = {}) {
    return this.getMetrics({
      queueIds,
      includeSummary: false,
      includeByQueue: false,
      includeQueuePerformance: true,
      includeAgentPerformance: false,
    });
  }

  /**
   * Get agent performance metrics
   * @param {Object} options - Filter options
   * @param {string[]} [options.queueIds] - Array of queue IDs to filter by
   * @param {string[]} [options.userIds] - Array of user IDs to filter by
   * @returns {Promise<Object>} Agent performance metrics
   */
  async getAgentPerformance({ queueIds = [], userIds = [] } = {}) {
    return this.getMetrics({
      queueIds,
      userIds,
      includeSummary: false,
      includeByQueue: false,
      includeQueuePerformance: false,
      includeAgentPerformance: true,
    });
  }

  /**
   * Get comprehensive metrics for dashboard
   * @param {Object} options - Filter options
   * @param {string[]} [options.queueIds] - Array of queue IDs to filter by
   * @param {string[]} [options.statuses] - Array of statuses to filter by
   * @param {string[]} [options.userIds] - Array of user IDs to filter by
   * @returns {Promise<Object>} All metrics
   */
  async getDashboardMetrics({
    queueIds = [],
    statuses = [],
    userIds = [],
  } = {}) {
    return this.getMetrics({
      queueIds,
      statuses,
      userIds,
      includeSummary: true,
      includeByQueue: true,
      includeQueuePerformance: true,
      includeAgentPerformance: true,
    });
  }
}
