// Pure fn, no zod import. Flattens a detail-shaped `sections[]` doc into
// CompactLayoutDoc.fields[] when `type==='compact'` — only invoked by
// migrateV1toV2 when a compact-typed legacy doc has `sections` but no
// `fields` yet (see migrateV1toV2.js). CompactLayoutDoc caps at 12 fields
// (schemas/layouts/compact.js), so this stops collecting once it hits that.
export function deriveCompactFields(doc) {
  const fields = [];

  for (const section of doc.sections || []) {
    for (const row of section.rows || []) {
      for (const column of row.columns || []) {
        fields.push(column);
        if (fields.length >= 12) return fields;
      }
    }
  }

  return fields;
}
