// Pure fn, no zod import. SPEC-PHASE-5.md §2.1 step 5: promotes qualifying
// TableSpec entries (already join-normalized by migrateV1toV2.js) to
// RelatedListSpec, additive alongside `tables[]` — NOT a replacement.
// `tables[]` stays fully intact so the section keeps validating and nothing
// is lost if a table doesn't qualify; `relatedLists[]` is a new, parallel
// key (schemas/layouts/section.js) for the Phase 4 engine's related-list
// component to read instead of re-deriving the same shape from `tables[]`
// itself. See section.js's comment at TableSection/TableKanbanSection for
// why this resolves relatedList.js's "Open Decision #5" as additive rather
// than folding tables[] away.
//
// Promotion criteria (ALL required, per spec):
//   a. table.object differs from the layout's own objectName — a table
//      entry matching the primary object is a plain table, not a related
//      list of itself.
//   b. table.join was normalized to a canonical relationship (i.e. NOT
//      dropped by normalizeJoin's "leave untouched" carve-out).
//   c. table.fields is non-empty — RelatedListSpec.columns.inline requires
//      at least one column (min(1)); an empty fields[] can't produce a
//      valid columns block. Not explicitly named in the spec's 3 criteria,
//      but required by RelatedListSpec's actual zod shape.
// table.hideRowNumber / `table.header`-style overrides are NOT a gate (per
// spec: "keep columns: {inline: [...]} verbatim rather than failing the
// promotion") — this function always emits `columns: {inline: table.fields}`
// unconditionally, so criterion (c) is the only fields-related check.
export function promoteRelatedLists(section, objectName, changes) {
  const relatedLists = [];
  const createActions = [];
  const promotedIds = new Set();

  for (const table of section.tables || []) {
    if (table.object === objectName) continue;
    if (!table.join) continue;
    if (!table.fields || table.fields.length === 0) continue;

    relatedLists.push({
      id: table.id,
      object: table.object,
      relationship: table.join,
      columns: { inline: table.fields },
      rowActions: {
        open: 'modal',
        quickEdit: table.actions?.edit ? 'modal' : undefined,
        delete: !!table.actions?.delete,
        custom: [],
      },
      defaultSort: table.orderBy,
      filters: table.additionalWhere,
    });
    promotedIds.add(table.id);
    changes.push(
      `section "${section.id}" table "${table.id}": promoted to RelatedListSpec (object="${table.object}")`,
    );

    if (table.actions?.create) {
      createActions.push({
        id: `${table.id}-related-create`,
        type: 'create',
        target: table.object,
        mode: 'modal',
        placement: 'section',
      });
    }
  }

  return { relatedLists, createActions, promotedIds };
}
