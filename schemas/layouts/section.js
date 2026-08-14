import { z } from 'zod';
import { HeaderSpec, ConditionSpec, OrderBySpec } from './primitives.js';
import { FieldSpec } from './field.js';
import { JoinSpec } from './join.js';
import { FormatType } from './format.js';
import { KanbanConfigSpec } from './kanban.js';

const TableFieldSpec = z.object({
  field: z.string().min(1),
  display: z.string().default(''),
  hidden: z.boolean().default(false),
  sortable: z.boolean().default(true),
  type: z.enum(['link']).optional(),
  link: z.string().optional(),
  linkField: z.string().optional(),
  linkObject: z.string().optional(),
  formatType: FormatType.optional(),
  format: z.string().optional(),
  relatedKey: z.string().optional(),
  relatedObject: z.string().optional(),
}).refine((v) => v.type !== 'link' || (v.link && v.linkField && v.linkObject), {
  message: 'type:"link" requires link, linkField, and linkObject',
});

const TableSpec = z.object({
  id: z.string().min(1),
  object: z.string().min(1),
  join: JoinSpec.optional(),   // absent = top-level list table (no parent record)
  fields: z.array(TableFieldSpec).default([]),
  header: HeaderSpec.partial().optional(),
  actions: z.object({
    edit: z.boolean().default(true),
    create: z.boolean().default(false),
    delete: z.boolean().default(false),
    hideOnCreate: z.boolean().default(false),
    cardClick: z.enum(['tab', 'modal']).default('tab'),
  }).default({}),
  orderBy: OrderBySpec.optional(),
  additionalWhere: z.record(z.string()).optional(),
  hideOnCreate: z.boolean().default(false),
});

const RowSpec = z.object({
  id: z.string().min(1),
  columns: z.array(FieldSpec),
});

const BaseSection = z.object({
  id: z.string().min(1),
  header: HeaderSpec.default({}),
  editable: z.boolean().default(true),
  hideOnCreate: z.boolean().default(false),
  autoCollapse: z.boolean().default(false),
  showCollapse: z.boolean().default(false),
  conditions: ConditionSpec.optional(),
});

const ContentSection = BaseSection.extend({
  type: z.literal('content'),
  rows: z.array(RowSpec).default([]),
});

const TableSection = BaseSection.extend({
  type: z.literal('table'),
  tableLayout: z.enum(['full-width', 'two-columns']).default('full-width'),
  tables: z.array(TableSpec).min(1),
});

const KanbanSection = BaseSection.extend({
  type: z.literal('kanban'),
  kanban: KanbanConfigSpec,
});

const TableKanbanSection = BaseSection.extend({
  type: z.literal('table-kanban'),
  defaultView: z.enum(['table', 'kanban']).default('table'),
  tableLayout: z.enum(['full-width', 'two-columns']).default('full-width'),
  tables: z.array(TableSpec).min(1),
  kanban: KanbanConfigSpec,
});

// Note: this schema has no branch for legacy single-table
// section.object/fields/join/actions (no tables[]) — those docs must pass
// through migrateV1toV2 (which auto-wraps them into tables:[{...}], per
// V2-PLAN §6) before they'll validate. This is deliberate: it gives Phase 3's
// "delete TableEditor's legacy code path" work a schema-level forcing
// function.
export const SectionSpec = z.discriminatedUnion('type', [
  ContentSection, TableSection, KanbanSection, TableKanbanSection,
]);
