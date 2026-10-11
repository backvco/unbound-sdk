import { internalRequest } from '../base.js';

// Q2-style local helper (same as reporting.js/reportingCallLog.js -- no
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

// #3 analytics-expansion A1a (plan §4.9): missed-call -> callback funnel.
// Own file (not reporting.js) same as ReportingCallLogService -- keeps
// reporting.js under the repo's 400-line limit.
export class ReportingMissedCallsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * @param {Object} params - { from, to }
   * @returns {Promise<Object>} { missedCalls, voicemailsLeft, unmatchedAniCount,
   *   callbacksMatched, callbackRate, medianTimeToCallbackSec, windowHours,
   *   byQueue: [{ queueId, missedCalls, voicemailsLeft, callbacksMatched }],
   *   rows: [{ id, startTime, callerAni, peopleId, userId, queueId, queueName,
   *     hasVoicemail, callbackAt, callbackOutcome }] } -- `rows` is the
   *   most-recent 100 missed calls (review finding 1, A1a); callbackOutcome
   *   is one of "Called back after Xm" / "Awaiting callback" / "No callback".
   * @example
   * await sdk.reporting.missedCalls.summary({ from, to });
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
      `/reporting/missedCalls${queryString({ from, to })}`,
      'GET',
    );
  }
}
