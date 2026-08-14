import { normalizeJoin } from './normalizeJoin.js';
import { normalizeKanban } from './normalizeKanban.js';
import { deriveActions } from './deriveActions.js';
import { deriveCompactFields } from './deriveCompactFields.js';
import { promoteRelatedLists } from './promoteRelatedLists.js';

/**
 * @param {object} doc
 * @param {string[]} changes
 * @returns {{ rest: object, objectName: string }}
 */
// SPEC-PHASE-5.md §2.1 step 1. `object`/`objectName` are written together,
// same value, by loadLayoutFromJson (client, builder) — canonicalize to
// `objectName`, drop `object`. On drift (both present, disagree), keep
// objectName's value per `edit/[id]/+page.svelte`'s own source-of-truth
// convention, and record the drift for backfill-sweep review rather than
// silently picking one.
function canonicalizeObjectName(doc, changes) {
  const { object, objectName, ...rest } = doc;
  if (object && objectName && object !== objectName) {
    changes.push(`objectName: drift detected (object="${object}" vs objectName="${objectName}") — kept objectName`);
  } else if (object && !objectName) {
    changes.push('objectName: canonicalized from legacy "object" key');
  }
  return { rest, objectName: objectName || object };
}

// TableSpec.join (schemas/layouts/section.js) is canonical-JoinSpec-only —
// unlike the raw document's other legacy keys, there's no dual
// legacy-shape + relationship pair for a table's join, so a successful
// normalization REPLACES `join` in place. A skipped (carve-out) join is
// dropped entirely rather than left as a legacy shape that would fail
// JoinSpec validation — TableSpec.join is `.optional()` precisely for this
// ("absent = top-level list table, no parent record").
function normalizeTableJoin(table, changes, sectionId) {
  if (!table.join) return table;
  const { relationship, skipped } = normalizeJoin(table.join, 'table');
  if (skipped) {
    changes.push(`section "${sectionId}" table "${table.id}": join left as legacy shape (non-trivial template or missing column)`);
    const { join, ...rest } = table;
    return rest;
  }
  changes.push(`section "${sectionId}" table "${table.id}": join normalized to relationship`);
  return { ...table, join: relationship };
}

// SPEC-PHASE-5.md §2.1 step 2. Wraps a legacy flat single-table section
// (section.object/fields/join/actions/orderBy/additionalWhere, no
// tables[]) into `section.tables = [{...}]`, field-for-field — does NOT
// reuse sectionOperations.js:initializeTablesArray (client-side), which
// builds a *blank* table config and would discard the existing values (see
// spec §2.1 step 2 and the sibling app1-client work item fixing that
// function for the same reason). `header` is carried into the new table
// (multi-table sections can give each table its own sub-header) but also
// LEFT at the section level, since BaseSection.header is required and this
// same value is what the section's own title already reads today.
function wrapLegacyTable(section, changes) {
  const id = section.id ? `${section.id}-table` : 'legacy-table';
  changes.push(`section "${section.id}": legacy single-table shape wrapped into tables[]`);
  const { object, fields, join, actions, orderBy, additionalWhere, ...rest } = section;
  const table = normalizeTableJoin({
    id, object, fields: fields || [], join, actions: actions || {}, orderBy, additionalWhere,
    header: section.header,
  }, changes, section.id);
  return { ...rest, tables: [table] };
}

// FieldSpec.join (component-typed fields) is likewise canonical-only — see
// normalizeTableJoin above. DEVIATION from SPEC-PHASE-5.md's literal step
// list, which doesn't call out component fields separately: real stored
// data (examples.json's company-detail "Related Engagements" section) has
// `field.join = {column, value}` on a type:'component' field, using the
// same 3-consumer semantics table row as component joins generally. Added
// per the same reasoning Phase 1 already documented for this exact gap.
function normalizeRows(rows, changes) {
  if (!Array.isArray(rows)) return rows;
  return rows.map((row) => ({
    ...row,
    columns: (row.columns || []).map((column) => {
      if (column.type !== 'component' || !column.join) return column;
      const { relationship, skipped } = normalizeJoin(column.join, 'component');
      if (skipped) {
        changes.push(`field "${column.id}": join left as legacy shape (non-trivial template or missing column)`);
        return column;
      }
      changes.push(`field "${column.id}": component join normalized to relationship`);
      return { ...column, join: relationship };
    }),
  }));
}

// DEVIATION (Phase 5, found reading real fixture data, not called out in
// SPEC-PHASE-5.md): a section can carry `type: "table"` while also having
// a `kanban` block, `tables[]`, and `defaultView` — i.e. it's actually a
// table-kanban hybrid, but the builder never updated `type` when the
// kanban toggle was added (examples.json's company-detail "Opportunities"
// section, id "section4"). SectionSpec's discriminated union has no
// `kanban` key on the `type:'table'` branch (TableSection), so leaving the
// tag wrong means a `.safeParse()` silently drops the kanban config from
// validated output. Retag before validation ever sees it.
function normalizeSectionType(section, changes) {
  if (section.type === 'table' && section.kanban && (section.tables || section.object)) {
    changes.push(`section "${section.id}": type normalized "table" -> "table-kanban" (kanban block present alongside tables)`);
    return 'table-kanban';
  }
  return section.type;
}

/**
 * @param {object} layoutJson - raw stored layout.layout / layoutVersions.layoutJson (schemaVersion 0/1)
 * @param {{ objectName?: string, layoutKind?: 'list'|'detail'|'compact' }} [ctx]
 * @returns {{ json: object, schemaVersion: 2, changes: string[] }}
 */
export function migrateV1toV2(layoutJson, ctx = {}) {
  const changes = [];
  const { rest, objectName: docObjectName } = canonicalizeObjectName(layoutJson, changes);
  const objectName = docObjectName || ctx.objectName;

  const promotedCreateActions = [];
  const allPromotedIds = new Set();

  const sections = (rest.sections || []).map((section) => {
    let next = { ...section, type: normalizeSectionType(section, changes), rows: normalizeRows(section.rows, changes) };

    if (next.type === 'table' && !section.tables && section.object) {
      next = wrapLegacyTable(next, changes);
    } else if (section.tables) {
      next.tables = section.tables.map((t) => normalizeTableJoin(t, changes, section.id));
    }

    if (section.kanban) {
      next.kanban = normalizeKanban(section.kanban, changes, section.id);
    }

    if (next.tables && next.tables.length) {
      const { relatedLists, createActions, promotedIds } = promoteRelatedLists(next, objectName, changes);
      if (relatedLists.length) next.relatedLists = relatedLists;
      promotedCreateActions.push(...createActions);
      promotedIds.forEach((id) => allPromotedIds.add(id));
    }

    return next;
  });

  const migrated = {
    ...rest,
    schemaVersion: 2,
    objectName,
    sections,
    actions: [
      ...deriveActions({ ...rest, objectName, sections }, { skipTableIds: allPromotedIds }),
      ...promotedCreateActions,
    ],
  };

  if (rest.type === 'compact' && rest.sections && !rest.fields) {
    migrated.fields = deriveCompactFields(rest);
    changes.push('compact: derived fields[] from sections[] rows/columns');
  }

  return { json: migrated, schemaVersion: 2, changes };
}
