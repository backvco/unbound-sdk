import { internalRequest } from '../../base.js';

// Public, unauthenticated forms surface -- `sdk.forms.public`. Mirrors
// WebchatVisitorService.js: the sdk instance backing this only needs
// `namespace` (or a custom `baseURL`) set at construction, never
// `sdk.token`. POSTs `forceFetch` (HTTP-only, no NATS transport) since
// these are one-shot fetches from a customer page / marketing site, same
// as every other visitor-facing call.
//
// Wire shape matches `POST /f/:publicKey` (app1-api webhooks service,
// forms-v2-precheck.md §4.1): plain form fields go at the top level of the
// body (fieldKey -> value, arrays allowed), and everything the server
// treats as a *control* field (not a form value) is sent with a leading
// underscore -- the same convention formSubmit.js/formSubmitPublicKey.js
// already split on for the legacy `_token` field.
export class FormsPublicService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Submit a public form by its publicKey (D1 -- every form has its own
   * publicKey; no tracking-code/_token needed for this path). Legacy
   * hosted-fields forms keep using the `/webhooks/form/:formId` +
   * `_token` path (unchanged, not exposed here).
   * @param {string} publicKey
   * @param {Object} fields - fieldKey -> value (arrays kept as arrays).
   * @param {Object} [options]
   * @param {Object} [options.context] - Client-observed context (utm/referrer/
   *   landingUrl/etc, D12) to merge with what the server infers from the
   *   request itself -- sent as the `_context` control field.
   * @param {string} [options.captchaToken] - Turnstile/etc response token
   *   (D10); sent as `_captchaToken`. Ignored server-side until a captcha
   *   provider is configured for the form/account.
   * @param {string} [options.idempotencyKey] - Per-render dedupe token
   *   (D10); sent as `_idempotencyKey`.
   * @returns {Promise<{ok:boolean, message?:string}>}
   */
  async submit(publicKey, fields, { context, captchaToken, idempotencyKey } = {}) {
    this.sdk.validateParams(
      { publicKey },
      { publicKey: { type: 'string', required: true } },
    );
    const body = { ...(fields || {}) };
    if (idempotencyKey) body._idempotencyKey = idempotencyKey;
    if (captchaToken) body._captchaToken = captchaToken;
    if (context) body._context = context;

    return internalRequest(
      this.sdk,
      `/f/${publicKey}`,
      'POST',
      { body },
      true,
    );
  }
}
