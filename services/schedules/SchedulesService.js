import { internalRequest } from '../../base.js';
import { TimeOffService } from './TimeOffService.js';

function pickDefined(fields) {
  const body = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) body[key] = value;
  }
  return body;
}

// Resolve/open query params a caller may pass to narrow which schedule is
// evaluated: a specific scheduleId (ignores assignment resolution), or a
// queueId/userId to resolve via assignments (journeys-plan.md §5).
function resolveQuery({ queueId, userId, scheduleId } = {}) {
  return pickDefined({ queueId, userId, scheduleId });
}

/**
 * Schedules (working hours, closures, assignments, time off) --
 * journeys-plan.md §5. CRUD, assignments, holiday sets, time off, and the
 * resolve/isOpen/nextOpen/simulate endpoints that evaluate a resolved
 * schedule. `sdk.schedules.*`.
 *
 * @see app1-api src/services/schedules/routes.js
 */
export class SchedulesService {
  constructor(sdk) {
    this.sdk = sdk;
    this.timeOff = new TimeOffService(sdk);
  }

  /**
   * @returns {Promise<Array>} Schedules (summary rows, no nested windows/closures)
   */
  async list() {
    return await internalRequest(this.sdk, '/schedules', 'GET', {});
  }

  /**
   * @param {string} id
   * @returns {Promise<Object>} Schedule with nested windows, closures, usedBy
   */
  async get(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return await internalRequest(this.sdk, `/schedules/${id}`, 'GET', {});
  }

  /**
   * @param {Object} body
   * @param {string} body.name
   * @param {string} [body.timezone]
   * @param {boolean} [body.isAccountDefault]
   * @param {Array<Object>} [body.windows] - {dayOfWeek, startTime, endTime}
   * @param {Array<Object>} [body.closures] - {name, kind, config, partialDay?}
   * @returns {Promise<Object>} Created schedule (with nested windows/closures)
   */
  async create(body) {
    this.sdk.validateParams(
      { name: body?.name },
      { name: { type: 'string', required: true } },
    );
    return await internalRequest(this.sdk, '/schedules', 'POST', {
      body: pickDefined(body),
    });
  }

  /**
   * Full replace-on-update: passing `windows`/`closures` replaces the
   * schedule's entire set (not a merge/patch of individual rows).
   *
   * @param {string} id
   * @param {Object} body - name?, timezone?, isAccountDefault?, windows?, closures?
   * @returns {Promise<Object>} Updated schedule
   */
  async update(id, body) {
    this.sdk.validateParams(
      { id, body },
      {
        id: { type: 'string', required: true },
        body: { type: 'object', required: true },
      },
    );
    return await internalRequest(this.sdk, `/schedules/${id}`, 'PATCH', {
      body: pickDefined(body),
    });
  }

  /**
   * @param {string} id
   * @returns {Promise<Object>} { id, deleted: true } -- 409s while assigned
   */
  async remove(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return await internalRequest(this.sdk, `/schedules/${id}`, 'DELETE', {});
  }

  /**
   * Set (replace) the one active assignment for a target. A target has at
   * most one schedule at a time.
   *
   * @param {string} id - Schedule id
   * @param {Object} params
   * @param {'account'|'group'|'queue'|'user'} params.targetType
   * @param {string} [params.targetId] - Required unless targetType is 'account'
   * @returns {Promise<Object>} The assignment row
   */
  async setAssignment(id, { targetType, targetId } = {}) {
    this.sdk.validateParams(
      { id, targetType },
      {
        id: { type: 'string', required: true },
        targetType: { type: 'string', required: true },
      },
    );
    return await internalRequest(
      this.sdk,
      `/schedules/${id}/assignments`,
      'POST',
      { body: pickDefined({ targetType, targetId }) },
    );
  }

  /**
   * @param {string} id - Schedule id
   * @param {string} assignmentId
   * @returns {Promise<Object>} { id, deleted: true }
   */
  async clearAssignment(id, assignmentId) {
    this.sdk.validateParams(
      { id, assignmentId },
      {
        id: { type: 'string', required: true },
        assignmentId: { type: 'string', required: true },
      },
    );
    return await internalRequest(
      this.sdk,
      `/schedules/${id}/assignments/${assignmentId}`,
      'DELETE',
      {},
    );
  }

  /**
   * Every live assignment pointing at this schedule (account/group/queue/user).
   *
   * @param {string} id
   * @returns {Promise<Array>} Assignment rows
   */
  async usedBy(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return await internalRequest(this.sdk, `/schedules/${id}/usedBy`, 'GET', {});
  }

  /**
   * @returns {Promise<Array>} Holiday sets, one row per {country, key}
   */
  async listHolidaySets() {
    return await internalRequest(this.sdk, '/schedules/holidaySets', 'GET', {});
  }

  /**
   * Resolve the effective schedule for a target: user assignment -> queue
   * assignment -> account default, with additive closures. Pass
   * `scheduleId` to resolve a specific schedule directly (ignores
   * assignment resolution; used by "simulate" against the schedule being
   * edited).
   *
   * @param {Object} [params]
   * @param {string} [params.queueId]
   * @param {string} [params.userId]
   * @param {string} [params.scheduleId]
   * @returns {Promise<Object>} Resolved schedule { timezone, windows, closures, source, flagged }
   */
  async resolve(params = {}) {
    return await internalRequest(this.sdk, '/schedules/resolve', 'GET', {
      query: resolveQuery(params),
    });
  }

  /**
   * @param {Object} [params]
   * @param {string} [params.queueId]
   * @param {string} [params.userId]
   * @param {string} [params.scheduleId]
   * @param {string} [params.at] - ISO datetime; defaults to now
   * @returns {Promise<Object>} { open, flagged }
   */
  async isOpen(params = {}) {
    const { at, ...rest } = params;
    return await internalRequest(this.sdk, '/schedules/isOpen', 'GET', {
      query: pickDefined({ ...resolveQuery(rest), at }),
    });
  }

  /**
   * @param {Object} [params]
   * @param {string} [params.queueId]
   * @param {string} [params.userId]
   * @param {string} [params.scheduleId]
   * @param {string} [params.at] - ISO datetime; defaults to now
   * @returns {Promise<Object>} { nextOpen, flagged }
   */
  async nextOpen(params = {}) {
    const { at, ...rest } = params;
    return await internalRequest(this.sdk, '/schedules/nextOpen', 'GET', {
      query: pickDefined({ ...resolveQuery(rest), at }),
    });
  }

  /**
   * Simulate a resolved schedule: open/nextOpen at a point in time, plus
   * optional addBusinessTime (pass `amount`+`unit`) and/or an `open` check
   * across a `range` of ISO timestamps.
   *
   * @param {Object} [body]
   * @param {string} [body.queueId]
   * @param {string} [body.userId]
   * @param {string} [body.scheduleId]
   * @param {string} [body.at] - ISO datetime; defaults to now
   * @param {number} [body.amount]
   * @param {'minutes'|'hours'|'days'} [body.unit]
   * @param {string[]} [body.range] - ISO datetimes to check open/closed for
   * @returns {Promise<Object>} { resolved, open, nextOpen, addBusinessTime?, range? }
   */
  async simulate(body = {}) {
    return await internalRequest(this.sdk, '/schedules/simulate', 'POST', {
      body: pickDefined(body),
    });
  }
}
