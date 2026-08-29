import { z } from 'zod';

// Every fieldType literal observed across constants/workflows/*.js
// (verified via grep against all 29 files, not the idealized §2 list).
// Exported as a plain const rather than baked into a closed zod enum so
// validateModuleSpec stays permissive of any future fieldType a module
// author adds — lint.js is where "is this fieldType one we actually
// render" opinions live (e.g. rejecting 'switch').
export const KNOWN_FIELD_TYPES = [
  'input', 'select', 'selectDynamic', 'textArea', 'code', 'codeEditor',
  'checkbox', 'switch', 'button', 'routingPicker', 'timeControl', 'spacer',
];

const ButtonSpec = z.object({
  label: z.string().optional(),
  icon: z.string().optional(),
  style: z.string().optional(),
  action: z.string().optional(),
  modalTitle: z.string().optional(),
  settingsFields: z.array(z.string()).optional(),
}).passthrough();

// select/selectDynamic config kept open (record) rather than a closed
// shape: static `{options:[{name,value}]}` and dynamic
// `{url,response,clearable,searchable,fetchOptions,...}` forms coexist
// per-field, plus module-specific extras (lookup.js's
// describeObject/dependsOn cascade, sendEmail.js's `{{settings.x}}`
// templated `url`, webHook.js's `display.relatedObject`/`relatedKey`
// divergence). Structural typing of this shape is deliberately deferred —
// same call the layouts schema package made for `componentConfig`.
const SelectConfigSpec = z.record(z.unknown());

// `edit[].field` is the one contract this whole package must never change
// the shape of: it is the exact dotted/bracketed JSON-path string the
// JSON_SET-style query builder in
// app1-api/.../customHandlers/update/workflowItemSettings.js consumes
// (`settings.<ns>.*` / `phone.*` / `messaging.*`, 'delete' array sentinel).
// This schema shape-checks it (non-empty string) and never parses/rewrites
// it.
export const EditEntrySpec = z.object({
  field: z.string().min(1),
  label: z.string().optional(),
  helpText: z.string().optional(),
  required: z.boolean().optional(),
  placeholder: z.string().optional(),
  fieldType: z.string().min(1),
  fieldTypeSub: z.string().optional(),
  value: z.string().optional(),
  format: z.string().optional(),
  select: SelectConfigSpec.optional(),
  textArea: z.record(z.unknown()).optional(),
  code: z.record(z.unknown()).optional(),
  codeEditor: z.record(z.unknown()).optional(),
  button: ButtonSpec.optional(),
  routingPicker: z.record(z.unknown()).optional(),
  variableSources: z.array(z.unknown()).optional(),
  templateIdField: z.string().optional(),
  emojiPicker: z.boolean().optional(),
}).passthrough();
