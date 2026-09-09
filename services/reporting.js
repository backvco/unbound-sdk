import { internalRequest } from '../base.js';
import { ReportingAgentsService } from './reportingAgents.js';

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
    this.views = {
      list: (...args) => this.listViews(...args),
      create: (...args) => this.createView(...args),
      update: (...args) => this.updateView(...args),
      remove: (...args) => this.removeView(...args),
    };
    this.schedules = {
      create: (...args) => this.createSchedule(...args),
      list: (...args) => this.listSchedules(...args),
      remove: (...args) => this.removeSchedule(...args),
      runs: (...args) => this.listScheduleRuns(...args),
    };
    // P3 (agent-reporting-plan.md §7 + §8.1): thin presets over the same
    // registry above -- /reporting/agents/*. Split into its own file/class
    // (house 400-line limit) since this file was already at 215 lines.
    this.agents = new ReportingAgentsService(sdk);
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
   * @param {Object} body - { metrics, dimensions, filters, from, to, grain, tz, continuous }
   * @returns {Promise<Object>} { columns, rows, definitions, meta }
   * @example
   * await sdk.reporting.query({ metrics: ['handled','slPct'], dimensions: ['queue','time'], from, to, grain: 'day' });
   */
  async query(body) {
    this.sdk.validateParams(
      { metrics: body?.metrics, from: body?.from, to: body?.to },
      {
        metrics: { type: 'array', required: true },
        from: { type: 'string', required: true },
        to: { type: 'string', required: true },
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
   * Rollup health: last computed bucket, lag, missing buckets.
   * @returns {Promise<Object>}
   * @example
   * const { lagSeconds } = await sdk.reporting.health();
   */
  async health() {
    return internalRequest(this.sdk, '/reporting/health', 'GET');
  }

  /**
   * @returns {Promise<Object>} { results: [...] }
   * @example
   * const { results } = await sdk.reporting.views.list();
   */
  async listViews() {
    return internalRequest(this.sdk, '/reporting/views', 'GET');
  }

  /**
   * @param {Object} view - { name, query, isShared }
   * @returns {Promise<Object>} created view
   * @example
   * await sdk.reporting.views.create({ name: 'Daily SL', query: {...} });
   */
  async createView({ name, query, isShared } = {}) {
    this.sdk.validateParams(
      { name, query },
      { name: { type: 'string', required: true }, query: { type: 'object', required: true } },
    );
    const body = { name, query };
    if (isShared !== undefined) body.isShared = isShared;
    return internalRequest(this.sdk, '/reporting/views', 'POST', { body });
  }

  /**
   * @param {string} id
   * @param {Object} data - { name, query, isShared }
   * @returns {Promise<Object>} updated view
   * @example
   * await sdk.reporting.views.update('263...', { isShared: true });
   */
  async updateView(id, data) {
    id = String(id);
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/reporting/views/${id}`, 'PUT', { body: data });
  }

  /**
   * @param {string} id
   * @returns {Promise<Object>} { id, deleted: true }
   * @example
   * await sdk.reporting.views.remove('263...');
   */
  async removeView(id) {
    id = String(id);
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/reporting/views/${id}`, 'DELETE');
  }

  /**
   * @param {string} viewId
   * @param {Object} schedule - { cron, timezone, recipients, format, runAs, isEnabled }
   * @returns {Promise<Object>} created schedule
   * @example
   * await sdk.reporting.schedules.create('263...', { cron: '0 8 * * MON', timezone: 'America/Denver', recipients: ['a@b.com'] });
   */
  async createSchedule(viewId, { cron, timezone, recipients, format, runAs, isEnabled } = {}) {
    viewId = String(viewId);
    this.sdk.validateParams(
      { viewId, cron, timezone, recipients },
      {
        viewId: { type: 'string', required: true },
        cron: { type: 'string', required: true },
        timezone: { type: 'string', required: true },
        recipients: { type: 'array', required: true },
      },
    );
    const body = { cron, timezone, recipients };
    if (format !== undefined) body.format = format;
    if (runAs !== undefined) body.runAs = runAs;
    if (isEnabled !== undefined) body.isEnabled = isEnabled;
    return internalRequest(this.sdk, `/reporting/views/${viewId}/schedule`, 'POST', { body });
  }

  /**
   * @param {string} viewId
   * @returns {Promise<Object>} { results: [...] }
   * @example
   * await sdk.reporting.schedules.list('263...');
   */
  async listSchedules(viewId) {
    viewId = String(viewId);
    this.sdk.validateParams({ viewId }, { viewId: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/reporting/views/${viewId}/schedule`, 'GET');
  }

  /**
   * @param {string} viewId
   * @param {string} scheduleId
   * @returns {Promise<Object>} { id, deleted: true }
   * @example
   * await sdk.reporting.schedules.remove('263...', '264...');
   */
  async removeSchedule(viewId, scheduleId) {
    viewId = String(viewId);
    scheduleId = String(scheduleId);
    this.sdk.validateParams(
      { viewId, scheduleId },
      { viewId: { type: 'string', required: true }, scheduleId: { type: 'string', required: true } },
    );
    return internalRequest(this.sdk, `/reporting/views/${viewId}/schedule/${scheduleId}`, 'DELETE');
  }

  /**
   * @returns {Promise<Array>} schedule runs (status, startedAt, finishedAt, error, attempt)
   * @example
   * await sdk.reporting.schedules.runs('263...', '264...');
   */
  async listScheduleRuns(viewId, scheduleId) {
    viewId = String(viewId);
    scheduleId = String(scheduleId);
    this.sdk.validateParams(
      { viewId, scheduleId },
      { viewId: { type: 'string', required: true }, scheduleId: { type: 'string', required: true } },
    );
    return internalRequest(this.sdk, `/reporting/views/${viewId}/schedule/${scheduleId}/runs`, 'GET');
  }
}
