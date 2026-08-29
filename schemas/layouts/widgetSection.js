import { z } from 'zod';

// Home-dashboard widget placement (Phase 2 'home' layout kind). Standalone
// importable schema, also folded into SectionSpec's discriminated union
// (section.js) as an open widget kind alongside content/table/kanban.
export const WidgetSection = z.object({
  id: z.string().min(1),
  type: z.literal('widget'),
  widgetId: z.string().min(1),
  x: z.number().int().min(0).max(11),
  y: z.number().int().min(0),
  w: z.number().int().min(1).max(12),
  h: z.number().int().min(1).max(8),
  title: z.string().optional(),
  settings: z.record(z.any()).default({}),
});
