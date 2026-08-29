import { z } from 'zod';

export const PortDirection = z.enum(['in', 'out']);

// Mirrors the workflowItemPorts table (maps.md canvas §2) and the `ports: []`
// literals in every constants/workflows/*.js file. Real files never declare
// an explicit port `id` — ports are addressed by direction+label today
// (label-string routing into `getNextModule.js`, flagged as a separate,
// out-of-scope correctness workstream by design-schema-first.md §5.2/
// design-incremental-risk.md §5) — kept optional here, not required, so
// every existing module's ports[] validates unchanged.
export const PortSpec = z.object({
  id: z.string().optional(),
  direction: PortDirection,
  label: z.string().optional(),
  isHidden: z.boolean().default(false),
  isMultiple: z.boolean().default(false),
  isLocked: z.boolean().default(false),
  isConnectionDeletable: z.boolean().default(true),
  bgColor: z.string().optional(),
  textColor: z.string().optional(),
}).passthrough();
