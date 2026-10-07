import { internalRequest } from '../../base.js';
import { JourneyMembersService } from './JourneyMembersService.js';
import { JourneyDraftService } from './JourneyDraftService.js';

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
 * @see app1-api src/services/journeys/routes.js
 */
export class JourneysService {
  constructor(sdk) {
    this.sdk = sdk;
    this.members = new JourneyMembersService(sdk);
    this.types = new JourneyTypesService(sdk);
    this.goals = new JourneyGoalsService(sdk);
    this.draft = new JourneyDraftService(sdk);
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

/**
 * `sdk.journeys.types.*` -- journeyTypes generic-object CRUD. `queueId`
 * stays empty until P5.
 */
class JourneyTypesService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async list(opts = {}) {
    return await this.sdk.objects.query({ object: 'journeyTypes', ...opts });
  }

  async get(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return await this.sdk.objects.byId({ id });
  }

  /**
   * @param {Object} body
   * @param {string} body.name
   * @returns {Promise<Object>} Created journeyType
   */
  async create(body) {
    this.sdk.validateParams(
      { name: body?.name },
      { name: { type: 'string', required: true } },
    );
    return await this.sdk.objects.create({ object: 'journeyTypes', body });
  }

  async update(id, update) {
    this.sdk.validateParams(
      { id, update },
      {
        id: { type: 'string', required: true },
        update: { type: 'object', required: true },
      },
    );
    return await this.sdk.objects.updateById({
      object: 'journeyTypes',
      id,
      update,
    });
  }

  async remove(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return await this.sdk.objects.deleteById({ object: 'journeyTypes', id });
  }
}

/**
 * `sdk.journeys.goals.*` -- journeyGoals generic-object CRUD (no `get`;
 * goals are listed/edited inline on the journey, matching the plan's CRUD
 * surface for this object).
 */
class JourneyGoalsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * @param {Object} [opts] - sdk.objects.query opts; pass `where: { journeyId }` to scope
   * @returns {Promise<Object>} Query result
   */
  async list(opts = {}) {
    return await this.sdk.objects.query({ object: 'journeyGoals', ...opts });
  }

  /**
   * @param {Object} body
   * @param {string} body.journeyId
   * @param {string} body.goalType
   * @returns {Promise<Object>} Created journeyGoal
   */
  async create(body) {
    this.sdk.validateParams(
      { journeyId: body?.journeyId, goalType: body?.goalType },
      {
        journeyId: { type: 'string', required: true },
        goalType: { type: 'string', required: true },
      },
    );
    return await this.sdk.objects.create({ object: 'journeyGoals', body });
  }

  async update(id, update) {
    this.sdk.validateParams(
      { id, update },
      {
        id: { type: 'string', required: true },
        update: { type: 'object', required: true },
      },
    );
    return await this.sdk.objects.updateById({
      object: 'journeyGoals',
      id,
      update,
    });
  }

  async remove(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return await this.sdk.objects.deleteById({ object: 'journeyGoals', id });
  }
}

export { JourneyTypesService, JourneyGoalsService, JourneyDraftService };
