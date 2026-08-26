## 4.13.3

- feat: `sdk.storage` account/record settings (`getAccountSettings`, `updateAccountSettings`, `listRecordSettings`, `getRecordSettings`, `updateRecordSettings`, `getRecordGoogleFolder`); upload/`createFolder` accept `objectName`
- feat: `sdk.drive.listDrives`; `resolvePath` accepts `objectName` / `relatedId`

## 4.13.2

- feat: `sdk.phoneNumbers.generateLoa` takes `mode` (`send`|`present`) and optional `signerEmail` / `signerTitle`; returns the signing package (`presentUrl` on present)

## 4.13.0

- feat: `sdk.ai.email` — `generate`, `rewrite`, `subjects`, `altText`
  (`POST /ai/email/{generate,rewrite,subjects,alt-text}`)

## 4.12.0

- feat: `sdk.messaging.email.templates` v2 — `autosave`, `listVersions`,
  `restoreVersion`; `create`/`update`/`list` accept `design`, `appearance`,
  usage flags; `preview` may return `unresolvedTags`
- feat: `sdk.brand.kits` — CRUD, `get`, `setDefault`, URL `extract`
- feat: `sdk.content.blocks` CRUD; `sdk.content.library` list/get/create;
  `sdk.content.stock` unsplash/pexels/giphy search + import

## 4.11.0

- feat: `sdk.messaging.email.templates.preview(id, body)` and `.sendTest(id, to, body?)`

## 4.10.2

- fix: storage/drive PATCH goes over socket/NATS again (revert HTTP forceFetch)

## 4.10.1

- fix: storage/drive PATCH methods use HTTP (`forceFetch`) — socket has no PATCH

## 4.10.0

- feat: `sdk.storage` folder CRUD (`listFolders`, `createFolder`, `updateFolder`,
  `deleteFolder`), `moveFiles`, `updateFileMetadata` → `PATCH /storage/files/:id`
- feat: `listFiles` query `relatedId` / `folderId` / `search` / `page` / `sortBy`
- feat: `sdk.drive` — Google Drive proxy (`status`, list/upload/folder/file,
  `browserToken`)

## 4.8.13

- feat: `sdk.chat` threads, bots, channel-meet create/update/slug/password,
  group default channels; `sendMessage` accepts `tools` / `toolConfig`

## 4.8.12

- feat: `sdk.recents` (`list`, `smsThread`, `stats`, `transcribeVoicemail`)
  — HTTP `/recents`

## 4.8.10

- feat: `sdk.messaging.email.mailboxes.createFolder` / `renameFolder` /
  `deleteFolder` — custom and nested mailbox folders
- feat: `sdk.recents.list` filters (`startDate`, `endDate`, `q`, `direction`,
  `missed`, `hasRecording`, `hasTranscription`) and meeting stats
- feat: `sdk.directory.listContacts` / `addContact` / `removeContact`;
  favorites accept `user`/`queue` plus `channelId`/`numberField`
- feat: `sdk.taskRouter.cc` (`getScope`, `getSnapshot`, `getSessions`) and
  `sdk.taskRouter.metrics.getWindow`
- feat: meet personal-room methods on `sdk.video`; `statusWebhook` on
  `sdk.voice.call`
- fix: HTTP error bodies parse via `json()`/`text()` so API `{ message }`
  is not swallowed as a generic "API Error"

## 4.6.0

- feat: `sdk.objects.listGoogleAdAccounts` / `listGoogleAdCampaigns` /
  `listMetaAdAccounts` / `listMetaAdCampaigns` — ad-catalog pickers
  (`GET /object/ad-catalog/{google|meta}/{accounts|campaigns}`)
- feat: `sdk.externalOAuth.verify(id, { purpose })` — Ads connection
  check; `authorize` accepts `fromConnectionId` to reuse credentials
- feat: `sdk.triggers` — CRUD for object-change triggers (`list`,
  `listObjects`, `get`, `create`, `update`, `delete`/`remove`,
  `setStatus`, `listFires`)
- feat: `skipTriggers` on `objects.create` / `update` / `updateById` /
  `delete` / `deleteById` (query flag; default false so triggers run)
- feat: `schemas/workflows/` — new Zod schema package, sibling of
  `schemas/layouts/`, for the Workflow Builder v2 `ModuleSpec` contract
  (`WORKFLOW-V2-PLAN.md` Phase 2): identity (`type`/`category`/
  `moduleSchemaVersion`), presentation colors, `PortSpec` (`ports[]`,
  `isHidden`/`isMultiple`/`isLocked`/`isConnectionDeletable`), `editWidth`,
  `CapabilitiesSpec` (`deletable`, `hiddenFromPicker`, `dynamicPorts`,
  `spawnsChildItems`, `outputVariables`, `excludedFromVariableExtraction`,
  `dataProducer`, `simulatable`, `customEditor` — replaces the ad hoc
  type-string branches and the separate `DATA_PRODUCER_TYPES` registry),
  `SettingsSchemaSpec` (`namespace`/`defaults`), and a `layout` shape
  (`ModuleSection`/`ModuleRow`/`ModuleColumn`/`EditEntrySpec`) modeled
  against the 29 real files in
  `app1-api/.../constants/workflows/*.js` — not the idealized sketch — since
  the real layout/defaults tree nests under `settings.layout`/
  `settings.<namespace>`, not as top-level siblings
- feat: `Conditional` (`{field, operator?, value}`, `operator` default
  `'equals'`) — accepts the legacy `{field, value}` shorthand used by ~28 of
  29 modules via preprocessing; the one explicit-operator occurrence
  (`sendEmail.js`'s `operator: 'not_empty'`) validates unchanged
- feat: `validateModuleSpec(spec)` → `{valid, errors[]}` — structural
  validity; `capabilities`/`settingsSchema`/`moduleSchemaVersion` are fully
  additive, so every currently-shipping module constant validates
  unmodified with none of them present
- feat: `lintModuleSpec(spec)` → `{valid, errors[]}` — extra authoring
  rules: `category-required`; `boolean-widget-checkbox` (rejects
  `fieldType: 'switch'`, which has no renderer — the confirmed
  `peopleCompanyLink.js` gap); `settings-namespace-match` (every
  `edit[].field`'s `settings.<ns>` root must match the module's declared
  `settingsSchema.namespace` — mechanically catches the live
  `aBRouting.js` field/default mismatch and `update.js`'s
  copy-pasted-and-never-renamed defaults bug class, only once a module has
  opted into `settingsSchema`)
- No execution-side change: module `type`/`category`/`edit[].field` path
  strings are unmodified by this package — see design-schema-first.md §5 /
  design-incremental-risk.md §5 for the preserved execution contract

## 4.5.0

- schemas/layouts: `orderBy` accepts multi-column ordering — a single `{field, direction}` or an ordered array (`OrderByListSpec`). Existing single-object layouts remain valid.

## 4.4.0

- feat: `sdk.layouts.schema.migrateV1toV2(layoutJson, ctx?)` — the real
  v1→v2 document migration (Phase 1 shipped the registry scaffold and a
  join/kanban/actions-derivation first pass; this completes it per
  SPEC-PHASE-5.md §2.1): canonicalizes `object`/`objectName` (drops
  `object`, flags drift); wraps legacy flat single-table sections into
  `tables[]` field-for-field; normalizes table/component joins to canonical
  `JoinSpec` `{childField, parentField}`, leaving non-trivial templates or
  missing/empty FK columns untouched (tagged in `changes[]`, not silently
  guessed); retags `type:"table"` sections that actually hold a kanban
  block to `"table-kanban"` so the kanban config isn't silently dropped by
  validation; promotes qualifying `tables[]` entries (child object, clean
  join, non-empty fields) to `RelatedListSpec`, additive alongside
  `tables[]` — never a replacement — with their `create` action promoted to
  a section-placed `ActionSpec` on the layout's `actions[]`
- feat: `sdk.layouts.schema.migrateToLatest(json, fromVersion, ctx?)`,
  `MIGRATIONS`, `CURRENT_SCHEMA_VERSION` — the versioned migration-runner
  contract from SPEC-PHASE-5.md §2.1 (`migrateLayoutSchema(doc)` stays as
  the documented one-liner, now implemented on top of `migrateToLatest`)
- feat: `RelatedListSpec` is now wired into `SectionSpec` — new
  `relatedLists: RelatedListSpec[]` field on `TableSection`/
  `TableKanbanSection` (additive, defaults `[]`), resolving Phase 1's
  "Open Decision #5" (`relatedList.js`) as additive rather than folding
  `tables[]` away
- fix: every `migrateV1toV2`/`migrateToLatest` step now returns
  `{json, schemaVersion, changes}` (was: the raw migrated doc) — `changes[]`
  is the human-readable log the backfill sweep and migration-preview tool
  (Phase 5 API work) need; this is a breaking change to the previous
  in-progress (unreleased-behavior) return shape, not to any documented 4.3.0
  API
- docs: regenerated `schemas/layouts/SCHEMA.md` for the `relatedLists`
  field addition (`npm run docs:layouts`)

## 4.3.0

- feat: `sdk.layouts.resolve({object, kind, recordId?, recordTypeId?, asUser?})` —
  hot-path read against the new `GET /layouts/resolve` resolution endpoint,
  returns `{ layoutId, schemaVersion, layout, resolution }`
- feat: `sdk.layouts.getVersions(layoutId)`, `sdk.layouts.getForEdit(layoutId)`,
  `sdk.layouts.publish(layoutId, {changeNote?})`,
  `sdk.layouts.rollback(layoutId, version)` — draft/publish/rollback version
  history API
- feat: `sdk.layouts.assignments.{list,create,update,delete}` — new
  `LayoutAssignmentsService`, exposed as `sdk.layouts.assignments.*`, for the
  `layoutAssignments` resolution-matrix CRUD (`objectName`/`kind` wire keys,
  per Phase 2 spec)
- `sdk.layouts.get/create/update/delete/dynamicSelectSearch` unchanged — same
  routes, response shape only additively gains `resolution` server-side

## 4.2.0

- feat: `sdk.layouts.schema.*` — canonical Zod schema package for the layout
  JSON contract (`LayoutDoc`, `CompactLayoutDoc`, `SectionSpec`, `FieldSpec`,
  `FormatSpec`, `JoinSpec`, `SelectDynamicSpec`, `KanbanConfigSpec`, plus two
  new first-class primitives: `RelatedListSpec`, `ActionSpec`)
- feat: `sdk.layouts.schema.validateLayoutDoc(doc, { type? })` and
  `sdk.layouts.schema.migrateLayoutSchema(doc)` — pure, additive
  `schemaVersion:1 → 2` migration registry
- feat: also importable without an SDK instance —
  `import * as layoutSchemas from '@unboundcx/sdk/schemas/layouts'`
- chore: adds `zod` as the package's first real runtime dependency
  (`zod-to-json-schema` is a docs-only devDependency, not published)
- docs: generated schema reference at `schemas/layouts/SCHEMA.md`
  (`npm run docs:layouts` to regenerate)

## 4.0.7

- feat: `updateRoomBot` accepts `recordingAssetStatus` (none|processing|ready_webm|ready_mp4|failed)

# SDK Changelog

## v2.6.0 (LOA Generation & Enhanced Document Management)

### ✨ NEW FEATURES - Automated LOA Generation

**`generateLoa(params)` - NEW METHOD**

- ✅ **NEW**: Automated Letter of Authorization (LOA) generation
- ✅ **Template Processing**: Uses RTF template with variable replacement
- ✅ **PDF Generation**: Creates professional PDF with digital signature
- ✅ **Auto-Upload**: Uploads to Storage API and attaches to porting order
- ✅ **Brand Integration**: Uses brand information and order data automatically

```javascript
// Generate and attach LOA automatically
const result = await sdk.phoneNumbers.generateLoa({
  portingOrderId: 'port-123',
  signerName: 'John Smith',
  signerTitle: 'IT Director',
});

console.log(result);
// {
//   success: true,
//   loaDocumentId: "doc-456",
//   storageId: "file-789",
//   filename: "loa-port-123-1640995200000.pdf",
//   message: "Letter of Authorization generated and attached successfully"
// }
```

**Enhanced `attachPortingDocument(params)`**

- ✅ **Document Replacement**: Auto-replaces existing documents of same type
- ✅ **File Clearing**: Support for `storageId: null` to clear files
- ✅ **Action Tracking**: Returns `action: "created"/"updated"` status

### Technical Features

- **Template Variables**: Supports comprehensive variable replacement
  - **Brand**: `{{BRAND_LOGO}}`, `{{BRAND_NAME}}`
  - **Customer**: `{{NUMBER_PORT_ORDER_ACCOUNT_NAME}}`, `{{NUMBER_PORT_ORDER_STREET_ADDRESS}}`
  - **Address**: `{{NUMBER_PORT_ORDER_CITY}}`, `{{NUMBER_PORT_ORDER_STATE}}`, `{{NUMBER_PORT_ORDER_ZIP_CODE}}`
  - **Service**: `{{NUMBER_PORT_ORDER_CURRENT_CARRIER}}`, `{{NUMBER_PORT_ORDER_BTN}}`, `{{NUMBER_PORT_ORDER_NUMBERS}}`
  - **Signature**: `{{SIGNATURE}}`, `{{PERSON_NAME}}`, `{{PERSON_TITLE}}`, `{{DATE}}`
- **RTF Processing**: Extracts content from RTF templates
- **PDF Styling**: Professional formatting with signature fonts
- **Storage Integration**: Seamless upload and attachment workflow

### Usage Examples

**Complete LOA Workflow:**

```javascript
// 1. Create porting order
const order = await sdk.phoneNumbers.createPortingOrder({
  customerReference: 'CUST-123',
  endUser: {
    admin: { entityName: 'Acme Corp' },
    location: { streetAddress: '123 Main St' },
  },
});

// 2. Add phone numbers
await sdk.phoneNumbers.checkPortability({
  phoneNumbers: ['+15551234567'],
  portingOrderId: order.id,
});

// 3. Generate LOA automatically
const loa = await sdk.phoneNumbers.generateLoa({
  portingOrderId: order.id,
  signerName: 'John Smith',
  signerTitle: 'IT Director',
});

// LOA is now generated, uploaded, and attached to order
```

### Benefits

- 🚀 **One-Click Generation**: Complete LOA workflow in single API call
- 📄 **Professional PDFs**: Clean formatting with signature styling
- 🔄 **Auto-Integration**: Seamlessly integrates with existing porting workflow
- 🎨 **Brand Aware**: Uses brand information automatically
- 💾 **Persistent Storage**: Documents stored with 1-year retention

---

## v2.5.0 (Enhanced Phone Number Porting)

### ✨ NEW FEATURES - Two-Phase Validation System

**`checkPortability(params)` Enhanced**

- ✅ **NEW**: `runPortabilityCheck` parameter (boolean, default: false)
- ✅ **ENHANCED**: Two-phase validation system for better performance and UX
- ✅ **ENHANCED**: Internal LRN lookup for instant carrier/compatibility validation
- ✅ **ENHANCED**: Improved compatibility rules for US/Canada vs international numbers

#### Phase 1: Internal Validation (Default)

```javascript
// Fast internal validation using LRN lookup
await sdk.phoneNumbers.checkPortability({
  phoneNumbers: ['+15551234567'],
  portingOrderId: order.id,
  // runPortabilityCheck: false (default)
});
```

**Benefits:**

- 🚀 **Instant Results**: No external API calls
- 🛡️ **Smart Validation**: Checks ownership, duplicates, carrier compatibility
- 📱 **Better UX**: Immediate feedback on number compatibility
- 💰 **Cost Effective**: Reduces external API usage

#### Phase 2: External Validation (Optional)

```javascript
// Run full external portability check when ready
await sdk.phoneNumbers.checkPortability({
  phoneNumbers: ['+15551234567'],
  portingOrderId: order.id,
  runPortabilityCheck: true,
});
```

#### Compatibility Rules Updated

- **US/Canada**: Mobile, landline, local numbers can be grouped; toll-free separate
- **International**: Each number type must be in separate orders
- **Carrier Matching**: All numbers must be from same carrier/SPID

#### Database Fields Enhanced

- `currentProvider`: SPID carrier name from LRN lookup
- `country`: Extracted from phone number format
- `phoneNumberType`: From LRN lookup
- `portabilityStatus`: 'pending' → 'portable'/'not-portable'/'error'

#### Migration Guide

No breaking changes - existing code continues to work. New `runPortabilityCheck` parameter is optional and defaults to `false`.

**Recommended Usage:**

```javascript
// Step 1: Add numbers with internal validation (draft phase)
await sdk.phoneNumbers.checkPortability({
  phoneNumbers: ['+15551234567', '+15559876543'],
  portingOrderId: order.id,
});

// Step 2: Run external validation before submission
await sdk.phoneNumbers.checkPortability({
  phoneNumbers: ['+15551234567', '+15559876543'],
  portingOrderId: order.id,
  runPortabilityCheck: true,
});
```

---

## v2.4.0 (Breaking Changes)

### 🚨 BREAKING CHANGES - Phone Number Porting

**Overview**: Phone number management in porting orders has been completely redesigned for better data integrity and validation.

#### Changed Methods

**`createPortingOrder(params)`**

- ❌ **REMOVED**: `phoneNumbers` parameter
- ❌ **REMOVED**: `phoneNumberBlocks` parameter
- ❌ **REMOVED**: `phoneNumberConfiguration` parameter
- ✅ **KEPT**: `customerReference`, `endUser`, `activationSettings`, `tags`

**`updatePortingOrder(id, params)`**

- ❌ **REMOVED**: `phoneNumbers` parameter
- ❌ **REMOVED**: `phoneNumberBlocks` parameter
- ❌ **REMOVED**: `phoneNumberConfiguration` parameter
- ✅ **KEPT**: `customerReference`, `endUser`, `activationSettings`, `tags`

**`checkPortability(params)`**

- ✅ **NEW**: `portingOrderId` parameter (optional)
- ✅ **ENHANCED**: Now validates number compatibility and saves to orders
- ✅ **ENHANCED**: Prevents duplicate numbers and incompatible number mixing

#### Migration Guide

**Before (v2.3.x):**

```javascript
// Old way - phone numbers in order creation
const order = await sdk.phoneNumbers.createPortingOrder({
  phoneNumbers: ['+15551234567', '+15559876543'],
  customerReference: 'CUST-123',
  endUser: { admin: { entityName: 'My Company' } },
});
```

**After (v2.4.0):**

```javascript
// Step 1: Create empty order
const order = await sdk.phoneNumbers.createPortingOrder({
  customerReference: 'CUST-123',
  endUser: { admin: { entityName: 'My Company' } },
});

// Step 2: Add validated phone numbers
await sdk.phoneNumbers.checkPortability({
  phoneNumbers: ['+15551234567', '+15559876543'],
  portingOrderId: order.id,
});

// Step 3: Get complete order with numbers
const completeOrder = await sdk.phoneNumbers.getPortingOrder(order.id);
```

#### New Validations

`checkPortability()` now validates:

- ✅ **Ownership**: Numbers not already owned by account
- ✅ **Availability**: Numbers not in other active porting orders
- ✅ **Compatibility**: Numbers compatible for same order (country, type, SPID, FastPort)

**Compatibility Error Example:**

```javascript
try {
  await sdk.phoneNumbers.checkPortability({
    phoneNumbers: ['+15551234567'], // US local
    portingOrderId: 'existing-order-with-uk-numbers',
  });
} catch (error) {
  // Error: "Cannot add these numbers to the existing porting order.
  // Numbers differ in: country. Please create a separate porting order."
}
```

#### Benefits

- 🛡️ **Data Integrity**: Only validated Telnyx data saved
- 🚫 **Prevents Errors**: Blocks incompatible number combinations
- 🔄 **Real-time Counts**: Phone number counts always accurate
- 📱 **Better UX**: Clear error messages guide users

#### Required Frontend Changes

1. **Update Order Creation Flow**: Remove phone numbers from initial creation
2. **Add Validation Step**: Use `checkPortability` with `portingOrderId`
3. **Handle New Errors**: Show compatibility error messages to users
4. **Update Number Management**: Use dedicated flow for adding/removing numbers

---

_For questions or migration support, contact the API team._
