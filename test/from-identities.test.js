import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { EmailService } from '../services/messaging/EmailService.js';
import { EmailMailboxesService } from '../services/messaging/EmailMailboxesService.js';

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
    return {
      fallbackPolicy: 'system',
      mailboxes: [],
      identities: [],
      suggestions: [],
    };
  };
  return { fakeSdk, calls };
}

describe('sdk.messaging.email.mailboxes from-identities wiring', () => {
  test('exposes listFromIdentities and listMailboxFromIdentities on mailboxes', () => {
    const email = new EmailService({});
    assert.equal(typeof email.mailboxes.listFromIdentities, 'function');
    assert.equal(typeof email.mailboxes.listMailboxFromIdentities, 'function');
  });

  test('exposes listRecipientSuggestions on mailboxes', () => {
    const email = new EmailService({});
    assert.equal(typeof email.mailboxes.listRecipientSuggestions, 'function');
  });
});

describe('EmailMailboxesService.listFromIdentities', () => {
  test('without mailboxId GETs /messaging/email/from-identities', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const result = await new EmailMailboxesService(fakeSdk).listFromIdentities();
    assert.equal(calls.length, 1);
    assert.equal(calls[0].endpoint, '/messaging/email/from-identities');
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(result.identities, []);
  });

  test('with mailboxId GETs /messaging/email/mailbox/:id/from-identities', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new EmailMailboxesService(fakeSdk).listFromIdentities({
      mailboxId: 'mbx-1',
    });
    assert.equal(calls.length, 1);
    assert.equal(
      calls[0].endpoint,
      '/messaging/email/mailbox/mbx-1/from-identities',
    );
    assert.equal(calls[0].method, 'GET');
  });
});

describe('EmailMailboxesService.listMailboxFromIdentities', () => {
  test('requires mailboxId', async () => {
    const { fakeSdk } = buildFakeSdk();
    await assert.rejects(
      () => new EmailMailboxesService(fakeSdk).listMailboxFromIdentities({}),
      /Missing required parameter mailboxId/,
    );
  });

  test('GETs /messaging/email/mailbox/:id/from-identities', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new EmailMailboxesService(fakeSdk).listMailboxFromIdentities({
      mailboxId: 'mbx-9',
    });
    assert.equal(
      calls[0].endpoint,
      '/messaging/email/mailbox/mbx-9/from-identities',
    );
    assert.equal(calls[0].method, 'GET');
  });
});

describe('EmailMailboxesService.listRecipientSuggestions', () => {
  test('without args GETs /messaging/email/recipient-autocomplete', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const result = await new EmailMailboxesService(fakeSdk).listRecipientSuggestions();
    assert.equal(calls.length, 1);
    assert.equal(calls[0].endpoint, '/messaging/email/recipient-autocomplete');
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(calls[0].params, { query: { q: undefined, limit: undefined } });
    assert.deepEqual(result.suggestions, []);
  });

  test('passes q and limit as query params', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new EmailMailboxesService(fakeSdk).listRecipientSuggestions({
      q: 'ada',
      limit: 8,
    });
    assert.equal(calls[0].endpoint, '/messaging/email/recipient-autocomplete');
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(calls[0].params, { query: { q: 'ada', limit: 8 } });
  });

  test('rejects non-string q', async () => {
    const { fakeSdk } = buildFakeSdk();
    await assert.rejects(
      () => new EmailMailboxesService(fakeSdk).listRecipientSuggestions({ q: 1 }),
      /Invalid type for parameter q/,
    );
  });
});
