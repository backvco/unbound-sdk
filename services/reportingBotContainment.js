import { internalRequest } from '../base.js';

// Q2-style local helper (same as reporting.js/reportingMissedCalls.js -- no
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

// analytics-expansion D14/§4.13 (r17-r22 dedicated-endpoint design): bot
// containment. Own file (not reporting.js) same as ReportingMissedCallsService
// -- keeps reporting.js under the repo's 400-line limit.
export class ReportingBotContainmentService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * @param {Object} params
   * @param {string} params.from - inclusive ISO start.
   * @param {string} params.to - EXCLUSIVE ISO end.
   * @param {'queue'|'agent'} [params.groupBy='queue']
   * @param {string[]} [params.queueIds] - request-level filter (independent
   *   of the caller's own visibility scope).
   * @param {string[]} [params.userIds] - request-level filter, same shape.
   * @returns {Promise<Object>} { groupBy, rows: [{ queueId|userId,
   *   botContained, botEscalatedHuman, botCallerAbandoned, botFailed,
   *   containmentRate }] } -- containmentRate is null (not 0) when a row's
   *   four counts are all 0.
   * @example
   * await sdk.reporting.botContainment.summary({ from, to, groupBy: 'agent' });
   */
  async summary({ from, to, groupBy, queueIds, userIds } = {}) {
    this.sdk.validateParams(
      { from, to, groupBy, queueIds, userIds },
      {
        from: { type: 'string', required: true },
        to: { type: 'string', required: true },
        groupBy: { type: 'string', required: false },
        queueIds: { type: 'array', required: false },
        userIds: { type: 'array', required: false },
      },
    );
    return internalRequest(
      this.sdk,
      `/reporting/botContainment${queryString({ from, to, groupBy, queueIds, userIds })}`,
      'GET',
    );
  }
}
