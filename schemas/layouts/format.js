import { z } from 'zod';

// Canonical set of display-formatting behaviors, unified across the three
// duplicated call sites (Column.svelte, ModernField.svelte,
// SectionTableRowColumn.svelte) plus formatDisplayValue.js's switch — see
// maps.md §1.8. 'user' renders a linked-user chip (relatedKey/relatedObject
// pair on the owning FieldSpec/TableFieldSpec resolves who to show).
export const FormatType = z.enum([
  'timestamp', 'phone', 'currency', 'number', 'percentage', 'boolean', 'user',
  'securityBlurHover', 'securityBlurAlways', 'securityLastX', 'securityFirstX', 'securityFirstLastX',
  'none',
]);

// `format` is the free-form, formatType-specific option string (e.g. a
// date-fns pattern for 'timestamp', a comma/rounded mode for 'number') —
// deliberately left as z.string() rather than a per-type union: the shapes
// are too varied (date pattern vs. numeric mode vs. a related-object field
// name for 'user') to usefully close without duplicating
// formatDisplayValue.js's switch here. Resolution stays a client concern.
export const FormatSpec = z.object({
  formatType: FormatType,
  format: z.string().optional(),
});
