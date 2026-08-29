import { z } from 'zod';
import { ConditionSpec } from './primitives.js';
import { MustacheTemplate } from './primitives.js';
import { FormatType } from './format.js';
import { JoinSpec } from './join.js';
import { SelectDynamicSpec } from './selectDynamic.js';

const SecurityConfigSpec = z.object({
  editWithoutValue: z.boolean().default(false),
  readOnly: z.boolean().default(false),
  showChars: z.number().int().min(0).optional(),
  hideLength: z.boolean().default(false),
});

const LinkSpec = z.object({
  path: MustacheTemplate,
  tabName: z.string().optional(),
  tabIcon: z.string().optional(),
});

// DEVIATION from spec's literal DISPLAY_FIELD_TYPES list (see SPEC-PHASE-1.md
// A6): added 'select'/'selectDynamic'. Verified against real stored data
// (app1-api/src/services/layouts/examples.json) — display.fieldType commonly
// mirrors edit.fieldType for select-backed fields (5 occurrences of
// display.fieldType:'selectDynamic' in the two-doc fixture); the literal spec
// list omitted them, which would warn on effectively every select field in
// production data — a false-positive, not the genuine defect this schema is
// meant to surface. Flagged for reviewer per task instructions.
const DISPLAY_FIELD_TYPES = [
  'input', 'textArea', 'code', 'readOnly', 'spacer', 'composite',
  'select', 'selectDynamic',
  'securityBlurHover', 'securityBlurAlways', 'securityLastX', 'securityFirstX', 'securityFirstLastX',
];

const FieldDisplaySpec = z.object({
  label: z.string().default(''),
  value: z.string().min(1),                       // dot-path ok, e.g. "company.name"
  fieldType: z.enum(DISPLAY_FIELD_TYPES),
  formatType: FormatType.optional(),
  format: z.string().optional(),
  relatedKey: z.string().optional(),
  relatedObject: z.string().optional(),
  code: z.object({
    language: z.string().default('plaintext'),
    width: z.string().optional(),
    height: z.string().optional(),
  }).optional(),
  securityConfig: SecurityConfigSpec.optional(),
  link: LinkSpec.optional(),
});

const SelectStaticSpec = z.object({
  options: z.array(z.object({ name: z.string(), value: z.string() })).optional(),
  optionSource: z.string().optional(),             // e.g. 'local.timezones', resolved by client static-option registry
}).refine((v) => (v.options && v.options.length > 0) || v.optionSource, {
  message: 'select requires options[] or optionSource',
});

const EditEntrySpec = z.object({
  field: z.string().min(1),
  label: z.string().optional(),
  required: z.boolean().default(false),
  editableOnCreateOnly: z.boolean().default(false),
  hiddenOnCreate: z.boolean().default(false),
  fieldType: z.enum(['input', 'select', 'selectDynamic', 'textArea', 'code', 'spacer']),
  fieldTypeSub: z.enum(['text', 'email', 'tel', 'url', 'number', 'date', 'datetime-local', 'time']).optional(),
  placeholder: z.string().optional(),
  textArea: z.object({ rows: z.number().int().positive().default(4) }).optional(),
  code: z.object({ language: z.string().default('plaintext') }).optional(),
  select: z.union([SelectStaticSpec, SelectDynamicSpec]).optional(),
}).superRefine((v, ctx) => {
  if (v.fieldType === 'select' && !v.select) {
    ctx.addIssue({ code: 'custom', message: 'select fieldType requires select config', path: ['select'] });
  }
  if (v.fieldType === 'selectDynamic' && !(v.select && 'queryConfig' in v.select)) {
    ctx.addIssue({ code: 'custom', message: 'selectDynamic fieldType requires SelectDynamicSpec (queryConfig)', path: ['select'] });
  }
});

// `component` stays z.string() (open), not a closed enum — see ASSUMPTION in
// §7 re: Open Decision #4 (component roadmap not yet settled).
export const FieldSpec = z.object({
  id: z.string().min(1),
  type: z.enum(['content', 'component', 'empty']),
  object: z.string().optional(),
  hideOnCreate: z.boolean().default(false),
  conditions: ConditionSpec.optional(),
  join: JoinSpec.optional(),                        // only meaningful when type:'component'
  component: z.string().optional(),
  componentConfig: z.record(z.unknown()).optional(), // NOT type-checked here — see Risks §7
  display: FieldDisplaySpec.optional(),
  edit: z.union([EditEntrySpec, z.array(EditEntrySpec)]).optional(), // array = composite (defect #7 contract)
}).superRefine((v, ctx) => {
  if (v.type === 'content' && !v.object) {
    ctx.addIssue({ code: 'custom', message: 'content field requires object', path: ['object'] });
  }
  if (v.type === 'component' && !v.component) {
    ctx.addIssue({ code: 'custom', message: 'component field requires component', path: ['component'] });
  }
  if (v.display?.fieldType === 'composite' && !Array.isArray(v.edit)) {
    ctx.addIssue({ code: 'custom', message: 'composite fieldType requires edit as an array', path: ['edit'] });
  }
});
