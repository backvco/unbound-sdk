import { internalRequest } from '../../base.js';

const VALID_ROLES = ['owner', 'full', 'send', 'read'];
const VALID_PRINCIPAL_TYPES = ['user', 'group'];
const VALID_NOTIFY_MODES = ['all', 'important', 'mute'];

/**
 * Mailbox access grants (mailboxUsers_acct) — plan §3.2/§4.
 * Exposed on the SDK as `sdk.messaging.email.mailboxes.access`.
 */
export class EmailMailboxAccessService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * List access grants (users and groups) for a mailbox
   * @param {string} mailboxId - Mailbox ID
   * @returns {Promise<Object>} { mailboxId, access: [{ principalType, principalId, role, name, email?, notifyMode?, ... }] }
   * @example
   * const { access } = await sdk.messaging.email.mailboxes.access.list('mbx123');
   */
  async list(mailboxId) {
    this.sdk.validateParams(
      { mailboxId },
      { mailboxId: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/messaging/email/mailbox/${mailboxId}/access`,
      'GET',
    );
  }

  /**
   * Grant (or update) a user's or group's access to a mailbox
   * @param {string} mailboxId - Mailbox ID
   * @param {string} principalType - 'user' or 'group'
   * @param {string} principalId - User ID or group ID
   * @param {string} role - 'owner', 'full', 'send', or 'read'
   * @param {string} [notifyMode] - 'all', 'important', or 'mute' (user rows only)
   * @param {boolean} [notifyPush] - Push notifications on (user rows only, default true)
   * @param {boolean} [notifyBadge] - Badge count on (user rows only, default true)
   * @param {boolean} [notifySound] - Sound on (user rows only, default false)
   * @returns {Promise<Object>} { mailboxId, principalType, principalId, role }
   * @example
   * await sdk.messaging.email.mailboxes.access.set('mbx123', 'user', 'user456', 'full');
   */
  async set(
    mailboxId,
    principalType,
    principalId,
    role,
    { notifyMode, notifyPush, notifyBadge, notifySound } = {},
  ) {
    this.sdk.validateParams(
      {
        mailboxId,
        principalType,
        principalId,
        role,
        notifyMode,
        notifyPush,
        notifyBadge,
        notifySound,
      },
      {
        mailboxId: { type: 'string', required: true },
        principalType: {
          type: 'string',
          required: true,
          enum: VALID_PRINCIPAL_TYPES,
        },
        principalId: { type: 'string', required: true },
        role: { type: 'string', required: true, enum: VALID_ROLES },
        notifyMode: { type: 'string', required: false, enum: VALID_NOTIFY_MODES },
        notifyPush: { type: 'boolean', required: false },
        notifyBadge: { type: 'boolean', required: false },
        notifySound: { type: 'boolean', required: false },
      },
    );

    const body = { role };
    if (notifyMode !== undefined) body.notifyMode = notifyMode;
    if (notifyPush !== undefined) body.notifyPush = notifyPush;
    if (notifyBadge !== undefined) body.notifyBadge = notifyBadge;
    if (notifySound !== undefined) body.notifySound = notifySound;

    return internalRequest(
      this.sdk,
      `/messaging/email/mailbox/${mailboxId}/access/${principalType}/${principalId}`,
      'PUT',
      { body },
    );
  }

  /**
   * Remove a user's or group's access grant from a mailbox
   * @param {string} mailboxId - Mailbox ID
   * @param {string} principalType - 'user' or 'group'
   * @param {string} principalId - User ID or group ID
   * @returns {Promise<Object>} { mailboxId, principalType, principalId, message }
   * @example
   * await sdk.messaging.email.mailboxes.access.remove('mbx123', 'user', 'user456');
   */
  async remove(mailboxId, principalType, principalId) {
    this.sdk.validateParams(
      { mailboxId, principalType, principalId },
      {
        mailboxId: { type: 'string', required: true },
        principalType: {
          type: 'string',
          required: true,
          enum: VALID_PRINCIPAL_TYPES,
        },
        principalId: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/messaging/email/mailbox/${mailboxId}/access/${principalType}/${principalId}`,
      'DELETE',
    );
  }

  /**
   * Set the caller's own notification preferences for a mailbox
   * @param {string} mailboxId - Mailbox ID
   * @param {string} [notifyMode] - 'all', 'important', or 'mute'
   * @param {boolean} [notifyPush] - Push notifications on
   * @param {boolean} [notifyBadge] - Badge count on
   * @param {boolean} [notifySound] - Sound on
   * @returns {Promise<Object>} Updated access row for the caller
   * @example
   * await sdk.messaging.email.mailboxes.access.setMyNotifications('mbx123', { notifyMode: 'important' });
   */
  async setMyNotifications(
    mailboxId,
    { notifyMode, notifyPush, notifyBadge, notifySound } = {},
  ) {
    this.sdk.validateParams(
      { mailboxId, notifyMode, notifyPush, notifyBadge, notifySound },
      {
        mailboxId: { type: 'string', required: true },
        notifyMode: { type: 'string', required: false, enum: VALID_NOTIFY_MODES },
        notifyPush: { type: 'boolean', required: false },
        notifyBadge: { type: 'boolean', required: false },
        notifySound: { type: 'boolean', required: false },
      },
    );

    const body = {};
    if (notifyMode !== undefined) body.notifyMode = notifyMode;
    if (notifyPush !== undefined) body.notifyPush = notifyPush;
    if (notifyBadge !== undefined) body.notifyBadge = notifyBadge;
    if (notifySound !== undefined) body.notifySound = notifySound;

    return internalRequest(
      this.sdk,
      `/messaging/email/mailbox/${mailboxId}/access/me/notifications`,
      'PUT',
      { body },
    );
  }
}
