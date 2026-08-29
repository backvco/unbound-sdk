#!/usr/bin/env node
import { writeFileSync } from 'node:fs';
import { zodToJsonSchema } from 'zod-to-json-schema';
import * as schemas from '../schemas/layouts/index.js';

const DOC_ENTRIES = [
  ['LayoutDoc', schemas.LayoutDoc, 'Root document for type:list|detail layouts.'],
  ['CompactLayoutDoc', schemas.CompactLayoutDoc, 'Root document for type:compact layouts — capped flat field list.'],
  ['SectionSpec', schemas.SectionSpec, 'One section: content | table | kanban | table-kanban.'],
  ['FieldSpec', schemas.FieldSpec, 'One content-row column / component slot.'],
  ['FormatSpec', schemas.FormatSpec, 'Display formatting for a field or table column.'],
  ['JoinSpec', schemas.JoinSpec, 'Canonical parent/child record link (one shape, one meaning).'],
  ['SelectDynamicSpec', schemas.SelectDynamicSpec, 'Server-backed async select/typeahead config.'],
  ['KanbanConfigSpec', schemas.KanbanConfigSpec, 'Kanban board config — simple | related | child-records.'],
  ['RelatedListSpec', schemas.RelatedListSpec, 'Child-object list embedded in a detail view.'],
  ['ActionSpec', schemas.ActionSpec, 'A create/edit/delete/custom action attached to a layout, section, or related list.'],
];

function renderSection([name, schema, description]) {
  const jsonSchema = zodToJsonSchema(schema, name);
  const props = jsonSchema.definitions?.[name]?.properties || jsonSchema.properties || {};
  const required = new Set(jsonSchema.definitions?.[name]?.required || jsonSchema.required || []);
  const rows = Object.entries(props).map(([key, def]) =>
    `| \`${key}\` | ${def.type || 'union/enum — see JSON schema below'} | ${required.has(key) ? 'yes' : 'no'} | ${def.default ?? ''} |`
  );
  return [
    `## ${name}`, '', description, '',
    '| property | type | required | default |', '|---|---|---|---|', ...rows, '',
    '<details><summary>Full JSON schema</summary>', '', '```json',
    JSON.stringify(jsonSchema, null, 2), '```', '</details>', '',
  ].join('\n');
}

const header = [
  '<!-- GENERATED FILE — do not hand-edit. Run `npm run docs:layouts` to regenerate. -->',
  '# Dynamic Layouts v2 — Schema Reference', '',
].join('\n');

writeFileSync(
  new URL('../schemas/layouts/SCHEMA.md', import.meta.url),
  header + DOC_ENTRIES.map(renderSection).join('\n'),
);
console.log('layouts :: generate-layout-schema-docs :: wrote schemas/layouts/SCHEMA.md');
