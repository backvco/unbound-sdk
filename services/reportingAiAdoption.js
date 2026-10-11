import { internalRequest } from '../base.js';

// Q2-style local helper (same as reporting.js/reportingCallQuality.js --
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

// Work Package E analytics-expansion (plan §4.12, security.md "AI
// feature adoption" row): customer-facing AI usage summarization. Own
// file (not reporting.js) same as ReportingCallQualityService -- keeps
// reporting.js under the repo's 400-line limit. Scope:
// reporting:aiAdoption:read, family task_router. Account-scoped counts
// only -- the response never carries cost/pricing, provider, or model.
export class ReportingAiAdoptionService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * @param {Object} params - { from, to } -- 'YYYY-MM-DD', inclusive,
   *   92 days max.
   * @returns {Promise<Object>} { totals: { turns, requests, anyBotUsage },
   *   trend: [{ date, turns, requests }],
   *   byFeature: [{ category, feature, turns, requests, distinctUsers }] }
   * @example
   * await sdk.reporting.aiAdoption.summary({ from, to });
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
      `/reporting/aiAdoption${queryString({ from, to })}`,
      'GET',
    );
  }
}
