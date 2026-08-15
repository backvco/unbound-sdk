import { z } from 'zod';
import { PortSpec } from './port.js';
import { CapabilitiesSpec } from './capabilities.js';
import { SettingsSchemaSpec } from './settingsSchema.js';
import { ModuleLayoutSpec } from './layout.js';

// Top-level shape. DEVIATION from design-schema-first.md §2's idealized
// sketch, which shows `layout:{sections}` and `settingsSchema` as flat
// siblings of `capabilities` at the module's top level: verified against
// all 29 real files in
// app1-api/src/services/objects/constants/workflows/*.js (wait.js, say.js,
// sendEmail.js, aBRouting.js, …), the layout tree and every module's own
// default-state object live NESTED inside one `settings` key
// (`module.settings.layout.sections`, `module.settings.<namespace>`) — not
// as top-level siblings. Modeling the idealized flat shape here would fail
// every existing module file, violating the "untouched modules must load
// exactly as before" constraint. `capabilities`/`settingsSchema`/
// `moduleSchemaVersion` are genuinely new, additive top-level keys — no
// module ships them today; `settings.layout`/`settings.<ns>` are the real,
// unchanged existing tree these new keys sit alongside.
export const ModuleSpec = z.object({
  // Identity
  type: z.string().min(1),
  // Cross-checked against the workflows.js registry api-side
  // (design-schema-first.md §2) — kept optional/permissive here so this
  // schema alone never rejects a real file for a missing category;
  // lintModuleSpec is where "category must be provided" is enforced.
  category: z.enum(['ai', 'engagement', 'data', 'actions', 'routing']).optional(),
  moduleSchemaVersion: z.number().int().positive().optional(),

  // Presentation
  label: z.string().min(1),
  description: z.string().optional(),
  icon: z.string().optional(),
  iconBgColor: z.string().optional(),
  iconTextColor: z.string().optional(),
  labelBgColor: z.string().optional(),
  labelTextColor: z.string().optional(),
  descriptionBgColor: z.string().optional(),
  descriptionTextColor: z.string().optional(),

  // Canvas contract
  position: z.object({ x: z.number(), y: z.number() }).optional(),
  ports: z.array(PortSpec).default([]),
  editWidth: z.string().optional(),

  // start.js / sayIntent.js's sayIntentOption sub-type only set these
  // explicitly — every other module omits both, relying on the implicit
  // default (maps.md module-defs §3). `capabilities.deletable`/
  // `hiddenFromPicker` are the new declared equivalents; these legacy keys
  // are kept typed (not just passthrough) since they still drive real
  // behavior today and a migrated module may set both during the soak
  // period.
  isDeletable: z.boolean().optional(),
  isHiddenFromList: z.boolean().optional(),

  // New, additive-only (see DEVIATION note above)
  capabilities: CapabilitiesSpec.optional(),
  settingsSchema: SettingsSchemaSpec.optional(),

  // Legacy pre-capabilities metadata, still real and still read by the
  // backend today (maps.md module-defs §2): `outputVariableFields`
  // (documentProcessing.js, summary.js), `excludeKeysFromVariableExtraction`
  // (selectResult.js), `subModules` (sayIntent.js), `simulate`
  // (lookup.js/timeControl.js/webHook.js). `capabilities.outputVariables`/
  // `excludedFromVariableExtraction`/`dataProducer`/`simulatable` are meant
  // to supersede these one module at a time — kept typed here (not left to
  // bare passthrough) so both shapes can be inspected side by side during
  // migration.
  outputVariableFields: z.array(z.string()).optional(),
  excludeKeysFromVariableExtraction: z.array(z.string()).optional(),
  subModules: z.array(z.unknown()).optional(),
  simulate: z.object({
    enabled: z.boolean().optional(),
    endpoint: z.string().optional(),
  }).passthrough().optional(),

  // The real, load-bearing tree — see DEVIATION note above. `settings`
  // itself is passthrough because every module's own namespace key
  // (`wait: {...}`, `email: {...}`, `abRoute: {...}`, …) sits here as a
  // sibling of `layout`, and there is deliberately no closed list of valid
  // namespace keys at this layer — `settingsSchema.namespace` is the
  // declared source of truth for the ones that opt in.
  settings: z.object({
    layout: ModuleLayoutSpec.optional(),
  }).passthrough().optional(),
}).passthrough();
