import { migrateV1toV2 } from './migrateV1toV2.js';

export const migrations = { 1: migrateV1toV2 };

// Pure, runs lazily wherever a caller chooses (Phase 1: nowhere in a live
// read path yet — only from validators/index.js's warn-only pre-check, and
// from tests. Phase 2 wires this into resolve() per V2-PLAN §1.5.)
export function migrateLayoutSchema(doc) {
  let version = doc?.schemaVersion ?? 1;
  let working = doc;
  let iterations = 0;
  while (migrations[version] && iterations < 10) {
    working = migrations[version](working);
    version = working.schemaVersion;
    iterations += 1;
  }
  return working;
}
