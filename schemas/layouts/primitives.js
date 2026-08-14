import { z } from 'zod';

// Not resolved here — just shape-checked. Resolution ({{field}} substitution
// against a record) stays a client/renderer concern (existing replaceVariables()
// in app1-client/src/utils/index.js), unchanged in this phase.
export const MustacheTemplate = z.string().min(1);

// Matches Section.svelte / TableEditor.svelte conditional-visibility operators
// (maps.md §1.5) — verified against Row.svelte:79-116's operator switch.
export const ConditionOperator = z.enum([
  'eq', 'neq', 'contains', 'startsWith', 'endsWith',
  'gt', 'gte', 'lt', 'lte', 'isNull', 'isNotNull',
]);

export const ConditionSpec = z.object({
  field: z.string().min(1),
  operator: ConditionOperator.default('eq'),
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
}).refine(
  (v) => ['isNull', 'isNotNull'].includes(v.operator) || v.value !== undefined,
  { message: 'value is required unless operator is isNull/isNotNull', path: ['value'] },
);

export const OrderBySpec = z.object({
  field: z.string().min(1),
  direction: z.enum(['asc', 'desc']).default('asc'),
});

export const HeaderSpec = z.object({
  value: z.string().default(''),
  collapsedValue: z.string().optional(),
  hidden: z.boolean().default(false),
  size: z.enum(['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl']).optional(),
  weight: z.enum(['thin', 'light', 'normal', 'medium', 'semibold', 'bold', 'black']).optional(),
  icon: z.string().optional(),
  level: z.enum(['1', '2', '3', '4', '5', '6']).optional(),
  collapsible: z.boolean().optional(),
});
