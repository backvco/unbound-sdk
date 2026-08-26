import { internalRequest } from '../../base.js';

/**
 * A user's dedicated mailbox (plan §4/§6) — backs Setup → Users →
 * [userId] → Email tab. Exposed as `sdk.messaging.email.mailboxes.forUser`.
 */
export class EmailMailboxUserService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Get a user's dedicated mailbox
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Mailbox details, or a 404 if none exists
   * @example
   * const mailbox = await sdk.messaging.email.mailboxes.forUser.get('user123');
   */
  async get(userId) {
    this.sdk.validateParams(
      { userId },
      { userId: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/messaging/email/mailbox/for-user/${userId}`,
      'GET',
    );
  }

  /**
   * Create a dedicated mailbox for a user (manual create / backfill)
   * @param {string} userId - User ID
   * @param {string} [emailAlias] - Localpart to use; defaults to the account's address template
   * @returns {Promise<Object>} { id, userId, type, systemAddress }
   * @example
   * await sdk.messaging.email.mailboxes.forUser.create('user123', { emailAlias: 'j.doe' });
   */
  async create(userId, { emailAlias } = {}) {
    this.sdk.validateParams(
      { userId, emailAlias },
      {
        userId: { type: 'string', required: true },
        emailAlias: { type: 'string', required: false },
      },
    );
    const body = {};
    if (emailAlias !== undefined) body.emailAlias = emailAlias;
    return internalRequest(
      this.sdk,
      `/messaging/email/mailbox/for-user/${userId}`,
      'POST',
      { body },
    );
  }
}
