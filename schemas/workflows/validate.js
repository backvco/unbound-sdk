import { ModuleSpec } from './moduleSpec.js';

// Structural validity only — "is this a well-formed ModuleSpec". Opinions
// about authoring quality (missing category, banned fieldTypes, field/
// namespace mismatches) live in lintModuleSpec, which every module also
// passing validateModuleSpec should additionally pass before being
// considered fully migrated.
export function validateModuleSpec(spec) {
  const result = ModuleSpec.safeParse(spec);
  if (result.success) {
    return { valid: true, errors: [], data: result.data };
  }
  return {
    valid: false,
    errors: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    data: null,
  };
}
