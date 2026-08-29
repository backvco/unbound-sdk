import { LayoutDoc } from './layoutDoc.js';
import { CompactLayoutDoc } from './compact.js';
import { HomeLayoutDoc } from './homeLayoutDoc.js';

// type: explicit override; falls back to doc.type. Compact docs (type:'compact')
// validate against CompactLayoutDoc; home docs (type:'home') against
// HomeLayoutDoc; everything else against LayoutDoc.
export function validateLayoutDoc(rawDoc, { type } = {}) {
  const docType = type || rawDoc?.type;
  const schema = docType === 'compact'
    ? CompactLayoutDoc
    : docType === 'home'
      ? HomeLayoutDoc
      : LayoutDoc;
  const result = schema.safeParse(rawDoc);
  if (result.success) {
    return { valid: true, errors: [], data: result.data };
  }
  return {
    valid: false,
    errors: result.error.issues.map((i) => ({ path: i.path.join('.'), message: i.message })),
    data: null,
  };
}
