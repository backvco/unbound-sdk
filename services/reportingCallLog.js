import { internalRequest } from '../base.js';

// Q2-style local helper (same as reporting.js/reportingAgents.js -- no
// shared util module between these files today).
function queryString(params = {}) {
  const parts = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    const v = Array.isArray(value) ? value.join(',') : value;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

// #14 analytics-expansion A0b: account-wide CDR browse. Own file (not
// reporting.js) same as ReportingAgentsService -- keeps reporting.js under
// the repo's 400-line limit.
export class ReportingCallLogService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * @param {Object} params - { from, to, direction?: 'inbound'|'outbound',
   *   answered?: boolean, queueIds?: string[], ringGroupIds?: string[],
   *   userIds?: string[], phoneNumber?: string, recordingOnly?: boolean,
   *   cursor?: string, limit?: number }
   * @returns {Promise<Object>} { rows, cursor, hasMore, summary: { totalCalls, answeredCalls, missedCalls, answeredPct, avgBillDurationSec } }
   * @example
   * await sdk.reporting.callLog.list({ from, to, direction: 'inbound' });
   */
  async list({
    from,
    to,
    direction,
    answered,
    queueIds,
    ringGroupIds,
    userIds,
    phoneNumber,
    recordingOnly,
    cursor,
    limit,
  } = {}) {
    this.sdk.validateParams(
      { from, to },
      {
        from: { type: 'string', required: true },
        to: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/reporting/callLog${queryString({
        from,
        to,
        direction,
        answered,
        queueIds,
        ringGroupIds,
        userIds,
        phoneNumber,
        recordingOnly,
        cursor,
        limit,
      })}`,
      'GET',
    );
  }

  /**
   * Same filters as list(), streams a CSV (forces HTTP transport).
   * @param {Object} params - same shape as list()
   * @returns {Promise<Object>} raw CSV response (transport-dependent)
   * @example
   * await sdk.reporting.callLog.export({ from, to });
   */
  async export({
    from,
    to,
    direction,
    answered,
    queueIds,
    ringGroupIds,
    userIds,
    phoneNumber,
    recordingOnly,
  } = {}) {
    this.sdk.validateParams(
      { from, to },
      {
        from: { type: 'string', required: true },
        to: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/reporting/callLog${queryString({
        from,
        to,
        direction,
        answered,
        queueIds,
        ringGroupIds,
        userIds,
        phoneNumber,
        recordingOnly,
        format: 'csv',
      })}`,
      'GET',
      { httpOnly: true },
    );
  }

  /**
   * Same filters as list() (no cursor/limit -- a series call always covers
   * the whole window), bucketed answered/missed/voicemail/total over time.
   * Bucket grain (hour vs day) and timezone are server-resolved, not
   * caller-chosen (an explicit `tz` overrides the account default).
   * @param {Object} params - { from, to, direction?: 'inbound'|'outbound',
   *   answered?: boolean, queueIds?: string[], ringGroupIds?: string[],
   *   userIds?: string[], phoneNumber?: string, recordingOnly?: boolean,
   *   tz?: string }
   * @returns {Promise<Object>} { bucket: 'hour'|'day', timezone, series: [{ start, end, answered, missed, voicemail, total }] }
   * @example
   * await sdk.reporting.callLog.series({ from, to });
   */
  async series({
    from,
    to,
    direction,
    answered,
    queueIds,
    ringGroupIds,
    userIds,
    phoneNumber,
    recordingOnly,
    tz,
  } = {}) {
    this.sdk.validateParams(
      { from, to },
      {
        from: { type: 'string', required: true },
        to: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/reporting/callLog/series${queryString({
        from,
        to,
        direction,
        answered,
        queueIds,
        ringGroupIds,
        userIds,
        phoneNumber,
        recordingOnly,
        tz,
      })}`,
      'GET',
    );
  }
}
