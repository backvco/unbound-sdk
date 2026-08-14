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
//
// DEVIATION (Phase 5, SPEC-PHASE-5.md §2.1 step 3): returns
// {relationship, skipped} instead of a bare relationship object. `skipped`
// is true when `column` is missing/empty or `value` isn't a clean
// single-token "{{field}}" template — the spec's explicit "leave untouched"
// carve-out for joins that can't be synthesized 1:1. Both cases appear in
// real stored data (app1-api/src/services/layouts/examples.json:865,921 —
// two "Related Contacts"/"Deal Team" tables with `join.column === ""`), not
// just the hypothetical concatenated-template case the spec called out —
// an empty FK column can no more produce a valid JoinSpec.childField
// (min-length 1) than a non-trivial template can, so both are treated as
// the same carve-out.
const MUSTACHE_RE = /^\{\{\s*([\w.]+)\s*\}\}$/;

export function normalizeJoin(raw, legacyKind) {
  if (!raw) return { relationship: undefined, skipped: false };

  // Already canonical (or kanban child-records, which was never templated).
  if (legacyKind === 'kanbanChildRecords' || (raw.childField && !raw.column)) {
    if (!raw.childField) return { relationship: undefined, skipped: true };
    return { relationship: { childField: raw.childField, parentField: raw.parentField || 'id' }, skipped: false };
  }

  if (!raw.column || typeof raw.value !== 'string') {
    return { relationship: undefined, skipped: true };
  }

  const match = raw.value.match(MUSTACHE_RE);
  if (!match) {
    return { relationship: undefined, skipped: true };
  }

  return { relationship: { childField: raw.column, parentField: match[1] }, skipped: false };
}
