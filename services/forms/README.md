# Forms v2 SDK module (`sdk.forms`)

Internal reference for `services/forms.js` + `services/forms/*.js` as they exist in code
today on branch `f-forms-v2` (sdk version `4.13.92`). Not the plan — every claim below is
cited to a source line. See `/workspace/code/app1/plans/forms-v2-plan.md` /
`forms-v2-progress.md` / `forms-v2-precheck.md` for design history; §"Deviations from
plan" at the bottom lists where progress-doc claims and code disagree.

## Files

| File | Exports |
|---|---|
| `services/forms.js` | `FormsService` (registers as `sdk.forms`) |
| `services/forms/PublicService.js` | `FormsPublicService` → `sdk.forms.public` |
| `services/forms/SubmissionsService.js` | `FormsSubmissionsService` → `sdk.forms.submissions` |
| `services/forms/SettingsService.js` | `FormsSettingsService` → `sdk.forms.settings` |
| `services/forms/HealthService.js` | `FormsHealthService` → `sdk.forms.health` |

Registered in `index.js:29` (import), `index.js:129` (`this.forms = new FormsService(this)`),
exported at `index.js:331-333`.

## Methods

| Method | Signature | Returns | Purpose |
|---|---|---|---|
| `sdk.forms.public.submit` | `submit(publicKey: string, fields: Object, { context, captchaToken, idempotencyKey }: Object = {})` | `Promise<{ok: boolean, message?: string}>` | Submit a public form by `publicKey`; `POST /f/:publicKey` |
| `sdk.forms.public.upload` | `upload(publicKey: string, fieldKey: string, file: File\|Blob)` | `Promise<{fileId, token, fileName, fileType, fileSize}>` | Browser-only file upload ahead of `submit()`, for a `file`-type field; `POST /f/:publicKey/upload` |
| `sdk.forms.submissions.reprocess` | `reprocess(id: string)` | `Promise<Object>` | Re-run the pipeline for a stored submission; `POST /object/formSubmissions/:id/reprocess` |
| `sdk.forms.submissions.markNotSpam` | `markNotSpam(id: string)` | `Promise<Object>` | Clear a submission's spam status; `POST /object/formSubmissions/:id/mark-not-spam` |
| `sdk.forms.submissions.resolveReview` | `resolveReview(id: string, choice: string)` | `Promise<Object>` | Resolve an `identityConflict`/`review`-flagged submission; `POST /object/formSubmissions/:id/resolve-review`, body `{choice}` |
| `sdk.forms.settings.get` | `get()` | `Promise<{defaultRegion?, turnstileSiteKey?, turnstileSecretRef?}>` | Read the account-level `formsAccountSettings` singleton; `GET /forms/settings` |
| `sdk.forms.settings.set` | `set(patch: {defaultRegion?, turnstileSiteKey?, turnstileSecret?})` | `Promise<Object>` | Merge-patch the singleton; `turnstileSecret` is plaintext in, never echoed back; `PUT /forms/settings` |
| `sdk.forms.settings.setForm` | `setForm(formId: string, patch: {captchaProvider?, turnstileSiteKey?, turnstileSecret?})` | `Promise<Object>` | Per-form Turnstile override; `PUT /forms/:formId/settings` |
| `sdk.forms.health.get` | `get(formId: string)` | `Promise<{tiles, sparkline, fields, driftAlerts, windowDays}>` | Health tab data (tiles, 30-day sparkline, per-field fill rate, drift alerts); `GET /forms/:formId/health` |
| `sdk.forms.regeneratePublicKey` | `regeneratePublicKey(formId: string)` | `Promise<{publicKey: string}>` | Mint a new `publicKey`, invalidating every embed using the old one (destructive); `POST /forms/:formId/regenerate-key` |
| `sdk.forms.previewToken` | `previewToken(formId: string)` | `Promise<{token: string, expiresIn: number}>` | Mint a signed 15-min draft-preview token; `POST /forms/:formId/preview-token` |

Sources: `PublicService.js:46-100`, `SubmissionsService.js:28-79`, `SettingsService.js:28-72`,
`HealthService.js:28-34`, `forms.js:20-63`.

## Auth model

| Group | Methods | Session/JWT required? | Mechanism |
|---|---|---|---|
| Public | `public.submit`, `public.upload` | No | `internalRequest(..., forceFetch=true)` — `PublicService.js:46-62,77-100` explicitly pass `true` as the 5th arg. No `sdk.token` involved; auth is `publicKey` + server-side origin/domainAllowlist check, not a session (comment `PublicService.js:1-8`, mirrors `WebchatVisitorService`/`VisitorService` pattern). |
| Agent-authenticated | `submissions.*`, `settings.*`, `health.get`, `regeneratePublicKey`, `previewToken` | Yes | `internalRequest(sdk, endpoint, method, {...})` with no `forceFetch`/`httpOnly` flag — routed through the SDK's normal transport (socket/HTTP) using `sdk.token`, same as any other authenticated service call (e.g. `WebchatWidgetsService.get()`). |

`internalRequest`'s `forceFetch` param (`base.js:22-38`) skips optional transports and goes
HTTP-only — used for the two public methods because they're one-shot calls from a visitor
page with no socket session, same convention as file upload/download elsewhere in the SDK.

Both `public.submit` and `public.upload` also pass `credentials: 'omit'` in the request
params (`PublicService.js:46-62,77-100`; consumed by `base.js` `_httpRequest`, which
otherwise defaults browser fetches to `credentials:'include'`). This surface is called
from third-party origins (a marketing site, not an app1 base domain), and app1-api's CORS
only sends `access-control-allow-credentials` for trusted app1 base domains — a browser
rejects the entire response for a `credentials:'include'` fetch when that header is
missing, even though these endpoints don't use cookies for auth. `sdk.webchat.visitor.*`
(`services/webchat/VisitorService.js`) has the same third-party-origin exposure and sets
the same option for the same reason.

**Known SDK-surface gap (not a code bug, documented in-file):** `submissions.*` and
`settings.get/set` call server routes that, per their own doc comments, were not yet built
as of P2 (`SubmissionsService.js:7-16`, `SettingsService.js:7-17` — "GAP (forms-v2 P2) ...
the server-side routes these call do NOT exist yet"). `forms-v2-progress.md` marks P5 done
and lists "forms account settings API" and "reprocess/mark-not-spam/review actions" as
shipped, so these comments are likely stale relative to the API side — the SDK client code
itself was not re-verified against `app1-api` route files in this pass (out of scope: this
README covers the SDK repo only). Flagged in Deviations below.

## Example — browser handler mode (public form submission)

Realistic embed-adjacent usage: a page with its own HTML/`<form>` calling the SDK directly
(the `forms.public` surface backs both the generated embed script and any hand-rolled
integration like this).

```js
import { BaseSDK, internalRequest } from '@unboundcx/sdk/base.js';
import { FormsPublicService } from '@unboundcx/sdk/services/forms/PublicService.js';

// Minimal public-only instance — namespace or a custom baseURL, NEVER sdk.token.
// Importing only base.js + PublicService.js avoids pulling in the full SDK's
// service tree (some of which have bundler-unfriendly static imports that broke
// marketing_unbound_cx's browser build — see CHANGELOG 4.13.90).
const sdk = new BaseSDK({ namespace: 'masterc' });
const forms = new FormsPublicService(sdk);

document.querySelector('#lead-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = new FormData(e.target);

  await forms.submit(
    'PUBLIC_KEY_HERE',
    {
      email: data.get('email'),
      name: data.get('name'),
      interests: data.getAll('interests'), // arrays kept as arrays
    },
    {
      context: {
        utm_source: new URLSearchParams(location.search).get('utm_source'),
        referrer: document.referrer,
        landingUrl: location.href,
      },
      idempotencyKey: crypto.randomUUID(),
    },
  );
});
```

`context` is spread onto the top level of the request body alongside `fields` (not nested
under a `_context` key — that was a bug fixed in 4.13.89, `PublicService.js:10-21` +
CHANGELOG). Control fields (`_idempotencyKey`, `_captchaToken`) are sent with a leading
underscore so the server can distinguish them from real form values (`PublicService.js:51-53`).

## Example — server-side submit (Node)

```js
import UnboundSDK from '@unboundcx/sdk';

// GOTCHA: in Node, UnboundSDK's constructor does NOT use a literal `baseURL` you pass
// unless you pass it explicitly as `options.baseURL` — and even then only via the
// object-form constructor. If you only pass `namespace` (the common case), Node builds
// the URL as `https://<namespace||'login'>.${process.env.API_BASE_URL || 'api.unbound.cx'}`
// (base.js:79-82). So:
//   - No API_BASE_URL env var set  -> requests go to https://masterc.api.unbound.cx (WRONG
//     for dev — hits the real production-shaped host, not dev-d01).
//   - API_BASE_URL is treated as a DOMAIN SUFFIX appended after the namespace, not a full
//     URL override — set it to e.g. `dev-d01.app1svc.com`, not `https://api.dev-d01...`.
process.env.API_BASE_URL = 'dev-d01.app1svc.com';

const sdk = new UnboundSDK({ namespace: 'masterc', token: process.env.AGENT_JWT });

const health = await sdk.forms.health.get('formIdHere');
console.log(health.tiles);

// Public submit also works from Node (no browser needed) since forms.public.submit()
// only requires FormData for upload(), not submit():
await sdk.forms.public.submit('PUBLIC_KEY_HERE', { email: 'test@example.com' });
```

Verified against `base.js:56-82` (`_initializeEnvironment`, Node branch) and
`base.js:107-134` (`setNamespace`, Node branch uses the same `!this._constructorBaseURL`
guard) — this gotcha is still true for this SDK's client construction as of `4.13.92`.
Matches the repo memory note "SDK Node baseURL gotcha."

## Deviations from plan / progress docs

1. **Health service exists but isn't in the precheck's SDK contract.** `forms-v2-precheck.md`
   §5 only specifies `public`, `submissions`, `settings` on `FormsService`; `health` (P8,
   `HealthService.js`) and the two gap-closure methods `regeneratePublicKey`/`previewToken`
   (added directly on `FormsService`, not a sub-service) were added later and aren't in the
   precheck's code sample — expected drift for a precheck doc frozen at P0, not a bug.
2. **`submissions.*` / `settings.get`/`settings.set` carry "route may not exist yet" comments
   still in the source** (`SubmissionsService.js:7-16`, `SettingsService.js:7-17`), even
   though `forms-v2-progress.md` marks P5 ("Captcha gate ... forms account settings API,
   submission reprocess/mark-not-spam/review actions") as done. This README does not resolve
   the discrepancy — it was not in scope to audit `app1-api`'s route files — but flags it as
   a live contradiction between the sdk source comments and the progress ledger. Reported
   back to Cameron per task instructions.
