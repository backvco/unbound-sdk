import { z } from 'zod';

// Today's shape is {column, value} reused by three consumers with different
// meanings (maps.md §2.6, confirmed): table/component joins use `column` =
// child FK, `value` = Mustache template against the *parent* record (e.g.
// "{{id}}"); kanban child-records joins use {childField, parentField} where
// `parentField` names the field on the parent record directly (no template
// wrapper). Canonical shape unifies on the kanban naming (it's already
// un-templated and clearer) — table/component's `value:"{{x}}"` form is
// normalized to `parentField: "x"` by normalizeJoinSpec below.
export const JoinSpec = z.object({
  childField: z.string().min(1)
    .describe('FK column on the child/related object that stores the parent id (legacy: table/component join.column, kanban join.childField)'),
  parentField: z.string().min(1).default('id')
    .describe('Field read off the parent record to match (legacy: kanban join.parentField; table/component join.value as "{{parentField}}")'),
});

const MUSTACHE_RE = /^\{\{\s*([\w.]+)\s*\}\}$/;

// legacyKind: 'table' | 'component' | 'kanbanChildRecords' — all three raw
// shapes observed in maps.md §1.6/§1.7/§1.10 map onto one JoinSpec.
export function normalizeJoinSpec(raw, legacyKind) {
  if (!raw) return undefined;
  if (legacyKind === 'kanbanChildRecords') {
    return { childField: raw.childField, parentField: raw.parentField || 'id' };
  }
  // table / component: {column, value: "{{field}}"}
  const match = typeof raw.value === 'string' ? raw.value.match(MUSTACHE_RE) : null;
  return {
    childField: raw.column,
    parentField: match ? match[1] : (raw.value || 'id'),
  };
}
