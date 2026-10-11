import { internalRequest } from '../base.js';

// Q2-style local helper (same as reporting.js/reportingMissedCalls.js --
// no shared util module between these files today).
function queryString(params = {}) {
  const parts = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    const v = Array.isArray(value) ? value.join(',') : value;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

// #2 analytics-expansion B0 (plan §4.1, voice-quality.md): voice MOS /
// jitter / loss. Own file (not reporting.js) same as
// ReportingMissedCallsService -- keeps reporting.js under the repo's
// 400-line limit. Scope: reporting:callQuality:read, family task_router.
export class ReportingCallQualityService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * @param {Object} params - { from, to }
   * @returns {Promise<Object>} { totalCalls, measuredCalls, avgMos,
   *   pctBelowThreshold, lowMosThreshold, worstCalls: [{ callId, cdrId,
   *   legSide, avgMos, avgJitterMs, avgRttMs, packetLossPct, codec,
   *   queueId, startTime }], trend: [{ date, avgMos }] }
   * @example
   * await sdk.reporting.callQuality.summary({ from, to });
   */
  async summary({ from, to } = {}) {
    this.sdk.validateParams(
      { from, to },
      {
        from: { type: 'string', required: true },
        to: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/reporting/callQuality${queryString({ from, to })}`,
      'GET',
    );
  }
}
