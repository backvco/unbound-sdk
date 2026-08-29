import { z } from 'zod';
import { FieldSpec } from './field.js';

// Per V2-PLAN §1.4: "just { fields: FieldSpec[] } — capped list, no sections."
// Reused everywhere a short field summary is needed: kanban cardFields,
// hover cards, modal create/edit forms.
export const CompactLayoutDoc = z.object({
  schemaVersion: z.literal(2).default(2),
  objectName: z.string().min(1),
  fields: z.array(FieldSpec).min(1).max(12),
});
