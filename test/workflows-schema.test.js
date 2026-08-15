import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  ModuleSpec, Conditional, PortSpec, CapabilitiesSpec, SettingsSchemaSpec,
  validateModuleSpec, lintModuleSpec,
} from '../schemas/workflows/index.js';
import waitFixture from './fixtures/workflows/wait.fixture.js';
import sayFixture from './fixtures/workflows/say.fixture.js';
import aBRoutingBadFixture from './fixtures/workflows/aBRouting.bad.fixture.js';
import aBRoutingFixedFixture from './fixtures/workflows/aBRouting.fixed.fixture.js';

describe('validateModuleSpec — real, unmigrated module constants', () => {
  test('wait.js validates unchanged (no capabilities/settingsSchema present)', () => {
    const result = validateModuleSpec(waitFixture);
    assert.equal(result.valid, true, JSON.stringify(result.errors));
    assert.equal(result.data.type, 'wait');
    assert.equal(result.data.settings.layout.sections.length, 2);
  });

  test('say.js (phone/messaging dual-channel, no settings.say key) validates unchanged', () => {
    const result = validateModuleSpec(sayFixture);
    assert.equal(result.valid, true, JSON.stringify(result.errors));
    assert.equal(result.data.settings.phone.playback.type, 'text');
    assert.equal(result.data.settings.messaging.text.message, 'Thank you for your message');
  });

  test('rejects a module missing the required label', () => {
    const result = validateModuleSpec({ type: 'x', ports: [] });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.path === 'label'));
  });
});

describe('Conditional — legacy shorthand + operator normalization', () => {
  test('accepts the legacy {field, value} shorthand (~28 of 29 real modules), defaults operator to equals', () => {
    const parsed = Conditional.parse({ field: 'phone.playback.type', value: 'text' });
    assert.equal(parsed.operator, 'equals');
    assert.equal(parsed.value, 'text');
  });

  test('accepts the one real explicit-operator occurrence (sendEmail.js not_empty, no value key)', () => {
    const parsed = Conditional.parse({ field: 'settings.email.templateId', operator: 'not_empty' });
    assert.equal(parsed.operator, 'not_empty');
    assert.equal(parsed.value, undefined);
  });

  test('rejects operator:equals with no value', () => {
    const result = Conditional.safeParse({ field: 'settings.email.mode', operator: 'equals' });
    assert.equal(result.success, false);
  });
});

describe('PortSpec', () => {
  test('accepts a real port literal with no explicit id (label-addressed today)', () => {
    const result = PortSpec.safeParse({ direction: 'out', isHidden: true, label: 'Delivered', bgColor: '#a4bfb0', textColor: '#000' });
    assert.equal(result.success, true);
    assert.equal(result.data.isConnectionDeletable, true);
  });
});

describe('CapabilitiesSpec / SettingsSchemaSpec — additive defaults', () => {
  test('capabilities defaults mirror legacy inferred behavior when every flag is omitted', () => {
    const parsed = CapabilitiesSpec.parse({});
    assert.equal(parsed.deletable, true);
    assert.equal(parsed.hiddenFromPicker, false);
    assert.equal(parsed.dynamicPorts, null);
    assert.equal(parsed.spawnsChildItems, null);
    assert.deepEqual(parsed.outputVariables, []);
  });

  test('settingsSchema requires a namespace', () => {
    const result = SettingsSchemaSpec.safeParse({ defaults: {} });
    assert.equal(result.success, false);
  });
});

describe('lintModuleSpec — category-required', () => {
  test('flags a module with no category', () => {
    const result = lintModuleSpec({ type: 'x', label: 'X' });
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.rule === 'category-required'));
  });

  test('passes for a real module with category set', () => {
    const result = lintModuleSpec(waitFixture);
    assert.equal(result.errors.some((e) => e.rule === 'category-required'), false);
  });
});

describe('lintModuleSpec — boolean-widget-checkbox', () => {
  // Minimal repro of the confirmed live gap (peopleCompanyLink.js:198 —
  // fieldType:'switch' has no renderer in WorkflowField.svelte at all,
  // maps.md module-defs §4.11 / edit-panel §3).
  const specWithSwitch = {
    type: 'peopleCompanyLink',
    category: 'data',
    label: 'People/Company Link',
    ports: [],
    settings: {
      layout: {
        sections: [{
          id: 'options',
          rows: [{
            columns: [{
              edit: { field: 'settings.peopleCompanyLink.createIfNotFound', fieldType: 'switch' },
            }],
          }],
        }],
      },
    },
  };

  test('rejects fieldType: switch', () => {
    const result = lintModuleSpec(specWithSwitch);
    assert.equal(result.valid, false);
    assert.ok(result.errors.some((e) => e.rule === 'boolean-widget-checkbox'));
  });

  test('accepts fieldType: checkbox for the same field', () => {
    const fixed = JSON.parse(JSON.stringify(specWithSwitch));
    fixed.settings.layout.sections[0].rows[0].columns[0].edit.fieldType = 'checkbox';
    const result = lintModuleSpec(fixed);
    assert.equal(result.errors.some((e) => e.rule === 'boolean-widget-checkbox'), false);
  });
});

describe('lintModuleSpec — settings-namespace-match (the aBRouting bug class)', () => {
  test('skips the rule entirely when settingsSchema is absent (unmigrated, additive)', () => {
    const result = lintModuleSpec(waitFixture);
    assert.equal(result.errors.some((e) => e.rule === 'settings-namespace-match'), false);
  });

  test('skips phone.*/messaging.* dual-channel fields even with no settings.<ns> match possible', () => {
    // say.fixture has no settingsSchema at all, so the rule is skipped —
    // this asserts it stays clean even if a namespace were declared, since
    // none of its fields start with "settings.".
    const withNamespace = { ...sayFixture, settingsSchema: { namespace: 'say', defaults: {} } };
    const result = lintModuleSpec(withNamespace);
    assert.equal(result.errors.some((e) => e.rule === 'settings-namespace-match'), false);
  });

  test('catches the real aBRouting.js bug: settings.points.unit vs declared namespace abRoute', () => {
    const result = lintModuleSpec(aBRoutingBadFixture);
    assert.equal(result.valid, false);
    const nsErrors = result.errors.filter((e) => e.rule === 'settings-namespace-match');
    assert.equal(nsErrors.length, 1);
    assert.match(nsErrors[0].message, /settings\.points/);
    assert.match(nsErrors[0].message, /abRoute/);
  });

  test('aBRouting-as-it-should-be: fixed field path passes both validate and lint', () => {
    const validated = validateModuleSpec(aBRoutingFixedFixture);
    assert.equal(validated.valid, true, JSON.stringify(validated.errors));
    const linted = lintModuleSpec(aBRoutingFixedFixture);
    assert.equal(linted.valid, true, JSON.stringify(linted.errors));
  });
});

describe('ModuleSpec — full parse round-trip', () => {
  test('aBRouting-as-it-should-be parses with capabilities + settingsSchema populated', () => {
    const result = ModuleSpec.safeParse(aBRoutingFixedFixture);
    assert.equal(result.success, true);
    assert.equal(result.data.capabilities.deletable, true);
    assert.equal(result.data.settingsSchema.namespace, 'abRoute');
    assert.equal(result.data.moduleSchemaVersion, 1);
  });
});
