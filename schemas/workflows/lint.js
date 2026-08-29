// Extra, opinionated authoring rules beyond structural validity
// (validate.js). These are the checks design-schema-first.md §2 argues
// "would have caught every authoring bug found in the audit at commit
// time" — run them in CI against every module constants file, not just at
// runtime.

// Walks settings.layout.sections -> rows -> columns -> edit (single or
// array form) and returns a flat list of {entry, path} for every edit
// entry declared, regardless of nesting depth. Repeating sections/rows
// (their `field`/`edit.field` strings containing literal `{{index}}`) walk
// the same as any other row — the lint rules below operate on the string
// shape, not on resolved values.
function collectEditEntries(spec) {
  const entries = [];
  const sections = spec?.settings?.layout?.sections || [];
  sections.forEach((section, sIdx) => {
    (section.rows || []).forEach((row, rIdx) => {
      (row.columns || []).forEach((column, cIdx) => {
        const edit = column.edit;
        if (!edit) return;
        const isArray = Array.isArray(edit);
        const list = isArray ? edit : [edit];
        list.forEach((entry, eIdx) => {
          const editPath = isArray ? `edit[${eIdx}]` : 'edit';
          entries.push({
            entry,
            path: `settings.layout.sections[${sIdx}].rows[${rIdx}].columns[${cIdx}].${editPath}`,
          });
        });
      });
    });
  });
  return entries;
}

export function lintModuleSpec(spec) {
  const errors = [];
  const entries = collectEditEntries(spec);

  // Rule: category must be provided. The registry cross-check (does this
  // category match workflows.js's grouping) happens api-side — this rule
  // only enforces that the module declares one at all.
  if (!spec?.category) {
    errors.push({
      rule: 'category-required',
      path: 'category',
      message: 'category must be provided (registry cross-check happens api-side)',
    });
  }

  // Rule: boolean widget must be 'checkbox'. 'switch' has no renderer at
  // all today — peopleCompanyLink.js's "Create If Not Found" field is
  // configured but silently unsettable through the UI (maps.md
  // module-defs §4.11, edit-panel §3/§4.3).
  entries.forEach(({ entry, path }) => {
    if (entry.fieldType === 'switch') {
      errors.push({
        rule: 'boolean-widget-checkbox',
        path: `${path}.fieldType`,
        message: `fieldType 'switch' has no renderer — use 'checkbox' (field: ${entry.field})`,
      });
    }
  });

  // Rule: every edit[].field's settings.<ns> root must match the module's
  // declared settingsSchema.namespace. Only checked once a module has
  // opted into settingsSchema (additive: unmigrated modules with no
  // settingsSchema skip this rule entirely — they simply aren't covered
  // yet, not "passing"). Fields addressing 'description' (workflowItems)
  // or the phone.*/messaging.* dual-addressing channel are exempt — they
  // never sit under 'settings.' at all.
  const namespace = spec?.settingsSchema?.namespace;
  if (namespace) {
    entries.forEach(({ entry, path }) => {
      const { field } = entry;
      if (typeof field !== 'string' || !field.startsWith('settings.')) return;
      const ns = field.slice('settings.'.length).split(/[.[]/)[0];
      if (ns !== namespace) {
        errors.push({
          rule: 'settings-namespace-match',
          path: `${path}.field`,
          message: `field '${field}' writes to settings.${ns}, but settingsSchema.namespace is '${namespace}' — this field silently no-ops (aBRouting bug class, maps.md module-defs §4.3)`,
        });
      }
    });
  }

  return { valid: errors.length === 0, errors };
}
