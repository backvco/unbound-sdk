import { internalRequest } from '../../base.js';

function pickDefined(fields) {
  const body = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) body[key] = value;
  }
  return body;
}

/**
 * userTimeOff CRUD -- self + manager-for-direct-reports.
 * `sdk.schedules.timeOff.*` (journeys-plan.md §5).
 *
 * @see app1-api src/services/schedules/controllers/timeOff.js
 */
export class TimeOffService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * List time off rows. Omit `userId` for your own rows; pass it to look
   * up a direct report's (manager-only, 403 otherwise).
   *
   * @param {Object} [params]
   * @param {string} [params.userId]
   * @returns {Promise<Array>} Time off rows
   */
  async list(params = {}) {
    const { userId } = params;
    const query = userId ? { userId } : {};
    return await internalRequest(this.sdk, '/schedules/timeOff', 'GET', {
      query,
    });
  }

  /**
   * Manager "Team time off" view -- every active direct report's rows.
   *
   * @returns {Promise<Array>} Time off rows for all direct reports
   */
  async listTeam() {
    return await internalRequest(
      this.sdk,
      '/schedules/timeOff/team',
      'GET',
      {},
    );
  }

  /**
   * Create a time off row. `userId` defaults to the caller; a manager may
   * pass a direct report's userId.
   *
   * @param {Object} body
   * @param {string} [body.userId]
   * @param {string} body.startAt
   * @param {string} body.endAt
   * @param {string} [body.kind] - vacation|sick|other (default vacation)
   * @param {string} [body.note]
   * @param {string} [body.backupUserId]
   * @returns {Promise<Object>} Created row
   */
  async create(body) {
    this.sdk.validateParams(
      { startAt: body?.startAt, endAt: body?.endAt },
      {
        startAt: { type: 'string', required: true },
        endAt: { type: 'string', required: true },
      },
    );
    return await internalRequest(this.sdk, '/schedules/timeOff', 'POST', {
      body: pickDefined(body),
    });
  }

  /**
   * @param {string} id
   * @param {Object} body - startAt?, endAt?, kind?, note?, backupUserId?
   * @returns {Promise<Object>} Updated row
   */
  async update(id, body) {
    this.sdk.validateParams(
      { id, body },
      {
        id: { type: 'string', required: true },
        body: { type: 'object', required: true },
      },
    );
    return await internalRequest(
      this.sdk,
      `/schedules/timeOff/${id}`,
      'PATCH',
      { body: pickDefined(body) },
    );
  }

  /**
   * @param {string} id
   * @returns {Promise<Object>} { id, deleted: true }
   */
  async remove(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return await internalRequest(
      this.sdk,
      `/schedules/timeOff/${id}`,
      'DELETE',
      {},
    );
  }

  /**
   * @param {string} userId
   * @param {string} [at] - ISO datetime; defaults to now server-side
   * @returns {Promise<Object>} { away: boolean }
   */
  async isUserAway(userId, at) {
    this.sdk.validateParams(
      { userId },
      { userId: { type: 'string', required: true } },
    );
    const query = at ? { userId, at } : { userId };
    return await internalRequest(
      this.sdk,
      '/schedules/timeOff/isUserAway',
      'GET',
      { query },
    );
  }
}
