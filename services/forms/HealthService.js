import { internalRequest } from '../../base.js';

// Forms v2 P8 (plans/forms-v2-plan.md D13, forms-v2-precheck.md §9) --
// agent-authenticated Health tab data (`sdk.forms.health`): submissions
// tiles, a 30-day submissions-per-day sparkline, per-field fill rate, and
// drift alerts (a field with 0 non-blank values in the last 7 days after
// previously being filled >=50% of the time). Backed by the nightly
// `formFieldStats` rollup -- server route:
// `app1-api/src/services/forms/controllers/getFormHealth.js`.
export class FormsHealthService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * @param {string} formId
   * @returns {Promise<{
   *   tiles: {submissions:number, submissionsChangePct:number|null,
   *     spamCount:number, spamRatePct:number, companyLinkedPct:number,
   *     companyCreated:number, actionsFailed:number},
   *   sparkline: {day:string, submitted:number}[],
   *   fields: {fieldKey:string, label:string, fillRate:number|null,
   *     priorFillRate:number|null, isDrifting:boolean}[],
   *   driftAlerts: object[],
   *   windowDays: number,
   * }>}
   */
  async get(formId) {
    return internalRequest(
      this.sdk,
      `/forms/${encodeURIComponent(formId)}/health`,
      'GET',
    );
  }
}
