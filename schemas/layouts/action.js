import { z } from 'zod';
import { ConditionSpec, MustacheTemplate } from './primitives.js';

// New primitive, per V2-PLAN's exact definition.
export const ActionSpec = z.object({
  id: z.string().min(1),
  type: z.enum(['create', 'edit', 'delete', 'custom']),
  label: z.string().optional(),
  target: z.string().optional(),      // object name (create/edit/delete) or custom-action registry key
  mode: z.enum(['modal', 'tab', 'inline']).default('modal'),
  layout: z.string().optional(),      // compactLayoutId, used when mode:'modal' for create/edit
  placement: z.enum(['header', 'section', 'row', 'card']),
  visibility: ConditionSpec.optional(),
  prefill: z.record(MustacheTemplate).optional(), // e.g. {relatedId: '{{id}}'} — create-with-prefilled-relationship
}).refine((v) => v.type !== 'custom' || !!v.target, {
  message: 'custom action requires target', path: ['target'],
});
