import { internalRequest } from '../../base.js';

// Agent-authenticated formSubmissions actions -- `sdk.forms.submissions`.
// Normal agent-token path (no forceFetch, no authHeaders), same as any
// other authenticated service method (e.g. WebchatWidgetsService.get()).
//
// GAP (forms-v2 P2, see plans/forms-v2-progress/P2.md): the server-side
// routes these call do NOT exist yet. forms-v2-precheck.md §9 gates the
// Quarantine/reprocess UI behind P5, but never assigns an owner file for
// the *backend* controllers -- adding them here to app1-api's
// `objects/routes.js` (the `/:objectName/merge`-style precedent for a
// custom per-object action route) is outside P2's file-ownership map, so
// P2 only forward-declares the wire contract below. Whichever phase wires
// the server (P5 for reprocess/markNotSpam per plan §8, or earlier if
// needed) must implement these exact paths/methods, or bump the SDK with
// a corrected path.
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
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/object/formSubmissions/${id}/reprocess`,
      'POST',
    );
  }

  /**
   * Clear a submission's spam status (Quarantine "Not spam" action, D10).
   * @param {string} id - formSubmissions id.
   * @returns {Promise<Object>}
   */
  async markNotSpam(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/object/formSubmissions/${id}/mark-not-spam`,
      'POST',
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
        id: { type: 'string', required: true },
        choice: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/object/formSubmissions/${id}/resolve-review`,
      'POST',
      { body: { choice } },
    );
  }
}
