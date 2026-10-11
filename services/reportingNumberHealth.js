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

// analytics-expansion A1a (plan §4.6): number connect-rate, merged with
// existing 10DLC campaign status by phone number. Own file (not
// reporting.js) same as ReportingCallLogService -- keeps reporting.js
// under the repo's 400-line limit.
export class ReportingNumberHealthService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * @param {Object} params - { from, to }
   * @returns {Promise<Object>} { rows: [{ phoneNumber, name, offered, answered,
   *   connectRate, tenDlc: { campaignId, campaignName, campaignStatus,
   *   linkingStatus } | null }] }
   * @example
   * await sdk.reporting.numberHealth.connectRate({ from, to });
   */
  async connectRate({ from, to } = {}) {
    this.sdk.validateParams(
      { from, to },
      {
        from: { type: 'string', required: true },
        to: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/reporting/numberHealth${queryString({ from, to })}`,
      'GET',
    );
  }
}
