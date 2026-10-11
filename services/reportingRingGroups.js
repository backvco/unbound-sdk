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

// #1a analytics-expansion A2 (per-report-detail.md #1a): ring group
// volume/answered/handle + per-member offers + hour-of-day heatmap. Own
// file (not reporting.js) same as ReportingMissedCallsService -- keeps
// reporting.js under the repo's 400-line limit. Scope:
// admin:ringgroup:manage, family ringGroups.
export class ReportingRingGroupsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Account-wide ring group summary.
   * @param {Object} params - { from, to }
   * @returns {Promise<Object>} { ringGroups: [{ ringGroupId, ringGroupName,
   *   offered, answered, abandonRate, avgHandle }], trend: { days: string[],
   *   offered: number[], answered: number[], prevOffered: number[] } }
   *   (trend is account-wide across all ring groups -- days/offered/answered
   *   are the current window bucketed daily, prevOffered is the equal-length
   *   PRIOR window's offered count, index-aligned with `days` by day-of-
   *   window position, not matching calendar dates -- the ghost compare line)
   * @example
   * await sdk.reporting.ringGroups.summary({ from, to });
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
      `/reporting/ringGroups${queryString({ from, to })}`,
      'GET',
    );
  }

  /**
   * Per-ring-group drill: hour-of-day heatmap + per-member offer counts.
   * @param {Object} params - { ringGroupId, from, to }
   * @returns {Promise<Object>} { ringGroupId, hourHeatmap: [{ hour, offered,
   *   answered }], members: [{ memberId, memberName, offered, answered }] }
   * @example
   * await sdk.reporting.ringGroups.drill({ ringGroupId, from, to });
   */
  async drill({ ringGroupId, from, to } = {}) {
    this.sdk.validateParams(
      { ringGroupId, from, to },
      {
        ringGroupId: { type: 'string', required: true },
        from: { type: 'string', required: true },
        to: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/reporting/ringGroups${queryString({ ringGroupId, from, to })}`,
      'GET',
    );
  }
}
