import { normalizeJoin } from './normalizeJoin.js';

// Pure fn, no zod import. Tolerates/normalizes per-mode kanban keys — the 3
// kanban modes (simple/related/child-records) are described inconsistently
// across TableEditor.svelte/KanbanEditor.svelte/ComponentEditor.svelte
// (maps.md §1.7); this fills in the structural keys KanbanConfigSpec
// (schemas/layouts/kanban.js) always expects (mode, summaries[], actions{})
// without dropping or rewriting anything mode-specific — additive only.
//
// `changes` (optional, Phase 5 addition) collects human-readable entries for
// the migration-preview tool / backfill-sweep log, same array threaded
// through migrateV1toV2.js's other normalizers.
export function normalizeKanban(raw, changes, sectionId) {
  if (!raw) return raw;

  const mode = raw.mode
    || (raw.childObject ? 'child-records' : (raw.configObject ? 'related' : 'simple'));
  if (!raw.mode && changes) {
    changes.push(`section "${sectionId}" kanban: mode inferred as "${mode}" (not explicitly set)`);
  }

  const summaries = Array.isArray(raw.summaries) ? raw.summaries : [];
  const actions = raw.actions && typeof raw.actions === 'object' ? raw.actions : {};

  const next = {
    ...raw,
    mode,
    summaries,
    actions: {
      create: actions.create ?? false,
      edit: actions.edit ?? true,
      delete: actions.delete ?? false,
      cardClick: actions.cardClick || 'modal',
    },
  };

  // child-records mode's `join` is KanbanChildRecords's own JoinSpec-typed
  // field (schemas/layouts/kanban.js) — canonical-only, same as
  // TableSpec.join. Legacy child-records joins were never templated
  // (kanbanChildRecords fast-path in normalizeJoin), so this only ever
  // fills a missing default parentField; kept here (rather than assumed
  // already-clean) because migrateV1toV2.js can't reach into mode-specific
  // kanban keys itself without duplicating the mode-inference above.
  if (mode === 'child-records' && raw.join) {
    const { relationship, skipped } = normalizeJoin(raw.join, 'kanbanChildRecords');
    if (relationship) {
      next.join = relationship;
    } else if (skipped && changes) {
      changes.push(`section "${sectionId}" kanban: child-records join left as legacy shape (missing childField)`);
    }
  }

  return next;
}
