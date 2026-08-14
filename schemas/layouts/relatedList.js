import { z } from 'zod';
import { JoinSpec } from './join.js';
import { OrderBySpec } from './primitives.js';
import { FormatType } from './format.js';

// New primitive, per V2-PLAN's exact definition. Not yet wired to any
// section (SectionSpec.tables[] stays on the legacy-derived TableSpec/JoinSpec
// shape for this phase) — RelatedListSpec is defined and validated in
// isolation so Phase 4's "one RelatedList engine component" has a frozen
// contract to build against, and so channels/engagementSessions component
// config can be re-expressed against it later without another schema
// rewrite. Folding SectionSpec.tables[] into RelatedListSpec is Open
// Decision #5, explicitly deferred to Phase 5.
const RelatedListInlineColumn = z.object({
  field: z.string().min(1),
  display: z.string().optional(),
  formatType: FormatType.optional(),
  format: z.string().optional(),
});

const RelatedListColumnsSpec = z.union([
  z.object({ compactLayoutRef: z.string().min(1) }),
  z.object({ inline: z.array(RelatedListInlineColumn).min(1) }),
]);

const RowActionCustomSpec = z.object({
  label: z.string().min(1),
  icon: z.string().optional(),
  action: z.enum(['open', 'edit', 'delete', 'custom']),
  target: z.string().optional(),   // custom: workflow/route id resolved by the Phase 4 action registry
});

export const RelatedListSpec = z.object({
  id: z.string().min(1),
  object: z.string().min(1),
  relationship: JoinSpec,           // ONE FK declaration — replaces the 3 join semantics for this primitive
  columns: RelatedListColumnsSpec,
  rowActions: z.object({
    open: z.enum(['tab', 'modal', 'peek']).default('modal'),
    quickEdit: z.enum(['inline', 'modal']).optional(), // 'modal' = opens this object's compact layout
    delete: z.boolean().default(false),
    custom: z.array(RowActionCustomSpec).default([]),
  }).default({ open: 'modal', delete: false, custom: [] }),
  emptyState: z.object({ message: z.string().optional(), icon: z.string().optional() }).optional(),
  defaultSort: OrderBySpec.optional(),
  filters: z.record(z.string()).optional(),   // "<operator>::<term>" DSL — same as buildObjectQuery.js
  pageSize: z.number().int().positive().max(200).default(25),
});
