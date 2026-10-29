import { internalRequest } from '../../base.js';

export class EmailMailboxAppPasswordsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async list(mailboxId) {
    this.sdk.validateParams(
      { mailboxId },
      { mailboxId: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/messaging/email/mailbox/${mailboxId}/app-passwords`,
      'GET',
    );
  }

  async create(mailboxId, { label, scopes, expiresAt } = {}) {
    this.sdk.validateParams(
      { mailboxId, label },
      {
        mailboxId: { type: 'string', required: true },
        label: { type: 'string', required: false },
      },
    );
    return internalRequest(
      this.sdk,
      `/messaging/email/mailbox/${mailboxId}/app-passwords`,
      'POST',
      { body: { label, scopes, expiresAt } },
    );
  }

  async revoke(mailboxId, passwordId) {
    this.sdk.validateParams(
      { mailboxId, passwordId },
      {
        mailboxId: { type: 'string', required: true },
        passwordId: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/messaging/email/mailbox/${mailboxId}/app-passwords/${passwordId}`,
      'DELETE',
    );
  }
}
