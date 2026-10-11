# app1-simulator internal contract

Routes implemented by `app1-api` (simulator-plan.md §14, routes B, C, G) and
consumed by the `app1-simulator` controller via `@unboundcx/sdk`'s
`sdk.internal.sim` service (`services/internal/SimService.js`).

**Auth:** every route is `checkInternalApiAuth` (bearer JWT signed with
`JWT_INTERNAL_API_KEY` — same mechanism as `app1-ai-bot`'s
`buildInternalApiAuth` / `bot-user-token`), gated server-side by
`SIM_ENABLED` (string `'1'` or `'true'`; unset ⇒ 404/403, no-op, byte-identical
to current behaviour). `mode`, `dids` and `purge` are **additionally** gated
by a per-env `SIM_ALLOWED_ACCOUNTS` allowlist and server-side pattern
enforcement (never trust the caller). Fail closed on any uncertainty.

**Sim patterns** (`@unboundcx/sdk`'s `simRules`, root export + `sdk.simRules`):
- `SIM_NUMBER_RE = /^\+1555\d{7}$/` — NPA 555, unassignable in the NANP.
- Sim emails end `@sim.invalid` (`SIM_EMAIL_DOMAIN`, RFC 2606).

---

## POST /internal/sim/mode

Turn on account SIM MODE (simulator-plan.md §5): Redis key
`sim:mode:<accountId>` (`simRules.simModeKey`), **unprefixed** — the
queue-messaging worker must re-check it with a Redis client that has no
`keyPrefix`. TTL-based; the controller heartbeats this every 30s.

Request:
```json
{ "accountId": "009xyz...", "ttlSeconds": 120 }
```
- `accountId` (string, required)
- `ttlSeconds` (number, optional, default 120)

Response `200`:
```json
{ "accountId": "009xyz...", "mode": "on", "expiresAt": "2026-10-11T22:05:00.000Z" }
```

Errors: `400` missing/invalid `accountId`; `403` `SIM_ENABLED` unset, or
`accountId` not in `SIM_ALLOWED_ACCOUNTS`.

---

## DELETE /internal/sim/mode?accountId=...

Clear SIM MODE for an account (called on FORCING).

Response `200`:
```json
{ "accountId": "009xyz...", "mode": "off" }
```

Errors: same as POST.

---

## GET /internal/sim/mode?accountId=...

Current SIM MODE state.

Response `200`:
```json
{ "accountId": "009xyz...", "mode": "on", "expiresAt": "2026-10-11T22:05:00.000Z" }
```
or
```json
{ "accountId": "009xyz...", "mode": "off", "expiresAt": null }
```

---

## POST /internal/sim/dids

Provision sim DIDs with no Telnyx call (simulator-plan.md §7.3): inserts a
global `phoneNumbers` row (`carrier:'sim'`, `status:'active'`) **and** the
matching `{acct}.phoneNumbers_acct` row per number. Refuses any
`phoneNumber` that doesn't match `SIM_NUMBER_RE`.

Request:
```json
{
  "accountId": "009xyz...",
  "numbers": [
    {
      "phoneNumber": "+15551234567",
      "voiceApp": "queues",
      "voiceAppMetaData": "009queueId...",
      "textApp": "queues",
      "textAppMetaData": "009queueId..."
    }
  ]
}
```
- `accountId` (string, required)
- `numbers` (array, required, 1+) — each item:
  - `phoneNumber` (string, required, must match `SIM_NUMBER_RE`)
  - `voiceApp` / `voiceAppMetaData` (string, optional)
  - `textApp` / `textAppMetaData` (string, optional)

Response `200`:
```json
{
  "created": [
    { "id": "009did...", "phoneNumber": "+15551234567", "accountId": "009xyz..." }
  ]
}
```

Errors: `400` any `phoneNumber` fails `SIM_NUMBER_RE` (whole request
rejected, nothing partially inserted); `403` `SIM_ENABLED` unset or
`accountId` not allowlisted.

---

## GET /internal/sim/dids?accountId=...

List sim DIDs provisioned for an account (`carrier:'sim'`).

Response `200`:
```json
{
  "dids": [
    { "id": "009did...", "phoneNumber": "+15551234567", "voiceApp": "queues", "voiceAppMetaData": "009queueId..." }
  ]
}
```

---

## POST /internal/sim/purge

Tear down everything a run created — pattern- and run-scoped only
(simulator-plan.md §7.1, §8). `dryRun: true` reports what *would* be
deleted without deleting it.

Request:
```json
{ "accountId": "009xyz...", "runId": "run_abc123", "dryRun": false }
```
- `accountId` (string, required)
- `runId` (string, optional — omit to purge by pattern only, all sim data
  on the account)
- `dryRun` (boolean, optional, default false)

Response `200`:
```json
{
  "dryRun": false,
  "counts": {
    "users": 4,
    "endpoints": 8,
    "extensions": 4,
    "mailboxes": 4,
    "voicemailBoxes": 4,
    "workers": 4,
    "authzRows": 4,
    "chatMemberships": 4,
    "userStatus": 4,
    "licenses": 4,
    "people": 500,
    "companies": 60,
    "channels": 1120,
    "dids": 6,
    "tasks": 812,
    "cdr": 340
  },
  "leaks": []
}
```
`leaks` (array, optional) lists rows matched by pattern that purge could
not remove (surfaced for the controller's DONE_WITH_LEAKS screen), e.g.:
```json
{ "table": "cdr_temp", "id": "...", "reason": "no platform delete path" }
```

Guarantee: purge only ever touches `@sim.invalid` users, people/companies
whose channels are all sim-pattern, `SIM_NUMBER_RE` DIDs, and tasks/cdr
tagged by `runId` or matching the pattern. It never issues raw SQL against
unscoped rows.

---

## POST /internal/auth/sim-user-token

Agent bearer token without a password/email (clone of `bot-user-token`;
simulator-plan.md §14-B). Gated `SIM_ENABLED` + `userId` must resolve to a
`@sim.invalid` user in the sim agents group.

Request:
```json
{ "userId": "009user...", "accountId": "009xyz..." }
```

Response `200`:
```json
{ "token": "eyJhbGciOi...", "expiresAt": "2026-10-12T22:05:00.000Z" }
```

Errors: `400` missing params; `403` `SIM_ENABLED` unset, user not
`@sim.invalid`, or user not in the sim agents group; `404` unknown
`userId`/`accountId`.

---

## POST /internal/sms/sim-inbound

Inject an inbound SMS/MMS through the real `inboundSmsMms` routine —
never the unverified public webhook (simulator-plan.md §5). `to` must be a
`carrier:'sim'` DID on some account; `from` must match `SIM_NUMBER_RE`.

Request:
```json
{
  "to": "+15551234567",
  "from": "+15559876543",
  "text": "When can someone come out?",
  "mediaUrls": []
}
```
- `to` (string, required) — a provisioned sim DID
- `from` (string, required, must match `SIM_NUMBER_RE`)
- `text` (string, optional)
- `mediaUrls` (array of string, optional)

Response `200`:
```json
{ "taskId": "009task...", "messageId": "009msg..." }
```

Errors: `400` `to` not a sim DID, or `from` fails `SIM_NUMBER_RE`; `403`
`SIM_ENABLED` unset.

---

## POST /internal/email/sim-inbound

Inject an inbound email through `ingestRawEmail` (factored out of
`inboundEmail.js` steps 3-7; real thread/attachments/body — simulator-plan.md
§5, §14-C). `receivedAddress` must be a sim DID's mailbox address; the
`From:` header inside `rawMime` must be `@sim.invalid`.

Request:
```json
{
  "receivedAddress": "sim-queue-plumbing@masterc.unbound.cx",
  "rawMime": "From: customer123@sim.invalid\r\nTo: sim-queue-plumbing@masterc.unbound.cx\r\nSubject: Quote request\r\n\r\nBody text"
}
```
- `receivedAddress` (string, required)
- `rawMime` (string, required) — full raw MIME message

Response `200`:
```json
{ "taskId": "009task...", "messageId": "009msg..." }
```

Errors: `400` `receivedAddress` not a sim mailbox, or `From:` in `rawMime`
isn't `@sim.invalid`; `403` `SIM_ENABLED` unset.
