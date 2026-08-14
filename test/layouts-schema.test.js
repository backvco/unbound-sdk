import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  LayoutDoc, CompactLayoutDoc, KanbanConfigSpec, RelatedListSpec, ActionSpec,
  JoinSpec, normalizeJoinSpec, validateLayoutDoc, migrateLayoutSchema,
} from '../schemas/layouts/index.js';

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

describe('migrateV1toV2 (via migrateLayoutSchema)', () => {
  // Realistic v1 fixture, structurally lifted from
  // app1-api/src/services/layouts/examples.json's company-detail doc
  // (legacy `object` key, legacy single-table section, legacy table join,
  // legacy component join, empty `actions:{}`) but trimmed and sanitized to
  // be schema-clean post-migration — the real stored doc carries additional,
  // independently-expected structural warnings (e.g. an unconfigured kanban
  // columnField, url-only selectDynamic entries missing queryConfig) that
  // are asserted separately in Phase 1's manual validation-gate step, not
  // here (see spec §5).
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
        id: 'section4',
        type: 'table',
        header: { value: 'Opportunities' },
        editable: true,
        object: 'opportunities',
        join: { column: 'companyId', value: '{{id}}' },
        fields: [{ field: 'name', display: 'Name' }],
        actions: { edit: true, create: true, delete: false },
      },
    ],
    objectName: 'company',
  };

  test('migrates schemaVersion, keeps every v1 key (additive), and validates clean', () => {
    const migrated = migrateLayoutSchema(v1Fixture);

    assert.equal(migrated.schemaVersion, 2);
    assert.equal(migrated.objectName, 'company');

    // Additive: every original v1 top-level key must still be present.
    for (const key of Object.keys(v1Fixture)) {
      assert.ok(key in migrated, `expected migrated doc to still carry v1 key "${key}"`);
    }

    // The legacy single-table section (section4) is wrapped into tables[].
    const tableSection = migrated.sections.find((s) => s.id === 'section4');
    assert.equal(tableSection.tables.length, 1);
    assert.deepEqual(tableSection.tables[0].join, { childField: 'companyId', parentField: 'id' });

    // The component-typed field's legacy join is also normalized (see
    // migrateV1toV2.js's normalizeRows() — a Phase 1 addition over the
    // spec's literal sample, see IMPLEMENTATION deviation notes).
    const componentField = migrated.sections[1].rows[0].columns[0];
    assert.deepEqual(componentField.join, { childField: 'companyId', parentField: 'id' });

    const result = validateLayoutDoc(migrated);
    assert.equal(result.valid, true, JSON.stringify(result.errors));
  });

  test('is a no-op once schemaVersion is already 2', () => {
    const once = migrateLayoutSchema(v1Fixture);
    const twice = migrateLayoutSchema(once);
    assert.deepEqual(once, twice);
  });
});
