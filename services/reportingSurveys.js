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

// Work Package B2 analytics-expansion (plan §4.4, security.md "Surveys /
// NPS" row): Surveys / NPS beyond CSAT. Own file (not reporting.js) same
// as ReportingCallQualityService -- keeps reporting.js under the repo's
// 400-line limit. Scope: reporting:surveys:read, family task_router.
// Recordtype-scoped read (security.md §B.4) -- a caller with zero grants
// gets zero rows back, not every row.
export class ReportingSurveysService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * @param {Object} params - { from, to }
   * @returns {Promise<Object>} { totalResponses, npsResponseCount, nps,
   *   promoterPct, detractorPct, csatResponseCount, avgCsatScore,
   *   trend: [{ date, nps }] }
   * @example
   * await sdk.reporting.surveys.summary({ from, to });
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
      `/reporting/surveys${queryString({ from, to })}`,
      'GET',
    );
  }
}
