import { z } from 'zod';

// Declares WHERE a module's behavior fields live instead of leaving it to
// convention (design-schema-first.md §2). `namespace` must match the first
// path segment after `settings.` on every `settings.<ns>.*` edit field this
// module declares — see lint.js's settings-namespace-match rule, which is
// exactly what would mechanically catch aBRouting.js's live field/default
// mismatch (`edit.field: 'settings.points.unit'` writes a key nothing
// reads; the module's real default state lives under `settings.abRoute.*`,
// which is never editable through the UI at all — maps.md module-defs
// §4.3) and update.js's copy-pasted-and-never-renamed defaults (§4.2) at
// commit time, not after the bug ships.
//
// Optional on ModuleSpec as a whole — a module with no settingsSchema is
// simply not yet opted into this check (legacy/unmigrated), per the
// additive constraint in design-incremental-risk.md §2. `phone.*`/
// `messaging.*` dual-channel fields (say/sayGather/sayIntent/bot/
// selectResult, maps.md module-defs §2) are exempt from the namespace
// check entirely — that's a documented, separate addressing channel, not a
// `settings.<ns>` deviation, and its collapse into `settings` is explicitly
// deferred (design-schema-first.md §1).
//
// `defaults` mirrors the module's own default-state object (e.g.
// wait.js's bottom-level `wait: {unit,value}`, unwrapped — NOT
// `{wait: {unit,value}}` again) purely for documentation/tooling; it is not
// re-injected into `settings.<ns>` at runtime by anything in this package.
export const SettingsSchemaSpec = z.object({
  namespace: z.string().min(1),
  defaults: z.record(z.unknown()).default({}),
}).passthrough();
