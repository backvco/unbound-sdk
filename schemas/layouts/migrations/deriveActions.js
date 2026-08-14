// Pure fn, no zod import. Maps legacy `layout.actions{create,edit}` (a
// bespoke boolean-flag object — real stored docs mostly have this as `{}`)
// plus per-table action booleans (TableSpec.actions.{create,edit,delete})
// into the v2-canonical ActionSpec[] shape (schemas/layouts/action.js).
// Additive only: if `doc.actions` is already an array (already v2-shaped),
// it's passed through unchanged rather than re-derived.
//
// `skipTableIds` (optional Set, Phase 5 addition): table ids already
// promoted to RelatedListSpec by promoteRelatedLists.js. A promoted table's
// create/delete already surface via the promoted section-placed ActionSpec
// (create) and RelatedListSpec.rowActions.delete (delete) — deriving a
// second, row-placed ActionSpec here for the same table would double the
// affordance. See migrateV1toV2.js for how the two derivations are composed.
export function deriveActions(doc, { skipTableIds } = {}) {
  if (Array.isArray(doc.actions)) {
    return doc.actions;
  }

  const legacy = doc.actions || {};
  const objectName = doc.objectName || doc.object;
  const skip = skipTableIds || new Set();
  const derived = [];

  if (legacy.create) {
    derived.push({
      id: 'header-create',
      type: 'create',
      target: objectName,
      mode: 'modal',
      placement: 'header',
    });
  }
  if (legacy.edit) {
    derived.push({
      id: 'header-edit',
      type: 'edit',
      target: objectName,
      mode: 'modal',
      placement: 'header',
    });
  }

  // Per-table create/delete booleans surface as row-placed ActionSpecs so
  // Phase 4's action registry has one uniform ActionSpec[] to read,
  // regardless of where the boolean originally lived. (Per-table `edit` is
  // deliberately not derived: it's the default row-click behavior already,
  // not a distinct affordance — see TableSpec.actions.edit default:true.)
  for (const section of doc.sections || []) {
    const tables = section.tables || (section.object ? [section] : []);
    for (const table of tables) {
      if (!table.actions) continue;
      const tableId = table.id || section.id;
      if (skip.has(tableId)) continue;
      if (table.actions.create) {
        derived.push({
          id: `${tableId}-create`, type: 'create', target: table.object,
          mode: 'modal', placement: 'row',
        });
      }
      if (table.actions.delete) {
        derived.push({
          id: `${tableId}-delete`, type: 'delete', target: table.object,
          mode: 'modal', placement: 'row',
        });
      }
    }
  }

  return derived;
}
