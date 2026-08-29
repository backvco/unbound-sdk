import { z } from 'zod';
import { MustacheTemplate } from './primitives.js';
import { SectionSpec } from './section.js';
import { ActionSpec } from './action.js';

const ToggleSpec = z.object({
  enabled: z.boolean().default(false),
  hideOnCreate: z.boolean().default(false),
});

export const LayoutDoc = z.object({
  schemaVersion: z.literal(2).default(2),
  objectName: z.string().min(1),     // canonical key — legacy `object` normalized away by migrateV1toV2
  type: z.enum(['list', 'detail']),  // 'compact' docs validate against CompactLayoutDoc instead
  tabName: MustacheTemplate.default('{{objectName}}'),
  tabIcon: z.string().default('fa-database'),
  sections: z.array(SectionSpec).default([]),
  feeds: ToggleSpec.optional(),
  notes: ToggleSpec.optional(),
  email: ToggleSpec.optional(),
  aiInsights: ToggleSpec.optional(),
  aiGoals: ToggleSpec.optional(),
  googleDrive: z.object({
    enabled: z.boolean().default(false),
    hideOnCreate: z.boolean().default(false),
    sharedDriveId: z.string().optional(),
    folderPath: z.string().optional(),
  }).optional(),
  filterPanel: z.object({
    enabled: z.boolean().default(true),
    defaultCollapsed: z.boolean().default(false),
  }).optional(),
  // v2 canonical: array of ActionSpec, replaces v1's bespoke {create?, edit?}
  // object — see migrations/deriveActions.js for the additive v1→v2 mapping.
  actions: z.array(ActionSpec).default([]),
});
