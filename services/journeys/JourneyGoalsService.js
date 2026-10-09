import { internalRequest } from '../../base.js';

/**
 * `sdk.journeys.goals.*` -- journeyGoals generic-object CRUD (no `get`;
 * goals are listed/edited inline on the journey, matching the plan's CRUD
 * surface for this object).
 */
export class JourneyGoalsService {
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
