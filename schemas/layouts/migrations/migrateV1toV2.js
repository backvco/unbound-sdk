import { normalizeJoin } from './normalizeJoin.js';
import { normalizeKanban } from './normalizeKanban.js';
import { deriveActions } from './deriveActions.js';
import { deriveCompactFields } from './deriveCompactFields.js';

// Normalizes a content-section's rows[].columns[] in place (additively):
// component-typed FieldSpecs (type:'component') carry the same legacy
// {column,value} join shape as table joins (maps.md §1.6/§1.10, confirmed
// against a real stored doc — app1-api/src/services/layouts/examples.json's
// company-detail "Related Engagements" section: field.join = {column, value}
// on a type:'component' field). DEVIATION from SPEC-PHASE-1.md's literal A18
// code sample, which normalizes section.tables[].join/section.kanban but
// never walks into rows/columns — without this, every component-join field
// in real data would fail post-migration validation (childField/parentField
// missing) purely because the migration didn't reach it, not because the
// field is genuinely malformed. Added per the phase's own validation-gate
// instruction ("if the fixture reveals a schema gap, fix it — don't skip").
function normalizeRows(rows) {
  if (!Array.isArray(rows)) return rows;
  return rows.map((row) => ({
    ...row,
    columns: (row.columns || []).map((column) => (
      column.type === 'component' && column.join
        ? { ...column, join: normalizeJoin(column.join, 'component') }
        : column
    )),
  }));
}

// ADDITIVE ONLY: every v1 key is kept as-is (the current, unchanged renderer
// still reads them through Phase 3). New v2-canonical keys are layered on top.
// Phase 2's resolve() is what will eventually make v2 the only shape read;
// this function must never be destructive while that's still true.
export function migrateV1toV2(doc) {
  const objectName = doc.objectName || doc.object;
  const sections = (doc.sections || []).map((section) => {
    const next = { ...section, rows: normalizeRows(section.rows) };
    if (section.type === 'table' && !section.tables && section.object) {
      // legacy single-table fallback → tables[] (V2-PLAN §6)
      next.tables = [{
        id: section.id ? `${section.id}-table` : 'legacy-table',
        object: section.object,
        join: section.join ? normalizeJoin(section.join, 'table') : undefined,
        fields: section.fields || [],
        actions: section.actions || {},
      }];
    } else if (section.tables) {
      next.tables = section.tables.map((t) => ({
        ...t,
        join: t.join ? normalizeJoin(t.join, 'table') : undefined,
      }));
    }
    if (section.kanban) {
      next.kanban = normalizeKanban(section.kanban);
    }
    return next;
  });

  const migrated = {
    ...doc,
    schemaVersion: 2,
    objectName,
    sections,
    actions: deriveActions(doc),
  };

  if (doc.type === 'compact' && doc.sections && !doc.fields) {
    migrated.fields = deriveCompactFields(doc);
  }

  return migrated;
}
