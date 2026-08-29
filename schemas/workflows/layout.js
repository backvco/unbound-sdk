import { z } from 'zod';
import { HeaderSpec } from '../layouts/primitives.js';
import { Conditional, InfoSpec, RepeatingSpec } from './primitives.js';
import { EditEntrySpec } from './editEntry.js';

// Column display metadata — the read-only mirror of an edit entry. `value`
// is the dotted/bracketed path read for display; it may intentionally
// diverge from `edit.field` (webHook.js's `relatedObject`/`relatedKey`
// pattern, maps.md module-defs §3 — a legitimate divergence, contrast with
// the buggy field/default mismatches lint.js catches).
const FieldDisplaySpec = z.object({
  type: z.string().optional(),
  label: z.string().optional(),
  value: z.string().optional(),
  format: z.string().optional(),
  fieldType: z.string().optional(),
  relatedObject: z.string().optional(),
  relatedKey: z.string().optional(),
}).passthrough();

export const ModuleColumn = z.object({
  type: z.string().optional(),
  object: z.enum(['workflowItems', 'workflowItemSettings']).optional(),
  conditional: Conditional.optional(),
  display: FieldDisplaySpec.optional(),
  // array form = composite/multi-field column (sendEmail.js's conditional
  // Value columns switching on templateVariables[].type, scriptPage.js's
  // Row 2 richText/text type-switch)
  edit: z.union([EditEntrySpec, z.array(EditEntrySpec)]).optional(),
}).passthrough();

export const ModuleRow = z.object({
  // row-level repeating exists (bot.js dataCollectionFields) alongside
  // section-level repeating — both forms seen live, modeled independently
  // rather than assuming one supersedes the other.
  repeating: RepeatingSpec.optional(),
  columns: z.array(ModuleColumn).default([]),
}).passthrough();

// `label` (plain section header text) and `tabLabel` (groups this section
// under a tab whose anchor is an earlier section's own id/label string
// match) are two distinct, coexisting mechanisms — maps.md module-defs §3's
// "tabbing model is inconsistent and undeclared as a concept" finding.
// Both modeled as-is; unifying them into one first-class `tabs` concept is
// out of scope for this schema pass (tracked in design-schema-first.md §3).
export const ModuleSection = z.object({
  id: z.string().min(1),
  label: z.string().optional(),
  tabLabel: z.string().optional(),
  header: HeaderSpec.partial().optional(),
  conditional: Conditional.optional(),
  info: InfoSpec.optional(),
  repeating: RepeatingSpec.optional(),
  showCollapse: z.boolean().optional(),
  autoCollapse: z.boolean().optional(),
  rows: z.array(ModuleRow).default([]),
}).passthrough();

export const ModuleLayoutSpec = z.object({
  sections: z.array(ModuleSection).default([]),
}).passthrough();
