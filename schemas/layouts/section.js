import { z } from 'zod';
import {
  HeaderSpec,
  ConditionSpec,
  OrderByListSpec,
} from './primitives.js';
import { FieldSpec } from './field.js';
import { JoinSpec } from './join.js';
import { FormatType } from './format.js';
import { KanbanConfigSpec } from './kanban.js';
import { RelatedListSpec } from './relatedList.js';
import { WidgetSection } from './widgetSection.js';

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
  orderBy: OrderByListSpec.optional(),
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

// `relatedLists` (Phase 5 addition, SPEC-PHASE-5.md §2.1 step 5): resolves
// relatedList.js's "Open Decision #5" as ADDITIVE, not a fold — `tables[]`
// stays the full, unmodified source of truth (old renderer + Phase 4's
// plain-table view both read it); `relatedLists[]` is a parallel,
// promoted-subset view for Phase 4's dedicated related-list component,
// populated by migrations/promoteRelatedLists.js for qualifying entries
// only. Never required, defaults empty.
const TableSection = BaseSection.extend({
  type: z.literal('table'),
  tableLayout: z.enum(['full-width', 'two-columns']).default('full-width'),
  tables: z.array(TableSpec).min(1),
  relatedLists: z.array(RelatedListSpec).default([]),
});

const KanbanSection = BaseSection.extend({
  type: z.literal('kanban'),
  kanban: KanbanConfigSpec,
});

// Activity feed section (people/company/opportunities detail pages) —
// renders app1-api's GET /object/:id/activity merged feed as a vertical
// timeline, not a table/kanban query. `sources` filters which item kinds
// the feed requests; default is every kind the API can produce.
export const TIMELINE_SOURCES = [
  'web', 'ads', 'form', 'email', 'sms', 'call', 'ticket', 'note', 'score',
  'program', 'file',
];

const TimelineSection = BaseSection.extend({
  type: z.literal('timeline'),
  sources: z.array(z.enum(TIMELINE_SOURCES)).default([...TIMELINE_SOURCES]),
  limit: z.number().int().positive().default(50),
  showFilters: z.boolean().default(true),
});

// Email section (people/company/opportunities detail pages) — renders a
// record-scoped, filtered view over app1-api's GET /object/:id/emails
// (thread-grouped mailbox data), not a table/kanban query.
const EmailSection = BaseSection.extend({
  type: z.literal('email'),
  limit: z.number().int().positive().default(25),
  showSearch: z.boolean().default(true),
  showMailboxFilter: z.boolean().default(true),
  showCompose: z.boolean().default(true),
  hideWhenEmpty: z.boolean().default(true),
});

const TableKanbanSection = BaseSection.extend({
  type: z.literal('table-kanban'),
  defaultView: z.enum(['table', 'kanban']).default('table'),
  tableLayout: z.enum(['full-width', 'two-columns']).default('full-width'),
  tables: z.array(TableSpec).min(1),
  kanban: KanbanConfigSpec,
  relatedLists: z.array(RelatedListSpec).default([]),
});

// Note: this schema has no branch for legacy single-table
// section.object/fields/join/actions (no tables[]) — those docs must pass
// through migrateV1toV2 (which auto-wraps them into tables:[{...}], per
// V2-PLAN §6) before they'll validate. This is deliberate: it gives Phase 3's
// "delete TableEditor's legacy code path" work a schema-level forcing
// function.
export const SectionSpec = z.discriminatedUnion('type', [
  ContentSection, TableSection, KanbanSection, TableKanbanSection, WidgetSection,
  TimelineSection, EmailSection,
]);
