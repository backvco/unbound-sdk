import { z } from 'zod';
import { WidgetSection } from './widgetSection.js';

// Home-dashboard layout doc (Phase 2). Validated via validateLayoutDoc when
// type === 'home' — see validate.js. No objectName: home layouts are not
// object-scoped (assignments use objectName: '' by convention, matching the
// table's existing wildcard pattern for recordTypeId/audienceId).
export const HomeLayoutDoc = z.object({
  schemaVersion: z.literal(2).default(2),
  type: z.literal('home'),
  name: z.string().default('Home'),
  tabIcon: z.string().default('fa-home'),
  sections: z.array(WidgetSection).default([]),
});
