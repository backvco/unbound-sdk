import { internalRequest } from '../base.js';

// Local helper, same as reporting.js / reportingSurveys.js (no shared util
// module between these files today).
function queryString(params = {}) {
  const parts = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    const v = Array.isArray(value) ? value.join(',') : value;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

const RANGE_RULES = {
  from: { type: 'string', required: true },
  to: { type: 'string', required: true },
};

// marketing-reports-plan.md §5/§6 -- Marketing reports family
// (GET /reporting/marketing/*). Own file to keep reporting.js under the
// repo's 400-line limit. Scope: reporting:marketing:read, family
// task_router (on the Standard User allow list like reporting:surveys:read).
// Every method takes ISO `from`/`to` plus optional `timeZone` and the
// website filters (country, utmSource, utmMedium, utmCampaign, landingPage,
// page, device). List and summary responses never contain raw IPs.
// visitorDetail is the exception: the visitor-details modal.
export class ReportingMarketingService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  _get(path, params) {
    const { from, to } = params;
    this.sdk.validateParams({ from, to }, RANGE_RULES);
    return internalRequest(
      this.sdk,
      `/reporting/marketing/${path}${queryString(params)}`,
      'GET',
    );
  }

  /**
   * Website traffic summary (web-snippet sessions only).
   * @returns {Promise<Object>} { kpis, series, topPages, landingPages,
   *   referrers, utm, devices, browsers }
   * @example
   * await sdk.reporting.marketing.website({ from, to, timeZone, country: 'US' });
   */
  async website(params = {}) {
    return this._get('website', params);
  }

  /**
   * Sessions by country; cities included when `country` is set.
   * @returns {Promise<Object>} { countries: [{ code, sessions, visitors, formFills }], cities: [...] }
   */
  async websiteGeo(params = {}) {
    return this._get('website/geo', params);
  }

  /**
   * Paged session drill list.
   * @param {Object} params - range + filters + { cursor, limit }
   * @returns {Promise<Object>} { rows, nextCursor }
   */
  async websiteSessions(params = {}) {
    return this._get('website/sessions', params);
  }

  /**
   * One visitor in the report range: identity, each session (IP, provider,
   * geo), and the events under those sessions.
   * @param {Object} params - { from, to, visitor, timeZone? }
   * @returns {Promise<Object>} { visitorKey, person, company, sessions, truncated }
   */
  async visitorDetail(params = {}) {
    return this._get('website/visitors', params);
  }

  /**
   * Ordered event timeline for one session.
   * @returns {Promise<Object>} { events: [{ at, eventType, url, title, durationSec }] }
   */
  async sessionEvents(sessionId) {
    this.sdk.validateParams(
      { sessionId },
      { sessionId: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/reporting/marketing/website/sessions/${encodeURIComponent(sessionId)}/events`,
      'GET',
    );
  }

  /**
   * Form fills summary (status buckets, by form / source page / UTM, countries).
   * @param {Object} params - range + { formId }
   */
  async forms(params = {}) {
    return this._get('forms', params);
  }

  /**
   * Paged form submissions drill list.
   * @param {Object} params - range + { formId, cursor, limit }
   * @returns {Promise<Object>} { rows, nextCursor }
   */
  async formSubmissions(params = {}) {
    return this._get('forms/submissions', params);
  }

  /**
   * First/last-touch attribution by dimension.
   * @param {Object} params - range + { model: 'first'|'last', dimension: 'source'|'medium'|'campaign'|'landingPage' }
   * @returns {Promise<Object>} { model, dimension, kpis, rows }
   */
  async attribution(params = {}) {
    return this._get('attribution', params);
  }

  /**
   * Lead scoring summary (histogram, rules, trend, top people).
   */
  async scoring(params = {}) {
    return this._get('scoring', params);
  }

  /**
   * Email & SMS engagement per journey (send-day cohort); steps when `journeyId` is set.
   * @param {Object} params - range + { journeyId }
   */
  async engagement(params = {}) {
    return this._get('engagement', params);
  }
}
