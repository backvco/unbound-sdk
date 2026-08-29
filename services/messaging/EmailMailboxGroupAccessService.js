import { internalRequest } from '../../base.js';

const VALID_ROLES = ['owner', 'full', 'send', 'read'];

/**
 * Shared mailboxes granted to a group (plan §3.2/§4/§6) — backs
 * Setup → Groups → [id] → Shared mailboxes card. Exposed as
 * `sdk.messaging.email.mailboxes.groupAccess`.
 */
export class EmailMailboxGroupAccessService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * List mailboxes a group has access to
   * @param {string} groupId - Group ID
   * @returns {Promise<Array>} [{ mailboxId, name, mailbox, role }]
   * @example
   * const mailboxes = await sdk.messaging.email.mailboxes.groupAccess.list('group123');
   */
  async list(groupId) {
    this.sdk.validateParams(
      { groupId },
      { groupId: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/messaging/email/group/${groupId}/mailboxes`,
      'GET',
    );
  }

  /**
   * Replace the full set of mailboxes a group has access to
   * @param {string} groupId - Group ID
   * @param {Array<{mailboxId: string, role: string}>} mailboxes - Desired mailbox/role pairs (role: owner|full|send|read); entries omitted are removed
   * @returns {Promise<Array>} [{ mailboxId, name, mailbox, role }]
   * @example
   * await sdk.messaging.email.mailboxes.groupAccess.set('group123', [
   *   { mailboxId: 'mbx1', role: 'full' },
   *   { mailboxId: 'mbx2', role: 'read' },
   * ]);
   */
  async set(groupId, mailboxes) {
    this.sdk.validateParams(
      { groupId, mailboxes },
      {
        groupId: { type: 'string', required: true },
        mailboxes: { type: 'array', required: true },
      },
    );
    for (const entry of mailboxes) {
      if (!entry?.mailboxId || !VALID_ROLES.includes(entry.role)) {
        throw new Error(
          `Each mailbox entry requires mailboxId and role in ${VALID_ROLES.join('|')}`,
        );
      }
    }
    return internalRequest(
      this.sdk,
      `/messaging/email/group/${groupId}/mailboxes`,
      'PUT',
      { body: { mailboxes } },
    );
  }
}
