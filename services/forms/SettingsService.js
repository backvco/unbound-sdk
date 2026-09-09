import { internalRequest } from '../../base.js';

// Agent-authenticated `formsAccountSettings` singleton -- `sdk.forms.settings`
// (defaultRegion, turnstileSiteKey, turnstileSecretRef; plan §6.5's
// account-settings page, `/app/setup/forms/account-settings`).
//
// GAP (forms-v2 P2, see plans/forms-v2-progress/P2.md): same as
// SubmissionsService.js -- the server-side singleton get/set controller +
// route are not built yet (no phase in forms-v2-precheck.md §9 owns this
// file explicitly). `/forms/settings` is P2's proposed path, chosen to
// mirror the client route name (`forms/account-settings`) rather than the
// generic `/object/:objectName` shape, since `formsAccountSettings` is a
// fixed-id singleton with no `id` the client ever knows (same shape as
// `chatAccountSettings`/`aiAccountSettings`) -- not a normal CRUD object.
// Whichever phase builds the backend (P5, alongside the account-settings
// page per §9) should implement exactly this path/method pair, or bump
// the SDK with a corrected one.
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
    return internalRequest(this.sdk, '/forms/settings', 'GET');
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
    return internalRequest(this.sdk, '/forms/settings', 'PUT', {
      body: { ...(patch || {}) },
    });
  }
}
