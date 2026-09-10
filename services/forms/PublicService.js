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
// already split on for the legacy `_token` field. `context` is NOT a
// control field: app1-api's captureContext.js builds the submission's
// context column by scanning the body's TOP-LEVEL keys against an
// allowlist (utm_*, gclid, fbclid, referrer, landingUrl, pageUrl,
// userAgent) and explicitly skips any `_`-prefixed key as a control
// field -- so `context` values are spread onto the top level alongside
// `fields`, never nested, or the server drops them silently.
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
   *   request itself -- spread onto the top-level body (never nested);
   *   the server's captureContext.js allowlist only reads top-level keys.
   *   A key here that collides with a `fields` key loses to `fields`.
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
    const body = { ...(context || {}), ...(fields || {}) };
    if (idempotencyKey) body._idempotencyKey = idempotencyKey;
    if (captchaToken) body._captchaToken = captchaToken;

    return internalRequest(
      this.sdk,
      `/f/${publicKey}`,
      'POST',
      { body },
      true,
    );
  }

  /**
   * Upload a file for a `file` inputType field (D21), ahead of the real
   * `submit()` call. Mirrors `webchat.visitor.files.upload()`'s shape:
   * browser-only (needs `FormData`), no progress event. The returned
   * `token` must be echoed back inside `submit()`'s `fields[fieldKey]` as
   * `JSON.stringify({fileId, token})` -- the server (formFileAttach.js)
   * verifies it names this exact (formId, fieldKey, fileId) triple before
   * attaching the file to the submission.
   * @param {string} publicKey
   * @param {string} fieldKey - Must match a `file` inputType field on the form.
   * @param {File|Blob} file
   * @returns {Promise<{fileId:string, token:string, fileName:string, fileType:string, fileSize:number}>}
   */
  async upload(publicKey, fieldKey, file) {
    this.sdk.validateParams(
      { publicKey, fieldKey },
      {
        publicKey: { type: 'string', required: true },
        fieldKey: { type: 'string', required: true },
      },
    );
    if (typeof FormData === 'undefined' || !file) {
      throw new Error(
        'forms.public.upload :: a browser File/Blob and FormData support are required',
      );
    }
    const body = new FormData();
    body.append('fieldKey', fieldKey);
    body.append('file', file);
    return internalRequest(
      this.sdk,
      `/f/${publicKey}/upload`,
      'POST',
      { body },
      true,
    );
  }
}
