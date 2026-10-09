import { internalRequest } from '../base.js';

/**
 * Entitlements / license administration (W2, plan §2 frozen contract).
 * Tenant-admin methods hit `/permissions/*` (admin:license:manage /
 * admin:user:manage, real guard in the controller). Brand-owner methods
 * hit `/permissions/brand/*` (requireBrandOwner + brandId ownership
 * check, 2D). Neither is tenant-writable for seats/overrides/AI --
 * those live under `/internal/authz/*` for account-builder/billing and
 * are not exposed here.
 */
export class LicensesService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Get the tenant's license catalog: license types, seat usage, and the
   * capability catalog.
   * @returns {Promise<Object>} `{ mode, licenseTypes[], capabilities[] }`
   * @example
   * const { licenseTypes } = await sdk.licenses.getCatalog();
   */
  async getCatalog() {
    return internalRequest(this.sdk, '/permissions/licenses', 'GET');
  }

  /**
   * List users stuck in `needs_seat` (no free seat at assign time).
   * @param {string} [licenseTypeCode] - Filter to one license type
   * @returns {Promise<Object>} `{ results: [{ userId, licenseTypeCode, source, createdAt }] }`
   * @example
   * const { results } = await sdk.licenses.listNeedsSeat('license.support');
   */
  async listNeedsSeat(licenseTypeCode) {
    const params = licenseTypeCode ? { query: { licenseTypeCode } } : {};
    return internalRequest(
      this.sdk,
      '/permissions/licenses/needs-seat',
      'GET',
      params,
    );
  }

  /**
   * Get one user's licenses and resolved entitlements.
   * @param {string} userId
   * @returns {Promise<Object>} `{ licenses[], capabilities[], disabledCapabilities[], licenseGate }`
   * @example
   * await sdk.licenses.getUserLicenses('user-123');
   */
  async getUserLicenses(userId) {
    this.sdk.validateParams(
      { userId },
      { userId: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/permissions/users/${userId}/licenses`,
      'GET',
    );
  }

  /**
   * Assign a license directly to a user. 409s with
   * `code:'seat_limit_reached'` at capacity or `code:'license_type_disabled'`
   * for a disabled type.
   * @param {string} userId
   * @param {string} licenseTypeCode
   * @returns {Promise<Object>} The assigned license row
   * @example
   * await sdk.licenses.assignUserLicense('user-123', 'license.core');
   */
  async assignUserLicense(userId, licenseTypeCode) {
    this.sdk.validateParams(
      { userId, licenseTypeCode },
      {
        userId: { type: 'string', required: true },
        licenseTypeCode: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/permissions/users/${userId}/licenses`,
      'POST',
      { body: { licenseTypeCode } },
    );
  }

  /**
   * Remove a user's direct license grant (group-sourced grants are
   * unaffected -- see `recomputeUserLicenses`).
   * @param {string} userId
   * @param {string} licenseTypeCode
   * @returns {Promise<Object>}
   * @example
   * await sdk.licenses.removeUserLicense('user-123', 'license.core');
   */
  async removeUserLicense(userId, licenseTypeCode) {
    this.sdk.validateParams(
      { userId, licenseTypeCode },
      {
        userId: { type: 'string', required: true },
        licenseTypeCode: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/permissions/users/${userId}/licenses/${licenseTypeCode}`,
      'DELETE',
    );
  }

  /**
   * Get a group's license types (group-sourced grants fan out to members).
   * @param {string} groupId
   * @returns {Promise<Object>} `{ licenseTypeCodes: [] }`
   * @example
   * await sdk.licenses.getGroupLicenses('group-123');
   */
  async getGroupLicenses(groupId) {
    this.sdk.validateParams(
      { groupId },
      { groupId: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/permissions/groups/${groupId}/licenses`,
      'GET',
    );
  }

  /**
   * Replace a group's license types. Triggers a `recomputeUserLicenses`
   * fan-out for every member.
   * @param {string} groupId
   * @param {string[]} licenseTypeCodes
   * @returns {Promise<Object>}
   * @example
   * await sdk.licenses.setGroupLicenses('group-123', ['license.core']);
   */
  async setGroupLicenses(groupId, licenseTypeCodes) {
    this.sdk.validateParams(
      { groupId, licenseTypeCodes },
      {
        groupId: { type: 'string', required: true },
        licenseTypeCodes: { type: 'array', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/permissions/groups/${groupId}/licenses`,
      'PUT',
      { body: { licenseTypeCodes } },
    );
  }

  /**
   * Set a user's active/disabled status (W1-3). Disabling bumps the
   * user's token_version and logs them out of every queue.
   * @param {string} userId
   * @param {'active'|'disabled'} status
   * @returns {Promise<Object>}
   * @example
   * await sdk.licenses.setUserStatus('user-123', 'disabled');
   */
  async setUserStatus(userId, status) {
    this.sdk.validateParams(
      { userId, status },
      {
        userId: { type: 'string', required: true },
        status: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/permissions/users/${userId}/status`,
      'PUT',
      { body: { status } },
    );
  }

  /**
   * Get a user's active/disabled status (read-side of setUserStatus,
   * W1-3). Allowed for the caller's own userId with no scope, or for any
   * userId in the account when holding admin:user:manage.
   * @param {string} userId
   * @returns {Promise<Object>} `{ userId, status, updatedAt? }`
   * @example
   * await sdk.licenses.getUserStatus('user-123');
   */
  async getUserStatus(userId) {
    this.sdk.validateParams(
      { userId },
      { userId: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/permissions/users/${userId}/status`,
      'GET',
    );
  }

  // -- Brand-owner methods (requireBrandOwner; 2D api routes) --------------

  /**
   * Brand owner: list the tenant accounts under this brand, with their
   * seats and overrides.
   * @returns {Promise<Object>} `{ accounts: [{ id, name, code, aiEnabled, seats[], overrides[] }] }`
   * @example
   * const { accounts } = await sdk.licenses.listBrandAccounts();
   */
  async listBrandAccounts() {
    return internalRequest(this.sdk, '/permissions/brand/accounts', 'GET');
  }

  /**
   * Brand owner: get one brand account's entitlements.
   * @param {string} accountId
   * @returns {Promise<Object>} `{ id, name, code, aiEnabled, seats[], overrides[] }`
   * @example
   * await sdk.licenses.getBrandAccountEntitlements('acct-123');
   */
  async getBrandAccountEntitlements(accountId) {
    this.sdk.validateParams(
      { accountId },
      { accountId: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/permissions/brand/accounts/${accountId}/entitlements`,
      'GET',
    );
  }

  /**
   * Brand owner: set a brand account's seat pool for one license type.
   * @param {string} accountId
   * @param {string} licenseTypeCode
   * @param {Object} seats
   * @param {number} seats.seatCount
   * @param {boolean} [seats.enabled]
   * @param {boolean} [seats.isDefaultForNewUsers]
   * @returns {Promise<Object>}
   * @example
   * await sdk.licenses.setBrandAccountSeats('acct-123', 'license.core', { seatCount: 25 });
   */
  async setBrandAccountSeats(
    accountId,
    licenseTypeCode,
    { seatCount, enabled, isDefaultForNewUsers } = {},
  ) {
    this.sdk.validateParams(
      { accountId, licenseTypeCode, seatCount },
      {
        accountId: { type: 'string', required: true },
        licenseTypeCode: { type: 'string', required: true },
        seatCount: { type: 'number', required: true },
      },
    );
    const body = { seatCount };
    if (enabled !== undefined) body.enabled = enabled;
    if (isDefaultForNewUsers !== undefined)
      body.isDefaultForNewUsers = isDefaultForNewUsers;
    return internalRequest(
      this.sdk,
      `/permissions/brand/accounts/${accountId}/license-seats/${licenseTypeCode}`,
      'PUT',
      { body },
    );
  }

  /**
   * Brand owner: enable or disable a capability override for a brand
   * account.
   * @param {string} accountId
   * @param {string} capabilityCode
   * @param {Object} override
   * @param {'enable'|'disable'} override.mode
   * @param {string} [override.reason]
   * @returns {Promise<Object>}
   * @example
   * await sdk.licenses.setBrandAccountOverride('acct-123', 'capability.chat', { mode: 'disable', reason: 'trial ended' });
   */
  async setBrandAccountOverride(accountId, capabilityCode, { mode, reason } = {}) {
    this.sdk.validateParams(
      { accountId, capabilityCode, mode },
      {
        accountId: { type: 'string', required: true },
        capabilityCode: { type: 'string', required: true },
        mode: { type: 'string', required: true },
      },
    );
    const body = { mode };
    if (reason !== undefined) body.reason = reason;
    return internalRequest(
      this.sdk,
      `/permissions/brand/accounts/${accountId}/capability-overrides/${capabilityCode}`,
      'PUT',
      { body },
    );
  }

  /**
   * Brand owner: remove a capability override, reverting to the license
   * template default.
   * @param {string} accountId
   * @param {string} capabilityCode
   * @returns {Promise<Object>}
   * @example
   * await sdk.licenses.deleteBrandAccountOverride('acct-123', 'capability.chat');
   */
  async deleteBrandAccountOverride(accountId, capabilityCode) {
    this.sdk.validateParams(
      { accountId, capabilityCode },
      {
        accountId: { type: 'string', required: true },
        capabilityCode: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/permissions/brand/accounts/${accountId}/capability-overrides/${capabilityCode}`,
      'DELETE',
    );
  }

  /**
   * Brand owner: turn the account's AI features on/off.
   * @param {string} accountId
   * @param {boolean} enabled
   * @returns {Promise<Object>}
   * @example
   * await sdk.licenses.setBrandAccountAiEnabled('acct-123', true);
   */
  async setBrandAccountAiEnabled(accountId, enabled) {
    this.sdk.validateParams(
      { accountId, enabled },
      {
        accountId: { type: 'string', required: true },
        enabled: { type: 'boolean', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/permissions/brand/accounts/${accountId}/ai-enabled`,
      'PUT',
      { body: { enabled } },
    );
  }
}
