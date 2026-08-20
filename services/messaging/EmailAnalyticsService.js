import { internalRequest } from '../../base.js';
export class EmailAnalyticsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Get email queue time series analytics
   * @param {Object} [params] - Analytics parameters
   * @param {string} [params.period='24h'] - Time period: '1h', '6h', '24h', '7d', '30d'
   * @param {string} [params.granularity='hour'] - Data granularity: 'minute', 'hour', 'day'
   * @param {string} [params.timezone='UTC'] - Timezone for data grouping (e.g., 'America/New_York', 'UTC')
   * @returns {Promise<Object>} Time series data with summary statistics
   * @example
   * // Get hourly analytics for last 24 hours in EST
   * const analytics = await sdk.messaging.email.analytics.timeSeries({
   *   period: '24h',
   *   granularity: 'hour',
   *   timezone: 'America/New_York'
   * });
   * // Returns: { period, granularity, timezone, data: [{ timestamp, sent, delivered, failed, queued }], summary }
   */
  async timeSeries({ period, granularity, timezone } = {}) {
    const options = { query: {} };
    if (period) options.query.period = period;
    if (granularity) options.query.granularity = granularity;
    if (timezone) options.query.timezone = timezone;

    const result = await internalRequest(this.sdk, 
      '/messaging/email/analytics/timeseries',
      'GET',
      options,
    );
    return result;
  }

  /**
   * Get email queue summary statistics including engagement metrics
   * @param {Object} [params] - Summary parameters
   * @param {string} [params.period='24h'] - Time period: '1h', '6h', '24h', '7d', '30d'
   * @param {string} [params.timezone='UTC'] - Timezone for data calculation (e.g., 'America/New_York', 'UTC')
   * @returns {Promise<Object>} Summary statistics with engagement metrics
   * @example
   * // Get comprehensive summary stats for last 24 hours in PST
   * const summary = await sdk.messaging.email.analytics.summary({
   *   period: '24h',
   *   timezone: 'America/Los_Angeles'
   * });
   * // Returns: {
   * //   totalSent, totalDelivered, totalFailed, totalQueued,
   * //   deliveryRate, errorRate, avgProcessingSeconds, avgEmailsPerHour, avgEmailsPerMinute,
   * //   totalReceived, avgReceivedPerHour, avgReceivedPerMinute,
   * //   totalOpened, totalOpenEvents, openRate,
   * //   totalClicked, totalClickEvents, clickRate,
   * //   totalBounced, totalBounceEvents, bounceRate,
   * //   totalComplained, totalComplaintEvents, complaintRate,
   * //   outboundErrors: [{ id, errorMessage, toEmail, createdAt }]
   * // }
   */
  async summary({ period, timezone } = {}) {
    const options = { query: {} };
    if (period) options.query.period = period;
    if (timezone) options.query.timezone = timezone;

    const result = await internalRequest(this.sdk, 
      '/messaging/email/analytics/summary',
      'GET',
      options,
    );
    return result;
  }

  /**
   * Get real-time email queue metrics
   * @returns {Promise<Object>} Real-time queue statistics
   * @example
   * // Get current queue status
   * const realtime = await sdk.messaging.email.analytics.realtime();
   * // Returns: { queueDepth, currentSendRatePerMinute, last5Minutes: { sent, delivered, failed } }
   */
  async realtime() {
    const result = await internalRequest(this.sdk, 
      '/messaging/email/analytics/realtime',
      'GET',
    );
    return result;
  }

  /**
   * Get email error analysis by domain
   * @param {Object} [params] - Error analysis parameters
   * @param {string} [params.period='7d'] - Time period: '24h', '7d', '30d'
   * @returns {Promise<Object>} Error analysis with domain breakdown
   * @example
   * // Get error analysis for last 7 days
   * const errors = await sdk.messaging.email.analytics.errors({ period: '7d' });
   * // Returns: { overallErrorRate, topErrorDomains: [{ domain, errorRate, totalErrors }] }
   */
  async errors({ period } = {}) {
    const options = { query: {} };
    if (period) options.query.period = period;

    const result = await internalRequest(this.sdk, 
      '/messaging/email/analytics/errors',
      'GET',
      options,
    );
    return result;
  }
}
