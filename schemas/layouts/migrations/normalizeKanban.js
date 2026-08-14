// Pure fn, no zod import. Tolerates/normalizes per-mode kanban keys — the 3
// kanban modes (simple/related/child-records) are described inconsistently
// across TableEditor.svelte/KanbanEditor.svelte/ComponentEditor.svelte
// (maps.md §1.7); this fills in the structural keys KanbanConfigSpec
// (schemas/layouts/kanban.js) always expects (mode, summaries[], actions{})
// without dropping or rewriting anything mode-specific — additive only.
export function normalizeKanban(raw) {
  if (!raw) return raw;

  const mode = raw.mode
    || (raw.childObject ? 'child-records' : (raw.configObject ? 'related' : 'simple'));

  const summaries = Array.isArray(raw.summaries) ? raw.summaries : [];
  const actions = raw.actions && typeof raw.actions === 'object' ? raw.actions : {};

  return {
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
}
