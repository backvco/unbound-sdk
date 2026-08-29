import { z } from 'zod';

// Conditional visibility expression for workflow module layout sections/
// columns. Normalizes the two shapes found across
// app1-api/src/services/objects/constants/workflows/*.js (maps.md
// module-defs §3/§4.12): the implicit-equals shorthand `{field, value}`
// used by ~28 of 29 modules, and the one explicit-operator occurrence
// (sendEmail.js:554-557, `operator: 'not_empty'`, no `value` key at all).
// `operator` defaults to 'equals' via preprocessing so every existing
// layout's `{field, value}` shape parses unchanged — this is
// authoring-time normalization only, never a change to how the client
// evaluates the condition.
export const ConditionOperator = z.enum(['equals', 'not_empty']);

export const Conditional = z.preprocess(
  (v) => (v && typeof v === 'object' && !('operator' in v) ? { ...v, operator: 'equals' } : v),
  z.object({
    field: z.string().min(1),
    operator: ConditionOperator.default('equals'),
    value: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
  }).refine(
    (v) => v.operator === 'not_empty' || v.value !== undefined,
    { message: 'value is required unless operator is not_empty', path: ['value'] },
  ),
);

// `info: {type,message}` banner block seen on ~half the modules
// (wait.js has none; sendEmail.js/selectResult.js/lookup.js do).
export const InfoSpec = z.object({
  type: z.string().min(1),
  message: z.string().min(1),
}).passthrough();

// Repeating section/row config — real occurrences: section-level
// (scriptPage.js x4, sendEmail.js templateVariables, lookup.js/webHook.js
// conditions, setVariable.js, sayIntent.js) and row-level (bot.js
// dataCollectionFields). `field` is the array-typed settings path the
// "+ Add" button pushes a new element into.
export const RepeatingSpec = z.object({
  enabled: z.boolean().default(true),
  field: z.string().min(1),
  object: z.enum(['workflowItems', 'workflowItemSettings']).optional(),
  newLabel: z.string().optional(),
}).passthrough();
