import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { MessagingService } from '../services/messaging/MessagingService.js';
import { PhoneService } from '../services/messaging/PhoneService.js';

function buildFakeSdk() {
  const calls = [];
  const fakeSdk = {
    validateParams(params, schema) {
      for (const key in schema) {
        if (params[key] === undefined && schema[key].required) {
          throw new Error(`Missing required parameter ${key}`);
        }
        if (params[key] !== undefined && params[key] !== null) {
          const expectedType = schema[key].type;
          const actualValue = params[key];
          const isValidType =
            expectedType === 'array'
              ? Array.isArray(actualValue)
              : typeof actualValue === expectedType;
          if (!isValidType) {
            throw new Error(
              `Invalid type for parameter ${key}: expected ${expectedType}`,
            );
          }
        }
      }
    },
  };
  fakeSdk[Symbol.for('unbound.sdk.request')] = async (endpoint, method, params) => {
    calls.push({ endpoint, method, params });
    return { suggestions: [] };
  };
  return { fakeSdk, calls };
}

describe('sdk.messaging.phone dialer-autocomplete wiring', () => {
  test('exposes dialerAutocomplete on messaging.phone', () => {
    const messaging = new MessagingService({});
    assert.ok(messaging.phone);
    assert.equal(typeof messaging.phone.dialerAutocomplete, 'function');
  });
});

describe('PhoneService.dialerAutocomplete', () => {
  test('without args GETs /messaging/phone/dialer-autocomplete', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const result = await new PhoneService(fakeSdk).dialerAutocomplete();
    assert.equal(calls.length, 1);
    assert.equal(calls[0].endpoint, '/messaging/phone/dialer-autocomplete');
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(calls[0].params, { query: { q: undefined, limit: undefined } });
    assert.deepEqual(result.suggestions, []);
  });

  test('passes q and limit as query params', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new PhoneService(fakeSdk).dialerAutocomplete({
      q: '555',
      limit: 8,
    });
    assert.equal(calls[0].endpoint, '/messaging/phone/dialer-autocomplete');
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(calls[0].params, { query: { q: '555', limit: 8 } });
  });

  test('rejects non-string q', async () => {
    const { fakeSdk } = buildFakeSdk();
    await assert.rejects(
      () => new PhoneService(fakeSdk).dialerAutocomplete({ q: 1 }),
      /Invalid type for parameter q/,
    );
  });
});
