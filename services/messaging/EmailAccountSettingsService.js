import { internalRequest } from '../../base.js';

/**
 * Account-level email settings (plan §3.3) — auto-create-mailbox policy
 * and the default domain new mailboxes/aliases are suggested on. Exposed
 * as `sdk.messaging.email.settings`.
 */
export class EmailAccountSettingsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Get the account's email settings
   * @returns {Promise<Object>} { autoCreateUserMailbox, userMailboxAddressTemplate, defaultEmailDomainId, updatedAt, updatedBy }
   * @example
   * const settings = await sdk.messaging.email.settings.get();
   */
  async get() {
    return internalRequest(this.sdk, '/messaging/email/settings', 'GET');
  }

  /**
   * Update the account's email settings (admin only)
   * @param {boolean} [autoCreateUserMailbox] - Auto-create a dedicated mailbox for new users
   * @param {string} [userMailboxAddressTemplate] - Address template, e.g. '{first}.{last}' (tokens: {first},{last},{f},{username})
   * @param {string} [defaultEmailDomainId] - Verified domain used for auto-created mailboxes and alias suggestions
   * @returns {Promise<Object>} { message }
   * @example
   * await sdk.messaging.email.settings.update({
   *   autoCreateUserMailbox: true,
   *   defaultEmailDomainId: 'domain123',
   * });
   */
  async update({
    autoCreateUserMailbox,
    userMailboxAddressTemplate,
    defaultEmailDomainId,
  } = {}) {
    this.sdk.validateParams(
      { autoCreateUserMailbox, userMailboxAddressTemplate, defaultEmailDomainId },
      {
        autoCreateUserMailbox: { type: 'boolean', required: false },
        userMailboxAddressTemplate: { type: 'string', required: false },
        defaultEmailDomainId: { type: 'string', required: false },
      },
    );
    const body = {};
    if (autoCreateUserMailbox !== undefined)
      body.autoCreateUserMailbox = autoCreateUserMailbox;
    if (userMailboxAddressTemplate !== undefined)
      body.userMailboxAddressTemplate = userMailboxAddressTemplate;
    if (defaultEmailDomainId !== undefined)
      body.defaultEmailDomainId = defaultEmailDomainId;

    return internalRequest(this.sdk, '/messaging/email/settings', 'PUT', {
      body,
    });
  }
}
