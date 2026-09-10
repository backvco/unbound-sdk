import { internalRequest } from "../../base.js";

// Agent-authenticated `formsAccountSettings` singleton -- `sdk.forms.settings`
// (defaultRegion, turnstileSiteKey, turnstileSecretRef; plan §6.5's
// account-settings page, `/app/setup/forms/account-settings`).
//
// Methods call:
// - get() → GET /forms/settings (services/forms/routes.js)
// - set() → PUT /forms/settings (services/forms/routes.js)
// - setForm() → PUT /forms/:id/settings (services/forms/routes.js)
export class FormsSettingsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * @returns {Promise<{defaultRegion?:string, turnstileSiteKey?:string, turnstileSecretRef?:string}>}
   *   `turnstileSecretRef` is a reference/handle only -- the raw secret
   *   never round-trips to the client.
   */
  async get() {
    return internalRequest(this.sdk, "/forms/settings", "GET");
  }

  /**
   * Merge-patch the singleton row.
   * @param {Object} patch
   * @param {string} [patch.defaultRegion]
   * @param {string} [patch.turnstileSiteKey]
   * @param {string} [patch.turnstileSecret] - Plaintext; server stores only
   *   `turnstileSecretRef` and never echoes the raw value back.
   * @returns {Promise<Object>}
   */
  async set(patch) {
    return internalRequest(this.sdk, "/forms/settings", "PUT", {
      body: { ...(patch || {}) },
    });
  }

  /**
   * Review fix -- per-form Turnstile override (Settings tab's "Secret key
   * (override)" field). Mirrors `set()`: the raw secret goes under
   * `turnstileSecret`, never the stored `turnstileSecretRef` column name.
   * Server route: `PUT /forms/:id/settings`
   * (app1-api/src/services/forms/controllers/putFormSettings.js).
   * @param {string} formId
   * @param {Object} patch
   * @param {string|null} [patch.captchaProvider]
   * @param {string|null} [patch.turnstileSiteKey]
   * @param {string} [patch.turnstileSecret] - Plaintext; omit (or send '')
   *   to leave the currently stored secret untouched.
   * @returns {Promise<Object>}
   */
  async setForm(formId, patch) {
    this.sdk.validateParams(
      { formId },
      { formId: { type: "string", required: true } },
    );
    return internalRequest(
      this.sdk,
      `/forms/${encodeURIComponent(formId)}/settings`,
      "PUT",
      { body: { ...(patch || {}) } },
    );
  }
}
