import { z } from 'zod';

// Replaces the ad hoc mechanisms cataloged in design-schema-first.md §2
// (hardcoded `type === 'sendEmail'`/`type === 'sayIntent'` branches in
// `update/workflowItemSettings.js`, the separate hand-synced
// DATA_PRODUCER_TYPES registry, the redundant simulate+button dual
// mechanism, the dead `fieldType:'timeControl'` marker) with declared flags
// on the module itself. The whole `capabilities` object is OPTIONAL on
// ModuleSpec — absent means "legacy inferred behavior": every
// currently-shipping module keeps working exactly as today with zero flags
// set (design-incremental-risk.md §2's additive constraint). Execution
// (actually wiring these flags into the backend cascades) is explicitly
// out of scope for this phase — declaring the flag is authoring-time only.

const DynamicPortSyncSpec = z.object({
  triggerField: z.string().min(1),
  portId: z.string().min(1),
});

const SpawnsChildItemsSpec = z.object({
  arrayField: z.string().min(1),
  childType: z.string().min(1),
  parentLinkField: z.string().min(1),
});

const DataProducerSpec = z.object({
  fieldsResolverKey: z.string().min(1),
});

// Unifies the redundant dual mechanism found live in lookup.js/webHook.js/
// timeControl.js — a top-level `simulate:{enabled,endpoint}` block *and* a
// `fieldType:'button', button:{action:'simulate', settingsFields:[...]}`
// layout control, both present for the same "Run Test" feature in the same
// file — into one declared shape.
const SimulatableSpec = z.object({
  endpoint: z.string().min(1),
  settingsFields: z.array(z.string()).default([]),
});

// Formalizes the escape hatch scriptPage.js/timeControl.js already use ad
// hoc via string-match on `module.type` in EditPanel.svelte — the panel
// looks THIS up going forward, never string-matches `type` again.
const CustomEditorSpec = z.object({
  componentKey: z.string().min(1),
});

export const CapabilitiesSpec = z.object({
  deletable: z.boolean().default(true),               // replaces isDeletable
  hiddenFromPicker: z.boolean().default(false),        // replaces isHiddenFromList
  dynamicPorts: z.array(DynamicPortSyncSpec).nullable().default(null),
  spawnsChildItems: SpawnsChildItemsSpec.nullable().default(null),
  outputVariables: z.array(z.string()).default([]),               // was outputVariableFields
  excludedFromVariableExtraction: z.array(z.string()).default([]), // was excludeKeysFromVariableExtraction
  dataProducer: DataProducerSpec.nullable().default(null),         // kills DATA_PRODUCER_TYPES as a separate file
  simulatable: SimulatableSpec.nullable().default(null),
  customEditor: CustomEditorSpec.nullable().default(null),
}).passthrough();
