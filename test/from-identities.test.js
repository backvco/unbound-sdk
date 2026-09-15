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
  fakeSdk[Symbol.for('unbound.sdk.request')] = async (endpoint, method) => {
    calls.push({ endpoint, method });
    return {
      fallbackPolicy: 'system',
      mailboxes: [],
      identities: [],
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
