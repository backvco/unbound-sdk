import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { EmailService } from '../services/messaging/EmailService.js';

function buildFakeSdk() {
  const calls = [];
  const fakeSdk = {
    validateParams: () => {},
  };
  fakeSdk[Symbol.for('unbound.sdk.request')] = async (
    endpoint,
    method,
    params,
  ) => {
    calls.push({ endpoint, method, params });
    return { messages: [] };
  };
  return { fakeSdk, calls };
}

describe('EmailService.getMailboxEmails includeTasked', () => {
  test('omits includeTasked by default (API hides tasked mail)', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new EmailService(fakeSdk).getMailboxEmails('mbx-1');
    assert.equal(calls[0].params.query.includeTasked, undefined);
  });

  test('sends includeTasked=true when requested', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    await new EmailService(fakeSdk).getMailboxEmails('mbx-1', {
      includeTasked: true,
    });
    assert.equal(calls[0].params.query.includeTasked, true);
  });
});
