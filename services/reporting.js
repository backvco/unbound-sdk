import { internalRequest } from '../base.js';
import { ReportingAgentsService } from './reportingAgents.js';
import { ReportingCallLogService } from './reportingCallLog.js';
import { ReportingMissedCallsService } from './reportingMissedCalls.js';
import { ReportingNumberHealthService } from './reportingNumberHealth.js';
import { ReportingBotContainmentService } from './reportingBotContainment.js';
import { ReportingCallQualityService } from './reportingCallQuality.js';
import { ReportingAiAdoptionService } from './reportingAiAdoption.js';
import { ReportingRingGroupsService } from './reportingRingGroups.js';
import { ReportingIvrMenusService } from './reportingIvrMenus.js';
import { ReportingConversationInsightsService } from './reportingConversationInsights.js';
import { ReportingSurveysService } from './reportingSurveys.js';
import { ReportingSalesService } from './reportingSales.js';
import { ReportingUsersService } from './reportingUsers.js';
import { ReportingViewsService } from './reportingViews.js';

// Q2: same queryString helper as reportingAgents.js (kept local -- no
// shared util module between the two files today).
function queryString(params = {}) {
  const parts = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    const v = Array.isArray(value) ? value.join(',') : value;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

// F7 (cc-reporting-foundation-plan.md §8) -- reporting API surface.
export class ReportingService {
  constructor(sdk) {
    this.sdk = sdk;
    // Saved views + their email schedules -- own file/class (ReportingViewsService)
    // to keep this file under the repo's 400-line limit.
    const viewsService = new ReportingViewsService(sdk);
    this.views = viewsService.views;
    this.schedules = viewsService.schedules;
    // Each namespace below is its own file/class to keep this file under
    // the repo's 400-line limit (house convention, see .agents below).
    // P3 (agent-reporting-plan.md §7 + §8.1): thin presets over the registry above -- /reporting/agents/*.
    this.agents = new ReportingAgentsService(sdk);
    // #14 analytics-expansion A0b: account-wide CDR browse.
    this.callLog = new ReportingCallLogService(sdk);
    // A1b #11 (per-report-detail.md #11): dedicated endpoint, NOT a generic
    // metric -- kept as a small namespace (not its own file) since it's one
    // method.
    this.licenses = {
      utilization: (...args) => this.seatUtilization(...args),
    };
    // #3 analytics-expansion A1a (§4.9): missed-call -> callback funnel.
    this.missedCalls = new ReportingMissedCallsService(sdk);
    // analytics-expansion A1a (§4.6): number/10DLC connect-rate health.
    this.numberHealth = new ReportingNumberHealthService(sdk);
    // analytics-expansion D14/§4.13 (r17-r22): bot containment dedicated endpoint.
    this.botContainment = new ReportingBotContainmentService(sdk);
    // #2 analytics-expansion B0 (§4.1): voice MOS/jitter/loss.
    this.callQuality = new ReportingCallQualityService(sdk);
    // Work Package E analytics-expansion (§4.12): customer-facing AI feature adoption summarization.
    this.aiAdoption = new ReportingAiAdoptionService(sdk);
    // #1a analytics-expansion A2 (per-report-detail.md #1a): ring group volume/answered/handle + per-member offers.
    this.ringGroups = new ReportingRingGroupsService(sdk);
    // #1b analytics-expansion A2 (per-report-detail.md #1b): account-wide IVR/voice-workflow-menu analytics.
    this.ivrMenus = new ReportingIvrMenusService(sdk);
    // #13 analytics-expansion B1 (per-report-detail.md #13, atlas §C.2): tracked phrases + talk ratio, admin tracker/topic CRUD.
    this.conversationInsights = new ReportingConversationInsightsService(sdk);
    // Work Package B2 analytics-expansion (§4.4, security.md "Surveys / NPS" row): survey/NPS summary.
    this.surveys = new ReportingSurveysService(sdk);
    // Work Package C analytics-expansion (§4.5, §7 C row): Rep activity-to-revenue + Pipeline/deal-risk.
    this.sales = new ReportingSalesService(sdk);
    // analytics-expansion live-testing fix: report-scoped users list
    // beyond team members (Call log's Users filter) -- own file to keep
    // this file under the 400-line limit.
    this.users = new ReportingUsersService(sdk);
  }

  /**
   * Metrics + dimensions catalogue.
   * @returns {Promise<Object>} { metrics: [...], dimensions: [...] }
   * @example
   * const { metrics } = await sdk.reporting.definitions();
   */
  async definitions() {
    return internalRequest(this.sdk, '/reporting/definitions', 'GET');
  }

  /**
   * Run a report over the reporting rollups (+ today stitch).
   * @param {Object} body - { metrics, dimensions, filters, from, to, grain, tz, continuous, range }
   *   `range: { preset }` (analytics-expansion live-testing fix, NL Ask v1)
   *   is an ALTERNATIVE to from/to -- the api resolves the concrete dates
   *   itself, in the account timezone, and that resolution WINS over any
   *   from/to also sent. Presets: today, yesterday, last7d, last30d,
   *   thisWeek, lastWeek, thisMonth, lastMonth.
   * @returns {Promise<Object>} { columns, rows, definitions, meta } --
   *   meta now also carries the RESOLVED { from, to, preset } the query
   *   actually ran against (preset is null when no `range` was sent).
   * @example
   * await sdk.reporting.query({ metrics: ['handled','slPct'], dimensions: ['queue','time'], from, to, grain: 'day' });
   * await sdk.reporting.query({ metrics: ['handled'], range: { preset: 'lastWeek' } });
   */
  async query(body) {
    const hasRange = body?.range && typeof body.range === 'object';
    this.sdk.validateParams(
      { metrics: body?.metrics, from: body?.from, to: body?.to },
      {
        metrics: { type: 'array', required: true },
        from: { type: 'string', required: !hasRange },
        to: { type: 'string', required: !hasRange },
      },
    );
    return internalRequest(this.sdk, '/reporting/query', 'POST', { body });
  }

  /**
   * Same as query(), but streams a CSV (forces HTTP transport).
   * @param {Object} body
   * @returns {Promise<Object>} raw CSV response (transport-dependent)
   * @example
   * await sdk.reporting.csv({ metrics: ['handled'], dimensions: ['queue'], from, to });
   */
  async csv(body) {
    return internalRequest(this.sdk, '/reporting/query?format=csv', 'POST', { body, httpOnly: true });
  }

  /**
   * Drilldown: the raw records underlying one metric cell.
   * @param {Object} body - { metric, cell: { dimensions, bucketFrom, bucketTo }, cursor, limit }
   * @returns {Promise<Object>} { rows, cursor, hasMore }
   * @example
   * await sdk.reporting.detail({ metric: 'handled', cell: { dimensions: { queueId }, bucketFrom, bucketTo } });
   */
  async detail(body) {
    this.sdk.validateParams(
      { metric: body?.metric },
      { metric: { type: 'string', required: true } },
    );
    return internalRequest(this.sdk, '/reporting/detail', 'POST', { body });
  }

  /**
   * Q2 preset: disposition matrix (code x queue|agent|code), incl. a
   * noDisposition count for groupBy=queue|code.
   * @param {Object} params - { from, to, queueIds, userIds, groupBy: 'queue'|'agent'|'code' }
   * @returns {Promise<Object>} { groupBy, columns, rows, noDisposition, meta }
   * @example
   * await sdk.reporting.dispositions({ from, to, groupBy: 'queue' });
   */
  async dispositions({ from, to, queueIds, userIds, groupBy } = {}) {
    this.sdk.validateParams(
      { from, to },
      { from: { type: 'string', required: true }, to: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/reporting/dispositions${queryString({ from, to, queueIds, userIds, groupBy })}`,
      'GET',
    );
  }

  /**
   * Q2 preset: exec summary (originating-tasks-only KPI tiles + channel mix
   * + trend), with a server-computed delta vs the previous period.
   * @param {Object} params - { from, to, compareTo: 'previous' }
   * @returns {Promise<Object>} { kpis, channelMix, trend, fcr, previousPeriod }
   * @example
   * await sdk.reporting.execSummary({ from, to, compareTo: 'previous' });
   */
  async execSummary({ from, to, compareTo } = {}) {
    this.sdk.validateParams(
      { from, to },
      { from: { type: 'string', required: true }, to: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/reporting/execSummary${queryString({ from, to, compareTo })}`,
      'GET',
    );
  }

  /**
   * Q2 preset: first-contact-resolution / repeat-contact count over
   * accounts.fcrWindowHours.
   * @param {Object} params - { from, to, queueIds }
   * @returns {Promise<Object>} { windowHours, repeatContacts, originatingHandled, fcrPct }
   * @example
   * await sdk.reporting.fcr({ from, to });
   */
  async fcr({ from, to, queueIds } = {}) {
    this.sdk.validateParams(
      { from, to },
      { from: { type: 'string', required: true }, to: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/reporting/fcr${queryString({ from, to, queueIds })}`,
      'GET',
    );
  }

  /**
   * A1b #11: idle-seat snapshot (userLicenses joined to last-activity
   * signals) -- gated on the EXISTING admin:license:manage scope, no new
   * scope (security.md §B.1).
   * @param {Object} params - { licenseTypeCode? }
   * @returns {Promise<Object>} { generatedAt, licenseTypes: [{code,label,audience,seatCount,used,needsSeat}], seats: [{userId,userName,isRemoved,licenseTypeCode,licenseLabel,source,assignedAt,lastActiveAt,idleDays,seatCostEstimate}] }
   * @example
   * await sdk.reporting.licenses.utilization({ licenseTypeCode: 'license.support' });
   */
  async seatUtilization({ licenseTypeCode } = {}) {
    return internalRequest(
      this.sdk,
      `/reporting/seatUtilization${queryString({ licenseTypeCode })}`,
      'GET',
    );
  }

  /**
   * Rollup health: last computed bucket, lag, missing buckets.
   * @returns {Promise<Object>}
   * @example
   * const { lagSeconds } = await sdk.reporting.health();
   */
  async health() {
    return internalRequest(this.sdk, '/reporting/health', 'GET');
  }
}
