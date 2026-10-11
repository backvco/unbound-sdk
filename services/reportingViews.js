import { internalRequest } from '../base.js';

// F7 (cc-reporting-foundation-plan.md §8) -- saved views + their email
// schedules. Own file (not reporting.js) -- keeps reporting.js under the
// repo's 400-line limit.
export class ReportingViewsService {
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
      update: (...args) => this.updateSchedule(...args),
      remove: (...args) => this.removeSchedule(...args),
      runs: (...args) => this.listScheduleRuns(...args),
      runNow: (...args) => this.runScheduleNow(...args),
    };
  }

  /**
   * @param {Object} [params] - { reportKey?: string } -- analytics-expansion
   *   A0b: omit for Explore views only (unchanged default); pass
   *   'callLog' for that report's saved views instead.
   * @returns {Promise<Object>} { results: [...] }
   * @example
   * const { results } = await sdk.reporting.views.list();
   * const { results } = await sdk.reporting.views.list({ reportKey: 'callLog' });
   */
  async listViews({ reportKey } = {}) {
    const parts = [];
    if (reportKey) parts.push(`reportKey=${encodeURIComponent(reportKey)}`);
    const qs = parts.length ? `?${parts.join('&')}` : '';
    return internalRequest(this.sdk, `/reporting/views${qs}`, 'GET');
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
   * @param {Object} data - partial { cron, timezone, recipients, format, isEnabled }
   * @returns {Promise<Object>} updated schedule
   * @example
   * await sdk.reporting.schedules.update('263...', '264...', { isEnabled: false });
   */
  async updateSchedule(viewId, scheduleId, data = {}) {
    viewId = String(viewId);
    scheduleId = String(scheduleId);
    this.sdk.validateParams(
      { viewId, scheduleId },
      { viewId: { type: 'string', required: true }, scheduleId: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/reporting/views/${viewId}/schedule/${scheduleId}`,
      'PUT',
      { body: data },
    );
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

  /**
   * Manual trigger -- runs the same delivery path as the cron tick, awaits
   * sent/failed instead of just queuing.
   * @param {string} viewId
   * @param {string} scheduleId
   * @returns {Promise<Object>} { id, status, attempt, error? }
   * @example
   * await sdk.reporting.schedules.runNow('263...', '264...');
   */
  async runScheduleNow(viewId, scheduleId) {
    viewId = String(viewId);
    scheduleId = String(scheduleId);
    this.sdk.validateParams(
      { viewId, scheduleId },
      { viewId: { type: 'string', required: true }, scheduleId: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/reporting/views/${viewId}/schedule/${scheduleId}/run-now`,
      'POST',
    );
  }
}
