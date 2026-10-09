import { internalRequest } from '../../base.js';

/**
 * Simple-builder draft surface -- `sdk.journeys.draft.*` (journeys-plan.md
 * §7.3/§7.4, P4 compile area). Custom routes mounted at
 * `/journeys/:id/draft*`, `/journeys/:id/publish-check`,
 * `/journeys/:id/convert-to-advanced`.
 *
 * @see app1-api src/services/journeys/routes.js
 * @see app1-api src/services/journeys/controllers/compile.js
 */
export class JourneyDraftService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * @param {string} journeyId
   * @returns {Promise<Object>} { version, doc, builderMode }
   */
  async get(journeyId) {
    this.sdk.validateParams(
      { journeyId },
      { journeyId: { type: 'string', required: true } },
    );
    return await internalRequest(
      this.sdk,
      `/journeys/${journeyId}/draft`,
      'GET',
    );
  }

  /**
   * Compile the simple-builder step doc into workflowItems/ports/
   * connections/positions in one transaction. 409s if the journey's
   * `builderMode` is `'advanced'` (doc is ignored once converted).
   *
   * @param {string} journeyId
   * @param {Object} doc - journeyDoc shape (journeys-plan.md §7.2)
   * @returns {Promise<Object>} { doc (with dayOffset), itemsByStepKey }
   */
  async saveSteps(journeyId, doc) {
    this.sdk.validateParams(
      { journeyId, doc },
      {
        journeyId: { type: 'string', required: true },
        doc: { type: 'object', required: true },
      },
    );
    return await internalRequest(
      this.sdk,
      `/journeys/${journeyId}/draft/steps`,
      'PUT',
      { body: { doc } },
    );
  }

  /**
   * One-way: `simple` -> `advanced` only. Once advanced, the journeyDoc is
   * ignored and compile is unavailable (`saveSteps` 409s).
   *
   * @param {string} journeyId
   * @returns {Promise<Object>} Updated journey
   */
  async convertToAdvanced(journeyId) {
    this.sdk.validateParams(
      { journeyId },
      { journeyId: { type: 'string', required: true } },
    );
    return await internalRequest(
      this.sdk,
      `/journeys/${journeyId}/convert-to-advanced`,
      'POST',
    );
  }

  /**
   * @param {string} journeyId
   * @returns {Promise<Object>} { blocking, warnings }
   */
  async publishCheck(journeyId) {
    this.sdk.validateParams(
      { journeyId },
      { journeyId: { type: 'string', required: true } },
    );
    return await internalRequest(
      this.sdk,
      `/journeys/${journeyId}/publish-check`,
      'GET',
    );
  }
}
