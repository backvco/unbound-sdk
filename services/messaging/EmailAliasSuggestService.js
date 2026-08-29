import { internalRequest } from '../../base.js';

/**
 * Alias suggestion/availability helpers for mailbox creation (plan §4) —
 * mirrors the Extension field UX in UserCreateFormFields.svelte. Exposed
 * as `sdk.messaging.email.mailboxes.aliasSuggest` /
 * `sdk.messaging.email.mailboxes.aliasAvailable`.
 */
export class EmailAliasSuggestService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Suggest an available localpart for a user's mailbox on the account's default domain
   * @param {string} [firstName] - User's first name
   * @param {string} [lastName] - User's last name
   * @param {string} [username] - Fallback token source when name parts are missing
   * @returns {Promise<Object>} { localpart, domain, domainId, available: true }
   * @example
   * const suggestion = await sdk.messaging.email.mailboxes.aliasSuggest({
   *   firstName: 'Jane',
   *   lastName: 'Doe',
   * });
   */
  async suggest({ firstName, lastName, username } = {}) {
    this.sdk.validateParams(
      { firstName, lastName, username },
      {
        firstName: { type: 'string', required: false },
        lastName: { type: 'string', required: false },
        username: { type: 'string', required: false },
      },
    );
    return internalRequest(
      this.sdk,
      '/messaging/email/mailbox/alias-suggest',
      'GET',
      { query: { firstName, lastName, username } },
    );
  }

  /**
   * Check whether a localpart is available on a given domain
   * @param {string} localpart - Localpart to check (part before @)
   * @param {string} domainId - Email domain ID
   * @returns {Promise<Object>} { localpart, domainId, available }
   * @example
   * const { available } = await sdk.messaging.email.mailboxes.aliasAvailable({
   *   localpart: 'jane.doe',
   *   domainId: 'domain123',
   * });
   */
  async available({ localpart, domainId } = {}) {
    this.sdk.validateParams(
      { localpart, domainId },
      {
        localpart: { type: 'string', required: true },
        domainId: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      '/messaging/email/mailbox/alias-available',
      'GET',
      { query: { localpart, domainId } },
    );
  }
}
