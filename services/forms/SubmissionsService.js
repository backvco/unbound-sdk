import { internalRequest } from "../../base.js";

// Agent-authenticated formSubmissions actions -- `sdk.forms.submissions`.
// Normal agent-token path (no forceFetch, no authHeaders), same as any
// other authenticated service method (e.g. WebchatWidgetsService.get()).
//
// Methods call:
// - reprocess() → POST /object/formSubmissions/:id/reprocess (api objects/routes.js)
// - markNotSpam() → POST /object/formSubmissions/:id/mark-not-spam (api objects/routes.js)
// - resolveReview() → POST /object/formSubmissions/:id/resolve-review (api objects/routes.js)
export class FormsSubmissionsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Re-run the pipeline for an existing submission from its stored
   * rawFields (marks the new submission's `reprocessedFromId`).
   * @param {string} id - formSubmissions id.
   * @returns {Promise<Object>}
   */
  async reprocess(id) {
    this.sdk.validateParams({ id }, { id: { type: "string", required: true } });
    return internalRequest(
      this.sdk,
      `/object/formSubmissions/${id}/reprocess`,
      "POST",
    );
  }

  /**
   * Clear a submission's spam status (Quarantine "Not spam" action, D10).
   * @param {string} id - formSubmissions id.
   * @returns {Promise<Object>}
   */
  async markNotSpam(id) {
    this.sdk.validateParams({ id }, { id: { type: "string", required: true } });
    return internalRequest(
      this.sdk,
      `/object/formSubmissions/${id}/mark-not-spam`,
      "POST",
    );
  }

  /**
   * Resolve a submission flagged `identityConflict`/`review` (D16).
   * @param {string} id - formSubmissions id.
   * @param {string} choice - Which candidate record to keep/link; shape is
   *   whatever the Review queue UI (P4) settles on -- documented here as a
   *   passthrough until that's built.
   * @returns {Promise<Object>}
   */
  async resolveReview(id, choice) {
    this.sdk.validateParams(
      { id, choice },
      {
        id: { type: "string", required: true },
        choice: { type: "string", required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/object/formSubmissions/${id}/resolve-review`,
      "POST",
      { body: { choice } },
    );
  }
}
