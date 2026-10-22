import { internalRequest } from '../../base.js';

function pickDefined(fields) {
  const body = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) body[key] = value;
  }
  return body;
}

/**
 * @typedef {Object} JourneyWorklistTask
 * @property {string} id
 * @property {'journey'} type
 * @property {'worklist'} deliveryMode
 * @property {string|null} dueAt
 * @property {string} journeyMemberId
 * @property {string} journeyId
 * @property {string} journeyStepKey
 * @property {'email'|'sms'|'call'|'other'} journeyStepChannel
 * @property {string|null} preferredWorkerId - Owner, or null for a pool task
 * @property {string|null} engagementSessionId
 */

/**
 * Sales work list -- `sdk.journeys.worklist.*` (journeys-plan.md §9, P5).
 * Cross-journey view of a sales rep's (or the pool's) open touch tasks
 * (`tasks.type='journey'`), plus upcoming members from
 * `journeyMembers.nextActionAt`. Requires `users_acct.salesEnabled` for
 * `takeNext` (`list` stays open to ordinary object-read permission, per
 * the P5 contract).
 *
 * @see app1-api src/services/journeys/controllers/worklist.js
 */
export class JourneyWorklistService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * @param {Object} [opts]
   * @param {'due'|'overdue'|'upcoming'} [opts.bucket]
   * @param {string} [opts.stepType]
   * @param {string} [opts.journeyId]
   * @param {string} [opts.workerId] another rep's worker id. Allowed only
   *   for a manager of that task's sales queue. The response is then
   *   `{ readOnly: true }` and omits pool tasks.
   * @param {number} [opts.page]
   * @param {number} [opts.pageSize]
   * @returns {Promise<{data: JourneyWorklistTask[], readOnly: boolean, reps: {workerId: string, userId: string, name: string, isSelf: boolean}[]}>}
   */
  async list(opts = {}) {
    return await internalRequest(this.sdk, '/journeys/worklist', 'GET', {
      query: pickDefined(opts),
    });
  }

  /**
   * Takes the next due task for the caller (owner-or-pool), via the same
   * `transitionTask` path as a manual take (`PUT /tasks/:id
   * {status:'connected', workerId}`) -- not a separate silent-assign path.
   *
   * @param {Object} [filter]
   * @param {string} [filter.stepType]
   * @param {string} [filter.journeyId]
   * @param {string} [filter.taskId] take this exact task (validated server-side: worklist, pending, owner-or-pool)
   * @returns {Promise<{data: JourneyWorklistTask|null}>} null when nothing is due
   */
  async takeNext(filter = {}) {
    return await internalRequest(
      this.sdk,
      '/journeys/worklist/take-next',
      'POST',
      { body: pickDefined(filter) },
    );
  }

  /**
   * Put a worklist touch back to pending when the rep closes it without
   * sending or calling. Keeps the owner. Server refuses once an action
   * was taken.
   *
   * @param {Object} body
   * @param {string} body.taskId
   * @returns {Promise<{data: JourneyWorklistTask}>}
   */
  async release({ taskId } = {}) {
    return await internalRequest(this.sdk, '/journeys/worklist/release', 'POST', {
      body: { taskId },
    });
  }
}
