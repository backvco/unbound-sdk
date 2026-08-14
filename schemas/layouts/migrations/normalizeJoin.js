// Pure fn, no zod import — this runs before validation inside migrateV1toV2.
// Mirrors join.js's normalizeJoinSpec() (kept as a standalone duplicate here,
// not a re-export, so the migrations/ tier stays zod-free per the phase's
// "migrations run on plain objects" design — see SPEC-PHASE-1.md §2 A14-A18).
//
// legacyKind: 'table' | 'component' | 'kanbanChildRecords' — all three raw
// join shapes observed in the legacy layout builder collapse onto one
// canonical {childField, parentField} shape:
//   - table / component: {column, value: "{{parentField}}"}
//   - kanban child-records: {childField, parentField} (already un-templated)
const MUSTACHE_RE = /^\{\{\s*([\w.]+)\s*\}\}$/;

export function normalizeJoin(raw, legacyKind) {
  if (!raw) return undefined;

  // Already canonical (or kanban child-records, which was never templated).
  if (legacyKind === 'kanbanChildRecords' || (raw.childField && !raw.column)) {
    return { childField: raw.childField, parentField: raw.parentField || 'id' };
  }

  const match = typeof raw.value === 'string' ? raw.value.match(MUSTACHE_RE) : null;
  return {
    childField: raw.column,
    parentField: match ? match[1] : (raw.value || 'id'),
  };
}
