import { migrateV1toV2 } from './migrateV1toV2.js';

export const CURRENT_SCHEMA_VERSION = 2;

// v0 -> v1: no-op placeholder. No genuinely un-versioned document has ever
// existed in production (schemaVersion was introduced alongside v2 itself),
// but the step is defined so migrateToLatest's version-walking loop has no
// gap for the `doc.schemaVersion` absent/0 default case — see
// SPEC-PHASE-5.md §2.1's registry sample.
function v0ToV1(json) {
  return { json, schemaVersion: 1, changes: [] };
}

export const MIGRATIONS = { 1: v0ToV1, 2: migrateV1toV2 };

/**
 * Runs every migration step from `fromVersion` (exclusive) up to
 * CURRENT_SCHEMA_VERSION (inclusive), threading `changes[]` through.
 * @param {object} json
 * @param {number} fromVersion
 * @param {{ objectName?: string, layoutKind?: 'list'|'detail'|'compact' }} [ctx]
 * @returns {{ json: object, schemaVersion: number, changes: string[] }}
 */
export function migrateToLatest(json, fromVersion, ctx) {
  let out = { json, schemaVersion: fromVersion || 0, changes: [] };
  for (let v = (fromVersion || 0) + 1; v <= CURRENT_SCHEMA_VERSION; v++) {
    const step = MIGRATIONS[v];
    if (!step) continue;
    const result = step(out.json, ctx);
    out = { json: result.json, schemaVersion: v, changes: [...out.changes, ...result.changes] };
  }
  return out;
}

// Convenience wrapper: migrate a stored doc, reading its own schemaVersion
// (public API — announced in CHANGELOG.md 4.2.0 as
// `sdk.layouts.schema.migrateLayoutSchema(doc)`). Docs that predate the
// schemaVersion column entirely default to 0 (equivalent in practice to 1 —
// the v0->v1 step is a no-op — since either way only migrateV1toV2 does
// real work).
export function migrateLayoutSchema(doc, ctx = {}) {
  return migrateToLatest(doc, doc?.schemaVersion ?? 0, ctx);
}
