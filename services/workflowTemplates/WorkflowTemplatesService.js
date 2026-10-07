import { internalRequest } from '../../base.js';

function pickDefined(fields) {
  const body = {};
  for (const [key, value] of Object.entries(fields)) {
    if (value !== undefined) body[key] = value;
  }
  return body;
}

/**
 * Account-visible workflow template library -- `sdk.workflowTemplates.*`
 * (journeys-plan.md §7.7, P4 templates area). `visibility`/access is
 * service-only (accountId IS NULL for platform starters, or = caller);
 * platform authoring (upsert) is INTERNAL-only (`/internal/journeys/
 * templates`) with no customer-facing SDK surface -- there is no first-party
 * INTERNAL SDK extension surface in this package to hang it on, so it is
 * intentionally not wrapped here.
 *
 * @see app1-api src/services/journeys/routes.js (`/journeys/templates*`)
 */
export class WorkflowTemplatesService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * @param {Object} [params]
   * @param {string} [params.workflowType] - defaults to 'journey' on the API
   * @returns {Promise<Object[]>} Templates visible to the caller's account
   */
  async list({ workflowType } = {}) {
    return await internalRequest(
      this.sdk,
      '/journeys/templates',
      'GET',
      { query: pickDefined({ workflowType }) },
    );
  }

  /**
   * Installs a template into the caller's account as a new journey +
   * workflow + draft version (+ journeyDoc when present) in one
   * transaction, validated again at install time.
   *
   * @param {string} templateId
   * @param {Object} params
   * @param {string} params.journeyTypeId
   * @param {Object} [params.answers] - answers to the template's `requirements`
   * @param {string} [params.name] - override the template's default name
   * @returns {Promise<Object>} New journey + workflow + draft version
   */
  async install(templateId, { journeyTypeId, answers, name } = {}) {
    this.sdk.validateParams(
      { templateId, journeyTypeId },
      {
        templateId: { type: 'string', required: true },
        journeyTypeId: { type: 'string', required: true },
      },
    );
    return await internalRequest(
      this.sdk,
      `/journeys/templates/${templateId}/install`,
      'POST',
      { body: pickDefined({ journeyTypeId, answers, name }) },
    );
  }
}
