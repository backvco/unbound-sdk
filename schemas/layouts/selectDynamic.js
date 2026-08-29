import { z } from 'zod';
import { MustacheTemplate } from './primitives.js';

// Canonicalizes away the `url` string / `queryConfig` object duplication and
// the `response` vs `responseMapping` dual mapping (maps.md §1.9). Design
// decision: v2 canonical docs store `queryConfig` only — `url` is never
// authored or persisted; the client's shared selectDynamic resolver (Phase 4,
// src/lib/layout-engine/) regenerates the request URL from `queryConfig` at
// render time, replacing the 3x-duplicated buildSelectDynamicUrl logic
// (Column.svelte:196-245, ModernField.svelte:222-269, WorkflowField.svelte:174-214).
// This is a schema-level decision Phase 4 must honor; flagged in Risks.
export const ResponseMappingSpec = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
});

export const SelectDynamicQueryConfig = z.object({
  object: z.string().min(1),
  select: z.array(z.string()).default(['id', 'name']),
  searchField: z.string().default('name'),
  searchOperator: z.enum(['contains', 'startsWith', 'endsWith', 'eq']).default('contains'),
  valueField: z.string().default('id'),          // canonical name for legacy valueColumn
  displayTemplate: MustacheTemplate.default('{{name}}'),
  limit: z.number().int().positive().max(200).default(25),
  additionalWhere: z.record(z.string()).optional(),  // "<operator>::<term>" DSL, same as buildObjectQuery.js
  orderByField: z.string().optional(),
  orderByDirection: z.enum(['asc', 'desc']).default('asc'),
});

export const SelectDynamicSpec = z.object({
  queryConfig: SelectDynamicQueryConfig,
  responseMapping: ResponseMappingSpec.default({ name: 'name', value: 'id' }),
  multiple: z.boolean().default(false),
  clearable: z.boolean().default(true),
  searchable: z.boolean().default(true),
  preloadOptions: z.boolean().default(false),
  initialSearchQuery: z.string().optional(),
  initialLoadLimit: z.number().int().positive().optional(),
  fetchOptions: z.object({ credentials: z.string().optional() }).optional(),
});
