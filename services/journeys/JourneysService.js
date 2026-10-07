import { internalRequest } from '../../base.js';
import { JourneyMembersService } from './JourneyMembersService.js';
import { JourneyDraftService } from './JourneyDraftService.js';
import { JourneyWorklistService } from './JourneyWorklistService.js';
import { JourneyTypesService } from './JourneyTypesService.js';
import { JourneyGoalsService } from './JourneyGoalsService.js';

function pickDefined(fields) {
  const body = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) body[key] = value;
  }
  return body;
}

/**
 * Journeys (journeys-plan.md §2/§4) -- `sdk.journeys.*`.
 *
 * `journeyTypes`/`journeys`/`journeyGoals` are generic objects (registered
 * isCreateable=1/isEditable=1/isDeletable=1, with customHandlers on the api
 * side -- e.g. creating a journey also creates its companion workflow), so
 * their CRUD here is a thin wrapper over `sdk.objects.*` the way
 * `sdk.users.setStatus` wraps `sdk.objects.updateById` -- not a duplicate
 * HTTP surface. `journeyMembers` (registered isCreateable=0/isEditable=0)
 * and the member-grid/enrol/action/fix/events/stats endpoints are custom
 * routes under `/journeys/`, covered by `members` and `stats`.
 *
 * P5 (journeys-plan.md §8, sales queues + human steps) added fields to
 * several generic objects rather than new endpoints -- no dedicated SDK
 * service exists for these, so they are documented here instead:
 * - `sdk.objects` object `'queues'`: `queueType` ('support'|'sales',
 *   default 'support'), `deliveryMode` ('push'|'worklist', default
 *   'push'). A sales queue is auto-created with a journey type
 *   (`queueType:'sales', deliveryMode:'worklist'`) and its id is set on
 *   `journeyTypes.queueId`.
 * - `sdk.objects` object `'queueDispositions'`: `outcome`
 *   ('positive'|'neutral'|'negative'|null), `countsAsConversion`
 *   (boolean), `flagsBadContact` (boolean) -- drive a journey member's
 *   `converted` / `needsAttention:badContact` transitions when a touch
 *   task is given that disposition.
 * - `sdk.objects` object `'users'` (`users_acct`): `salesEnabled`
 *   (boolean, default false) -- required (alongside normal object
 *   permissions) for journeys build/enrol/member-action/worklist-take
 *   endpoints; member-grid reads stay open to object-read permission.
 * - Task rows (`sdk.taskRouter.task.*`, `sdk.journeys.worklist.*`) gain
 *   `deliveryMode` ('push'|'worklist'), `dueAt` (ISO datetime|null),
 *   `journeyMemberId`, `journeyId`, `journeyStepKey`, `journeyStepChannel`
 *   ('email'|'sms'|'call'|'other') on a journey touch task
 *   (`type:'journey'`). See `JourneyWorklistService`'s
 *   `JourneyWorklistTask` typedef for the full shape.
 *
 * @see app1-api src/services/journeys/routes.js
 */
export class JourneysService {
  constructor(sdk) {
    this.sdk = sdk;
    this.members = new JourneyMembersService(sdk);
    this.types = new JourneyTypesService(sdk);
    this.goals = new JourneyGoalsService(sdk);
    this.draft = new JourneyDraftService(sdk);
    this.worklist = new JourneyWorklistService(sdk);
  }

  /**
   * @param {Object} [opts] - sdk.objects.query opts (select, where, limit, nextId, …)
   * @returns {Promise<Object>} Query result
   */
  async list(opts = {}) {
    return await this.sdk.objects.query({ object: 'journeys', ...opts });
  }

  /**
   * @param {string} id
   * @returns {Promise<Object>} Journey record
   */
  async get(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return await this.sdk.objects.byId({ id });
  }

  /**
   * Creating a journey also creates its companion workflow
   * (type='journey', builderMode='advanced' until P4) + a draft version.
   *
   * @param {Object} body
   * @param {string} body.name
   * @param {string} body.journeyTypeId
   * @returns {Promise<Object>} Created journey, with workflowId/workflowVersionId
   */
  async create(body) {
    this.sdk.validateParams(
      { name: body?.name, journeyTypeId: body?.journeyTypeId },
      {
        name: { type: 'string', required: true },
        journeyTypeId: { type: 'string', required: true },
      },
    );
    return await this.sdk.objects.create({ object: 'journeys', body });
  }

  /**
   * @param {string} id
   * @param {Object} update
   * @returns {Promise<Object>} Update result
   */
  async update(id, update) {
    this.sdk.validateParams(
      { id, update },
      {
        id: { type: 'string', required: true },
        update: { type: 'object', required: true },
      },
    );
    return await this.sdk.objects.updateById({ object: 'journeys', id, update });
  }

  /**
   * Delete ⇒ archive server-side (status: 'archived', never soft-deleted).
   *
   * @param {string} id
   * @returns {Promise<Object>} { deleted: [id] }
   */
  async archive(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return await this.sdk.objects.deleteById({ object: 'journeys', id });
  }

  /**
   * @param {string} journeyId
   * @returns {Promise<Object>} { byStatus, needsAttentionByReason }
   */
  async stats(journeyId) {
    this.sdk.validateParams(
      { journeyId },
      { journeyId: { type: 'string', required: true } },
    );
    return await internalRequest(
      this.sdk,
      `/journeys/${journeyId}/stats`,
      'GET',
      {},
    );
  }

  /**
   * Diff of the current published journeyDoc vs the draft, by stepKey (P7).
   *
   * @param {string} id
   * @returns {Promise<Object>} { oldVersionId, newVersionId, added, removed, changed }
   */
  async publishDiff(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return await internalRequest(
      this.sdk,
      `/journeys/${id}/publish-diff`,
      'GET',
      {},
    );
  }

  /**
   * Publish the draft (runs publish-check; blocking items fail). Pass
   * `{mode:'migrate', mapping}` to move open members on the old version to
   * mapped landing steps at their next safe point (journeys-plan.md §7.5);
   * omit for a plain publish (members stay on their version). Requires
   * salesEnabled.
   *
   * @param {string} id
   * @param {Object} [opts]
   * @param {'migrate'|'leave'} [opts.mode]
   * @param {Object<string,string>} [opts.mapping] removed stepKey -> landing stepKey | 'leave'
   * @returns {Promise<Object>} { versionId, oldVersionId, migrationPlan }
   */
  async publish(id, { mode, mapping } = {}) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return await internalRequest(this.sdk, `/journeys/${id}/publish`, 'POST', {
      body: { migrate: pickDefined({ mode, mapping }) },
    });
  }

  /**
   * Per-step funnel (journeys-plan.md §9, P6): entered / outcome split /
   * conversions from journeyMemberEvents. Test members are excluded.
   *
   * @param {string} journeyId
   * @returns {Promise<Object>} { steps: [{ stepKey, type, title, entered, outcomes, conversions }] }
   */
  async funnel(journeyId) {
    this.sdk.validateParams(
      { journeyId },
      { journeyId: { type: 'string', required: true } },
    );
    return await internalRequest(
      this.sdk,
      `/journeys/${journeyId}/funnel`,
      'GET',
      {},
    );
  }

  /**
   * Journey-level metrics (P6): enrolled, active, needsAttention, repliedPct,
   * convertedPct, bounced, optedOut, timeToConvertMedianSeconds, byStatus.
   *
   * @param {string} journeyId
   * @returns {Promise<Object>}
   */
  async metrics(journeyId) {
    this.sdk.validateParams(
      { journeyId },
      { journeyId: { type: 'string', required: true } },
    );
    return await internalRequest(
      this.sdk,
      `/journeys/${journeyId}/metrics`,
      'GET',
      {},
    );
  }

  /**
   * Journey-wide activity feed (P6): journeyMemberEvents, newest first.
   *
   * @param {string} journeyId
   * @param {Object} [opts]
   * @param {string} [opts.stepKey]
   * @param {string} [opts.memberId]
   * @param {number} [opts.page]
   * @param {number} [opts.pageSize]
   * @returns {Promise<Object>} { rows, total }
   */
  async events(journeyId, opts = {}) {
    this.sdk.validateParams(
      { journeyId },
      { journeyId: { type: 'string', required: true } },
    );
    return await internalRequest(
      this.sdk,
      `/journeys/${journeyId}/events`,
      'GET',
      { query: pickDefined(opts) },
    );
  }

  /**
   * Rep metrics (P6): per owner — due, overdue, doneOnTime,
   * timeToActionMedianSeconds — from touch tasks. Requires salesEnabled.
   *
   * @param {Object} [opts]
   * @param {string} [opts.journeyTypeId]
   * @param {string} [opts.journeyId]
   * @param {string} [opts.from] ISO date-time
   * @param {string} [opts.to] ISO date-time
   * @returns {Promise<Object>} { reps: [{ userId, due, overdue, doneOnTime, timeToActionMedianSeconds }] }
   */
  async repsMetrics(opts = {}) {
    return await internalRequest(this.sdk, '/journeys/reps/metrics', 'GET', {
      query: pickDefined(opts),
    });
  }

  /**
   * No-send dry run: per step, the resolved channel (override -> primary),
   * rendered message, and landing date for a given person (journeys-plan.md
   * §7.6, P4 templates area).
   *
   * @param {string} id
   * @param {Object} params
   * @param {string} params.peopleId
   * @returns {Promise<Object>} { steps: [{ stepKey, channel, message, landingAt }] }
   */
  async preview(id, { peopleId } = {}) {
    this.sdk.validateParams(
      { id, peopleId },
      {
        id: { type: 'string', required: true },
        peopleId: { type: 'string', required: true },
      },
    );
    return await internalRequest(this.sdk, `/journeys/${id}/preview`, 'GET', {
      query: { peopleId },
    });
  }

  /**
   * Enrols the caller as an `isTest` member: sends redirect to the caller's
   * own email/number, waits compress to `TEST_RUN_WAIT_SECONDS`, and the
   * member is excluded from stats/event counts.
   *
   * @param {string} id
   * @param {Object} [params]
   * @param {string} [params.peopleId]
   * @param {string} [params.testEmail] - override destination
   * @param {string} [params.testPhone] - override destination
   * @returns {Promise<Object>} Enrolled test member
   */
  async testRun(id, { peopleId, testEmail, testPhone } = {}) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return await internalRequest(
      this.sdk,
      `/journeys/${id}/test-run`,
      'POST',
      { body: pickDefined({ peopleId, testEmail, testPhone }) },
    );
  }

  /**
   * Export + install into the same account, keeping template refs
   * (journeys-plan.md §7.7).
   *
   * @param {string} id
   * @param {Object} [params]
   * @param {string} [params.name]
   * @returns {Promise<Object>} New journey + workflow + draft version
   */
  async clone(id, { name } = {}) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return await internalRequest(this.sdk, `/journeys/${id}/clone`, 'POST', {
      body: pickDefined({ name }),
    });
  }

  /**
   * Save this journey into the account's template library
   * (`workflowTemplates`, journeys-plan.md §7.7).
   *
   * @param {string} id
   * @param {Object} params
   * @param {string} params.name
   * @param {string} [params.summary]
   * @param {string} [params.category]
   * @param {'platform'|'account'} [params.visibility]
   * @returns {Promise<Object>} Created workflowTemplates row
   */
  async saveAsTemplate(id, { name, summary, category, visibility } = {}) {
    this.sdk.validateParams(
      { id, name },
      {
        id: { type: 'string', required: true },
        name: { type: 'string', required: true },
      },
    );
    return await internalRequest(
      this.sdk,
      `/journeys/${id}/save-as-template`,
      'POST',
      { body: pickDefined({ name, summary, category, visibility }) },
    );
  }
}

export {
  JourneyTypesService,
  JourneyGoalsService,
  JourneyDraftService,
  JourneyWorklistService,
};
