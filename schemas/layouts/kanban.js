import { z } from 'zod';
import { JoinSpec } from './join.js';
import { FormatType } from './format.js';

// Reconciles the 3-modes-described-3-different-ways problem (maps.md §1.7)
// into one discriminated union, and replaces ad hoc cardFields[] with
// compactLayoutId (inline cardFields[] still tolerated, per V2-PLAN §1.4:
// "with inline override still allowed").
const KanbanCardFieldRef = z.object({
  field: z.string().min(1),
  display: z.string().optional(),
  formatType: FormatType.optional(),
  format: z.string().optional(),
  type: z.enum(['link']).optional(),
  linkObject: z.string().optional(),
  linkField: z.string().optional(),
});

const KanbanCardSourceSpec = z.object({
  compactLayoutId: z.string().optional(),           // canonical, v2-preferred
  cardFields: z.array(KanbanCardFieldRef).optional(), // legacy inline fallback, tolerated indefinitely
}).refine((v) => v.compactLayoutId || (v.cardFields && v.cardFields.length > 0), {
  message: 'kanban requires compactLayoutId or a non-empty cardFields[]',
});

const KanbanSummarySpec = z.object({
  type: z.enum(['count', 'sum', 'avg', 'min', 'max']),
  field: z.string().optional(),
  enabled: z.boolean().default(true),
  formatType: z.enum(['currency', 'number']).optional(),
  format: z.string().optional(),
}).refine((v) => v.type === 'count' || !!v.field, {
  message: 'field is required unless type is "count"', path: ['field'],
});

const KanbanActionsSpec = z.object({
  create: z.boolean().default(false),
  edit: z.boolean().default(true),
  delete: z.boolean().default(false),
  cardClick: z.enum(['tab', 'modal', 'none']).default('modal'),
});

const KanbanShared = z.object({
  summaries: z.array(KanbanSummarySpec).default([]),
  actions: KanbanActionsSpec.default({}),
});

const KanbanSimple = KanbanCardSourceSpec.and(KanbanShared).and(z.object({
  mode: z.literal('simple'),
  columnField: z.string().min(1),
  columnSort: z.enum(['asc', 'desc']).default('asc'),
}));

const KanbanRelated = KanbanCardSourceSpec.and(KanbanShared).and(z.object({
  mode: z.literal('related'),
  configObject: z.string().min(1),
  configObjectField: z.string().min(1),
  stagesObject: z.string().min(1),
  stagesColumnField: z.string().min(1),
  stagesOrderField: z.string().optional(),
  stagesSortDirection: z.enum(['asc', 'desc']).default('asc'),
  relationship: z.object({
    configToStages: z.object({ field: z.string().min(1), relatedField: z.string().min(1) }),
    mainToConfig: z.object({ field: z.string().min(1), relatedField: z.string().min(1) }),
  }),
  stageMapping: z.object({ mainField: z.string().min(1), stageField: z.string().min(1) }),
  autoSelect: z.object({
    enabled: z.boolean().default(false),
    field: z.string().optional(),
    value: z.string().optional(),
  }).default({ enabled: false }),
}));

const KanbanChildRecords = KanbanCardSourceSpec.and(KanbanShared).and(z.object({
  mode: z.literal('child-records'),
  childObject: z.string().min(1),
  join: JoinSpec,
  stageMapping: z.object({
    field: z.string().min(1),
    lookupObject: z.string().optional(),
    lookupDisplayField: z.string().optional(),
    lookupOrderField: z.string().optional(),
    filterByParent: z.boolean().default(false),
    stageParentField: z.string().optional(),
    parentRecordField: z.string().optional(),
  }),
}));

// z.union (not discriminatedUnion) because each branch is itself a .and()
// intersection — zod's discriminatedUnion requires each member to be a bare
// ZodObject with the literal at the top level, which intersections aren't.
// Runtime cost is negligible (3 candidates, small objects); revisit if this
// list grows.
export const KanbanConfigSpec = z.union([KanbanSimple, KanbanRelated, KanbanChildRecords]);
