import { internalRequest } from '../../base.js';

function pickDefined(fields) {
  const body = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) body[key] = value;
  }
  return body;
}

/**
 * Journey member surface -- `sdk.journeys.members.*`. Custom non-CRUD
 * endpoints (member grid, enrol, bulk actions, fix, events) mounted at
 * `/journeys/:id/members*`; NOT generic-object CRUD (journeyMembers is
 * registered isCreateable=0/isEditable=0 -- reads via `sdk.objects.query`
 * for grids/filters are fine, writes only through these methods).
 *
 * @see app1-api src/services/journeys/routes.js
 */
export class JourneyMembersService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Server-paged member grid for one journey.
   * @param {string} journeyId
   * @param {Object} [opts]
   * @param {number} [opts.page]
   * @param {number} [opts.pageSize]
   * @param {string} [opts.sort]
   * @param {string} [opts.sortDir]
   * @param {string[]} [opts.status]
   * @param {string} [opts.stepKey]
   * @param {string} [opts.ownerUserId]
   * @param {string} [opts.statusReason]
   * @param {string} [opts.search]
   * @returns {Promise<Object>} Paged member rows
   */
  async list(journeyId, opts = {}) {
    this.sdk.validateParams(
      { journeyId },
      { journeyId: { type: 'string', required: true } },
    );
    const { status, ...rest } = opts;
    const query = pickDefined({
      ...rest,
      status: Array.isArray(status) ? status.join(',') : status,
    });
    return await internalRequest(
      this.sdk,
      `/journeys/${journeyId}/members`,
      'GET',
      { query },
    );
  }

  /**
   * URL for the CSV export of the members grid (P6) — same filter / sort
   * params as `list`. The browser downloads it directly (cookie auth); Node
   * callers fetch it with their own token.
   *
   * @param {string} journeyId
   * @param {Object} [opts] same keys as `list` (status, stepKey, ownerUserId, statusReason, search, sort, sortDir)
   * @returns {string} absolute URL
   */
  exportCsvUrl(journeyId, opts = {}) {
    this.sdk.validateParams(
      { journeyId },
      { journeyId: { type: 'string', required: true } },
    );
    const { status, ...rest } = opts;
    const query = pickDefined({
      ...rest,
      status: Array.isArray(status) ? status.join(',') : status,
    });
    const qs = new URLSearchParams(query).toString();
    return `${this.sdk.baseURL}/journeys/${journeyId}/members/export.csv${qs ? `?${qs}` : ''}`;
  }

  /**
   * @param {string} journeyId
   * @param {string} memberId
   * @returns {Promise<Object>} Single member row
   */
  async get(journeyId, memberId) {
    this.sdk.validateParams(
      { journeyId, memberId },
      {
        journeyId: { type: 'string', required: true },
        memberId: { type: 'string', required: true },
      },
    );
    return await internalRequest(
      this.sdk,
      `/journeys/${journeyId}/members/${memberId}`,
      'GET',
      {},
    );
  }

  /**
   * Enrol people into a journey. Pass `dryRun: true` to get the pre-enrol
   * summary without writing anything.
   *
   * @param {string} journeyId
   * @param {Object} body
   * @param {string[]} [body.peopleIds] - Either peopleIds or filter is required
   * @param {Object} [body.filter]
   * @param {Object} [body.overrides] - Per-member channel overrides
   * @param {string} [body.ownerUserId]
   * @param {string} [body.source]
   * @param {boolean} [body.dryRun]
   * @param {string} [body.primaryChannel]
   * @param {string} [body.workflowVersionId]
   * @returns {Promise<Object>} dryRun: {ready, noChannel, notOptedIn,
   *   suppressed, alreadyEnrolled, firstSendAt, outcomes}; real: enrol results
   */
  async enroll(journeyId, body = {}) {
    this.sdk.validateParams(
      { journeyId },
      { journeyId: { type: 'string', required: true } },
    );
    return await internalRequest(
      this.sdk,
      `/journeys/${journeyId}/members/enroll`,
      'POST',
      { body: pickDefined(body) },
    );
  }

  /**
   * Apply a bulk action to selected member ids, or to everything matching
   * a filter under the caller's visibility.
   *
   * @param {string} journeyId
   * @param {Object} body
   * @param {'pause'|'resume'|'remove'|'reassign'|'changeChannel'} body.action
   * @param {string[]} [body.ids] - Either ids or filter is required
   * @param {Object} [body.filter] - e.g. `{ ownerUserId }` to target every
   *   member currently owned by one rep (P5 "reassign-all-owned-by" is this
   *   `action:'reassign'` + `filter:{ownerUserId}` combination -- no
   *   dedicated endpoint/method was added).
   * @param {string} [body.reason]
   * @param {string} [body.ownerUserId] - New owner for `action:'reassign'`
   * @param {Object} [body.channels]
   * @returns {Promise<Object>} { results }
   */
  async actions(journeyId, body = {}) {
    this.sdk.validateParams(
      { journeyId, action: body?.action },
      {
        journeyId: { type: 'string', required: true },
        action: { type: 'string', required: true },
      },
    );
    return await internalRequest(
      this.sdk,
      `/journeys/${journeyId}/members/actions`,
      'POST',
      { body: pickDefined(body) },
    );
  }

  /**
   * Fix a member's channel address and resume or remove it.
   *
   * @param {string} journeyId
   * @param {string} memberId
   * @param {Object} body
   * @param {string} [body.emailAddress]
   * @param {string} [body.phoneNumber]
   * @param {string} [body.smsNumber]
   * @param {'resume'|'remove'} body.then
   * @param {string} [body.reason]
   * @returns {Promise<Object>} Updated member
   */
  async fix(journeyId, memberId, body = {}) {
    this.sdk.validateParams(
      { journeyId, memberId, then: body?.then },
      {
        journeyId: { type: 'string', required: true },
        memberId: { type: 'string', required: true },
        then: { type: 'string', required: true },
      },
    );
    return await internalRequest(
      this.sdk,
      `/journeys/${journeyId}/members/${memberId}/fix`,
      'POST',
      { body: pickDefined(body) },
    );
  }

  /**
   * @param {string} journeyId
   * @param {string} memberId
   * @returns {Promise<Array>} journeyMemberEvents rows, in order
   */
  async events(journeyId, memberId) {
    this.sdk.validateParams(
      { journeyId, memberId },
      {
        journeyId: { type: 'string', required: true },
        memberId: { type: 'string', required: true },
      },
    );
    return await internalRequest(
      this.sdk,
      `/journeys/${journeyId}/members/${memberId}/events`,
      'GET',
      {},
    );
  }

  /**
   * Context-aware AI draft for a human touch-task step (record, step
   * intent, prior conversation) -- journeys-plan.md §9 P5. Not the final
   * send content; the rep edits/sends from the task itself.
   *
   * @param {string} memberId
   * @param {Object} body
   * @param {string} [body.stepKey]
   * @param {'email'|'sms'} body.channel
   * @returns {Promise<{data: {draft: string, channel: string, stepKey: string}}>}
   */
  async draft(memberId, body = {}) {
    this.sdk.validateParams(
      { memberId, channel: body?.channel },
      {
        memberId: { type: 'string', required: true },
        channel: { type: 'string', required: true },
      },
    );
    return await internalRequest(
      this.sdk,
      `/journeys/members/${memberId}/draft`,
      'POST',
      { body: pickDefined(body) },
    );
  }
}
