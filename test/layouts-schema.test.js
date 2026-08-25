import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  LayoutDoc, CompactLayoutDoc, KanbanConfigSpec, RelatedListSpec, ActionSpec,
  JoinSpec, normalizeJoinSpec, validateLayoutDoc, migrateLayoutSchema, migrateV1toV2,
  SectionSpec, TIMELINE_SOURCES,
} from '../schemas/layouts/index.js';
import { normalizeJoin } from '../schemas/layouts/migrations/normalizeJoin.js';
import { promoteRelatedLists } from '../schemas/layouts/migrations/promoteRelatedLists.js';

describe('LayoutDoc', () => {
  test('happy path: minimal detail doc', () => {
    const result = validateLayoutDoc({
      schemaVersion: 2,
      objectName: 'company',
      type: 'detail',
      sections: [],
    });
    assert.equal(result.valid, true);
    assert.equal(result.data.objectName, 'company');
  });
});

describe('CompactLayoutDoc', () => {
  test('happy path: fields[] capped list', () => {
    const result = validateLayoutDoc({
      objectName: 'company',
      fields: [
        { id: 'f1', type: 'content', object: 'company', display: { value: 'name', fieldType: 'readOnly' } },
      ],
    }, { type: 'compact' });
    assert.equal(result.valid, true);
  });

  test('rejects an empty fields[] (min 1)', () => {
    const result = CompactLayoutDoc.safeParse({ objectName: 'company', fields: [] });
    assert.equal(result.success, false);
  });
});

describe('KanbanConfigSpec', () => {
  test('mode: simple', () => {
    const result = KanbanConfigSpec.safeParse({
      mode: 'simple', columnField: 'stage', compactLayoutId: 'compact-1',
    });
    assert.equal(result.success, true);
  });

  test('mode: related', () => {
    const result = KanbanConfigSpec.safeParse({
      mode: 'related',
      compactLayoutId: 'compact-1',
      configObject: 'opportunityTypes',
      configObjectField: 'id',
      stagesObject: 'opportunityTypeStages',
      stagesColumnField: 'name',
      relationship: {
        configToStages: { field: 'id', relatedField: 'opportunityTypeId' },
        mainToConfig: { field: 'opportunityTypeId', relatedField: 'id' },
      },
      stageMapping: { mainField: 'stageId', stageField: 'id' },
    });
    assert.equal(result.success, true);
  });

  test('mode: child-records', () => {
    const result = KanbanConfigSpec.safeParse({
      mode: 'child-records',
      compactLayoutId: 'compact-1',
      childObject: 'opportunities',
      join: { childField: 'companyId', parentField: 'id' },
      stageMapping: { field: 'stageId' },
    });
    assert.equal(result.success, true);
  });

  test('rejects a summary missing field when type !== "count"', () => {
    const result = KanbanConfigSpec.safeParse({
      mode: 'simple', columnField: 'stage', compactLayoutId: 'compact-1',
      summaries: [{ type: 'sum', enabled: true }],
    });
    assert.equal(result.success, false);
  });
});

describe('TimelineSection (SectionSpec)', () => {
  test('happy path: defaults fill in sources/limit/showFilters', () => {
    const result = SectionSpec.safeParse({ id: 's1', type: 'timeline' });
    assert.equal(result.success, true);
    assert.deepEqual(result.data.sources, TIMELINE_SOURCES);
    assert.equal(result.data.limit, 50);
    assert.equal(result.data.showFilters, true);
  });

  test('accepts an explicit sources subset + limit + showFilters:false', () => {
    const result = SectionSpec.safeParse({
      id: 's1', type: 'timeline',
      sources: ['email', 'call', 'note'],
      limit: 20,
      showFilters: false,
    });
    assert.equal(result.success, true);
    assert.deepEqual(result.data.sources, ['email', 'call', 'note']);
    assert.equal(result.data.limit, 20);
    assert.equal(result.data.showFilters, false);
  });

  test('rejects an unknown source', () => {
    const result = SectionSpec.safeParse({
      id: 's1', type: 'timeline', sources: ['carrier-pigeon'],
    });
    assert.equal(result.success, false);
  });

  test('rejects a non-positive limit', () => {
    const result = SectionSpec.safeParse({ id: 's1', type: 'timeline', limit: 0 });
    assert.equal(result.success, false);
  });
});

describe('RelatedListSpec', () => {
  test('happy path: inline columns', () => {
    const result = RelatedListSpec.safeParse({
      id: 'rl1',
      object: 'opportunities',
      relationship: { childField: 'companyId', parentField: 'id' },
      columns: { inline: [{ field: 'name' }] },
    });
    assert.equal(result.success, true);
  });
});

describe('ActionSpec', () => {
  test('happy path: create action', () => {
    const result = ActionSpec.safeParse({
      id: 'header-create', type: 'create', target: 'opportunities', placement: 'header',
    });
    assert.equal(result.success, true);
  });

  test('rejects a custom action without target', () => {
    const result = ActionSpec.safeParse({ id: 'a1', type: 'custom', placement: 'row' });
    assert.equal(result.success, false);
  });
});

describe('FieldSpec structural refinements (via LayoutDoc)', () => {
  function docWithField(field) {
    return {
      objectName: 'company', type: 'detail',
      sections: [{ id: 's1', type: 'content', rows: [{ id: 'r1', columns: [field] }] }],
    };
  }

  test('rejects composite fieldType without edit[]', () => {
    const result = validateLayoutDoc(docWithField({
      id: 'f1', type: 'content', object: 'company',
      display: { value: 'name', fieldType: 'composite' },
    }));
    assert.equal(result.valid, false);
  });

  test('rejects selectDynamic edit without queryConfig', () => {
    const result = validateLayoutDoc(docWithField({
      id: 'f1', type: 'content', object: 'company',
      edit: { field: 'ownerId', fieldType: 'selectDynamic', select: { url: 'legacy' } },
    }));
    assert.equal(result.valid, false);
  });
});

describe('normalizeJoinSpec', () => {
  test('round-trips the legacy table shape {column, value:"{{x}}"}', () => {
    assert.deepEqual(
      normalizeJoinSpec({ column: 'companyId', value: '{{id}}' }, 'table'),
      { childField: 'companyId', parentField: 'id' },
    );
  });

  test('round-trips the legacy component shape {column, value:"{{x}}"}', () => {
    assert.deepEqual(
      normalizeJoinSpec({ column: 'companyId', value: '{{companyId}}' }, 'component'),
      { childField: 'companyId', parentField: 'companyId' },
    );
  });

  test('round-trips the legacy kanban child-records shape {childField, parentField}', () => {
    assert.deepEqual(
      normalizeJoinSpec({ childField: 'companyId', parentField: 'id' }, 'kanbanChildRecords'),
      { childField: 'companyId', parentField: 'id' },
    );
  });

  test('output always parses as a canonical JoinSpec', () => {
    const normalized = normalizeJoinSpec({ column: 'companyId', value: '{{id}}' }, 'table');
    assert.equal(JoinSpec.safeParse(normalized).success, true);
  });
});

// Migrations-tier duplicate (zod-free) — same semantics as normalizeJoinSpec
// above, but returns {relationship, skipped} so migrateV1toV2.js can tell
// "no join present" apart from "join present but couldn't be synthesized"
// (SPEC-PHASE-5.md §2.1 step 3's carve-out).
describe('normalizeJoin (migrations tier, leave-untouched carve-out)', () => {
  test('normalizes a clean single-token template', () => {
    const { relationship, skipped } = normalizeJoin({ column: 'companyId', value: '{{id}}' }, 'table');
    assert.deepEqual(relationship, { childField: 'companyId', parentField: 'id' });
    assert.equal(skipped, false);
  });

  test('skips an empty/missing column — real data case (examples.json: opportunityPeople/opportunityUsers tables)', () => {
    const { relationship, skipped } = normalizeJoin({ column: '', value: '{{id}}' }, 'table');
    assert.equal(relationship, undefined);
    assert.equal(skipped, true);
  });

  test('skips a non-trivial multi-token template', () => {
    const { relationship, skipped } = normalizeJoin({ column: 'x', value: '{{a}} {{b}}' }, 'table');
    assert.equal(relationship, undefined);
    assert.equal(skipped, true);
  });

  test('passes an already-canonical kanban child-records join through, defaulting parentField', () => {
    const { relationship, skipped } = normalizeJoin({ childField: 'companyId' }, 'kanbanChildRecords');
    assert.deepEqual(relationship, { childField: 'companyId', parentField: 'id' });
    assert.equal(skipped, false);
  });
});

describe('promoteRelatedLists', () => {
  test('promotes a qualifying table (child object, normalized join, non-empty fields) and derives its create ActionSpec', () => {
    const section = {
      id: 's1',
      tables: [{
        id: 't1',
        object: 'opportunities',
        join: { childField: 'companyId', parentField: 'id' },
        fields: [{ field: 'name' }],
        actions: { edit: true, create: true, delete: false },
      }],
    };
    const changes = [];
    const { relatedLists, createActions, promotedIds } = promoteRelatedLists(section, 'company', changes);

    assert.equal(relatedLists.length, 1);
    assert.equal(relatedLists[0].id, 't1');
    assert.equal(relatedLists[0].object, 'opportunities');
    assert.deepEqual(relatedLists[0].relationship, { childField: 'companyId', parentField: 'id' });
    assert.deepEqual(relatedLists[0].columns, { inline: [{ field: 'name' }] });
    assert.equal(relatedLists[0].rowActions.quickEdit, 'modal');
    assert.equal(relatedLists[0].rowActions.delete, false);

    assert.equal(createActions.length, 1);
    assert.equal(createActions[0].placement, 'section');
    assert.equal(createActions[0].target, 'opportunities');
    assert.ok(promotedIds.has('t1'));
    assert.ok(changes.some((c) => c.includes('promoted to RelatedListSpec')));

    assert.equal(RelatedListSpec.safeParse(relatedLists[0]).success, true);
    assert.equal(ActionSpec.safeParse(createActions[0]).success, true);
  });

  test('does not promote a table matching the layout objectName (primary table, not a related list)', () => {
    const section = {
      id: 's1',
      tables: [{ id: 't1', object: 'company', join: { childField: 'x', parentField: 'id' }, fields: [{ field: 'name' }] }],
    };
    const { relatedLists } = promoteRelatedLists(section, 'company', []);
    assert.equal(relatedLists.length, 0);
  });

  test('does not promote a table with no join (dropped by the carve-out)', () => {
    const section = { id: 's1', tables: [{ id: 't1', object: 'contacts', fields: [{ field: 'name' }] }] };
    const { relatedLists } = promoteRelatedLists(section, 'company', []);
    assert.equal(relatedLists.length, 0);
  });

  test('does not promote a table with an empty fields[] (columns.inline requires min 1)', () => {
    const section = {
      id: 's1',
      tables: [{ id: 't1', object: 'contacts', join: { childField: 'companyId', parentField: 'id' }, fields: [] }],
    };
    const { relatedLists } = promoteRelatedLists(section, 'company', []);
    assert.equal(relatedLists.length, 0);
  });
});

describe('migrateV1toV2', () => {
  // Realistic v1 fixture, structurally lifted from
  // app1-api/src/services/layouts/examples.json's company-detail doc:
  //   - legacy `object` key alongside `objectName` (dedup, step 1)
  //   - legacy single-table section (`section4-legacy`, step 2)
  //   - legacy table join `{column,value:"{{id}}"}` (step 3)
  //   - legacy component join on a type:'component' field (step 3, Phase 1 addition)
  //   - a `type:"table"` section that actually holds a kanban block + tables[]
  //     (real shape: examples.json's company-detail "Opportunities" section,
  //     id "section4" — the builder never updated `type` when kanban was
  //     added; Phase 5 addition, not explicitly named in SPEC-PHASE-5.md §2.1
  //     but required so `.safeParse()` doesn't silently drop the kanban block)
  //   - a table (`section5`'s `table-1`) that qualifies for RelatedListSpec
  //     promotion (step 5)
  //   - a table with a broken empty-column legacy join (`section6`'s
  //     `table-2`, matching examples.json:865/921's opportunityPeople/
  //     opportunityUsers tables verbatim) — the "leave untouched" carve-out,
  //     and NOT eligible for promotion (condition b fails)
  const v1Fixture = {
    id: '058d0120250923undefined13227657521094879',
    name: 'Company Detail',
    type: 'detail',
    object: 'company',
    actions: {},
    tabIcon: 'fa-building',
    tabName: '{{name}}',
    feeds: { enabled: true, hideOnCreate: true },
    sections: [
      {
        id: 'section1',
        type: 'content',
        header: { level: '6', value: '' },
        editable: true,
        rows: [{
          id: 'row-1', columns: [{
            id: 'field-1', type: 'content', object: 'company',
            edit: { field: 'name', label: 'Name', fieldType: 'input' },
            display: { label: 'Name', value: 'name', fieldType: 'input' },
          }],
        }],
      },
      {
        id: 'section3',
        type: 'content',
        header: { value: 'Related Engagements' },
        editable: true,
        rows: [{
          id: 'row-2', columns: [{
            id: 'field-2', type: 'component', component: 'engagementSessions', hideOnCreate: true,
            join: { column: 'companyId', value: '{{id}}' },
          }],
        }],
      },
      {
        id: 'section4-legacy',
        type: 'table',
        header: { value: 'Opportunities (legacy)' },
        editable: true,
        object: 'opportunities',
        join: { column: 'companyId', value: '{{id}}' },
        fields: [{ field: 'name', display: 'Name' }],
        actions: { edit: true, create: true, delete: false },
      },
      {
        id: 'section5',
        type: 'table',
        header: { value: 'Opportunities' },
        editable: true,
        defaultView: 'table',
        tableLayout: 'full-width',
        kanban: {
          childObject: 'opportunities',
          join: { childField: 'companyId', parentField: 'id' },
          stageMapping: { field: 'stage' },
          cardFields: [{ field: 'name' }],
        },
        tables: [{
          id: 'table-1',
          object: 'opportunities',
          join: { column: 'companyId', value: '{{id}}' },
          fields: [
            { field: 'name', display: 'Name' },
            { field: 'amount', display: 'Amount', formatType: 'currency' },
          ],
          header: { hidden: true },
          actions: { edit: true, create: true, delete: false },
          orderBy: { field: 'forecastedCloseDate' },
          additionalWhere: { isDeleted: '0' },
        }],
      },
      {
        id: 'section6',
        type: 'table',
        header: { value: 'Related Contacts' },
        editable: true,
        tableLayout: 'two-columns',
        tables: [{
          id: 'table-2',
          object: 'opportunityPeople',
          join: { column: '', value: '{{id}}' },
          fields: [{ field: 'people.fullName__g', display: 'Name' }],
          actions: { edit: true, create: true, delete: true },
        }],
      },
    ],
    objectName: 'company',
  };

  test('canonicalizes objectName, dropping the legacy "object" key', () => {
    const { json } = migrateV1toV2(v1Fixture);
    assert.equal(json.objectName, 'company');
    assert.equal('object' in json, false);
  });

  test('sets schemaVersion 2 and returns a non-empty changes[] log', () => {
    const { schemaVersion, changes } = migrateV1toV2(v1Fixture);
    assert.equal(schemaVersion, 2);
    assert.ok(changes.length > 5);
  });

  test('wraps the legacy single-table section into tables[], field-for-field', () => {
    const { json } = migrateV1toV2(v1Fixture);
    const section = json.sections.find((s) => s.id === 'section4-legacy');
    assert.equal(section.tables.length, 1);
    assert.equal(section.tables[0].object, 'opportunities');
    assert.deepEqual(section.tables[0].fields, [{ field: 'name', display: 'Name' }]);
    assert.deepEqual(section.tables[0].actions, { edit: true, create: true, delete: false });
    assert.equal(section.header.value, 'Opportunities (legacy)'); // stays at section level (BaseSection.header is required)
  });

  test('normalizes table and component joins to canonical relationship shape', () => {
    const { json } = migrateV1toV2(v1Fixture);
    const componentField = json.sections[1].rows[0].columns[0];
    assert.deepEqual(componentField.join, { childField: 'companyId', parentField: 'id' });

    const wrappedTable = json.sections.find((s) => s.id === 'section4-legacy').tables[0];
    assert.deepEqual(wrappedTable.join, { childField: 'companyId', parentField: 'id' });
  });

  test('retags a type:"table" section that actually holds a kanban block to "table-kanban"', () => {
    const { json, changes } = migrateV1toV2(v1Fixture);
    const section = json.sections.find((s) => s.id === 'section5');
    assert.equal(section.type, 'table-kanban');
    assert.equal(section.kanban.mode, 'child-records');
    assert.deepEqual(section.kanban.join, { childField: 'companyId', parentField: 'id' });
    assert.ok(changes.some((c) => c.includes('type normalized "table" -> "table-kanban"')));
  });

  test('promotes qualifying tables to relatedLists[], additive alongside tables[]', () => {
    const { json } = migrateV1toV2(v1Fixture);

    const legacySection = json.sections.find((s) => s.id === 'section4-legacy');
    assert.equal(legacySection.relatedLists.length, 1);
    assert.equal(legacySection.relatedLists[0].object, 'opportunities');
    assert.equal(legacySection.tables.length, 1); // tables[] stays intact, not replaced

    const kanbanSection = json.sections.find((s) => s.id === 'section5');
    assert.equal(kanbanSection.relatedLists.length, 1);
    assert.equal(kanbanSection.relatedLists[0].object, 'opportunities');
    assert.deepEqual(kanbanSection.relatedLists[0].defaultSort, { field: 'forecastedCloseDate' });
    assert.deepEqual(kanbanSection.relatedLists[0].filters, { isDeleted: '0' });
  });

  test('leaves a broken empty-column join untouched and does not promote that table', () => {
    const { json, changes } = migrateV1toV2(v1Fixture);
    const section = json.sections.find((s) => s.id === 'section6');
    assert.equal('join' in section.tables[0], false);
    assert.equal(section.relatedLists, undefined);
    assert.ok(changes.some((c) => c.includes('table "table-2": join left as legacy shape')));
  });

  test('derives ActionSpec[]: promoted tables get a section-placed create action instead of a row-placed one', () => {
    const { json } = migrateV1toV2(v1Fixture);

    // Promoted tables (section4-legacy's, section5's) must NOT also get a
    // row-placed action from the legacy per-table derivation.
    const rowActionsForPromoted = json.actions.filter(
      (a) => a.placement === 'row' && a.target === 'opportunities',
    );
    assert.equal(rowActionsForPromoted.length, 0);

    const sectionCreateActions = json.actions.filter((a) => a.placement === 'section' && a.target === 'opportunities');
    assert.equal(sectionCreateActions.length, 2);

    // The non-promoted table (section6/table-2) keeps its row-placed actions.
    const rowActionsForContacts = json.actions.filter((a) => a.target === 'opportunityPeople');
    assert.equal(rowActionsForContacts.length, 2); // create + delete
    assert.ok(rowActionsForContacts.every((a) => a.placement === 'row'));
  });

  test('validates clean against LayoutDoc end to end', () => {
    const { json } = migrateV1toV2(v1Fixture);
    const result = validateLayoutDoc(json);
    assert.equal(result.valid, true, JSON.stringify(result.errors));
  });

  test('is idempotent: migrating an already-schemaVersion-2 doc through migrateLayoutSchema is a no-op', () => {
    const once = migrateLayoutSchema(v1Fixture);
    assert.equal(once.schemaVersion, 2);
    const twice = migrateLayoutSchema(once.json);
    assert.deepEqual(once.json, twice.json);
    assert.deepEqual(twice.changes, []);
  });

  test('objectName drift: keeps objectName and records the drift, still drops "object"', () => {
    const { json, changes } = migrateV1toV2({
      type: 'detail', object: 'company', objectName: 'companies', sections: [],
    });
    assert.equal(json.objectName, 'companies');
    assert.equal('object' in json, false);
    assert.ok(changes.some((c) => c.includes('drift')));
  });

  test('compact: derives fields[] from sections[] rows/columns when type is compact and fields[] absent', () => {
    const { json } = migrateV1toV2({
      type: 'compact',
      objectName: 'company',
      sections: [{
        id: 's1', type: 'content', rows: [{
          id: 'r1', columns: [{
            id: 'f1', type: 'content', object: 'company',
            display: { value: 'name', fieldType: 'readOnly' },
          }],
        }],
      }],
    });
    assert.equal(json.fields.length, 1);
    const result = validateLayoutDoc(json, { type: 'compact' });
    assert.equal(result.valid, true, JSON.stringify(result.errors));
  });

  test('leaves a non-trivial multi-token join template untouched (dedicated case, not the empty-column one)', () => {
    const { json, changes } = migrateV1toV2({
      type: 'detail',
      objectName: 'company',
      sections: [{
        id: 's1', type: 'table', header: { value: 'X' }, editable: true,
        tables: [{
          id: 't1', object: 'contacts',
          join: { column: 'companyId', value: '{{firstName}} {{lastName}}' },
          fields: [{ field: 'name', display: 'Name' }],
        }],
      }],
    });
    assert.equal('join' in json.sections[0].tables[0], false);
    assert.equal(json.sections[0].relatedLists, undefined);
    assert.ok(changes.some((c) => c.includes('left as legacy shape')));
  });
});
