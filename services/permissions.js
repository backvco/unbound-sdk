export class PermissionsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * List permission groups
   * @returns {Promise<Object>} Object with results: Array of permission groups
   * @example
   * const { results } = await sdk.permissions.listGroups();
   */
  async listGroups() {
    const result = await this.sdk._fetch('/permissions/groups', 'GET');
    return result;
  }

  /**
   * Create a new permission group
   * @param {Object} group - Group configuration
   * @param {string} group.name - Group name (required)
   * @param {string} group.description - Group description
   * @returns {Promise<Object>} Created group
   * @example
   * await sdk.permissions.createGroup({
   *   name: 'Support Leads',
   *   description: 'Escalation-tier support agents',
   * });
   */
  async createGroup({ name, description }) {
    this.sdk.validateParams(
      { name, description },
      {
        name: { type: 'string', required: true },
        description: { type: 'string', required: false },
      },
    );

    const groupData = { name };
    if (description !== undefined) groupData.description = description;

    const params = {
      body: groupData,
    };

    const result = await this.sdk._fetch('/permissions/groups', 'POST', params);
    return result;
  }

  /**
   * Update an existing permission group
   * @param {string} groupId - Group ID to update
   * @param {Object} data - Fields to update (e.g. name, description)
   * @returns {Promise<Object>} Updated group
   * @example
   * await sdk.permissions.updateGroup('group-123', { description: 'Updated' });
   */
  async updateGroup(groupId, data) {
    groupId = String(groupId);
    this.sdk.validateParams(
      { groupId },
      {
        groupId: { type: 'string', required: true },
      },
    );

    const params = {
      body: data,
    };

    const result = await this.sdk._fetch(
      `/permissions/groups/${groupId}`,
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Delete a permission group
   * @param {string} groupId - Group ID to delete
   * @returns {Promise<Object>} Deletion confirmation
   * @example
   * await sdk.permissions.deleteGroup('group-123');
   */
  async deleteGroup(groupId) {
    groupId = String(groupId);
    this.sdk.validateParams(
      { groupId },
      {
        groupId: { type: 'string', required: true },
      },
    );

    const result = await this.sdk._fetch(
      `/permissions/groups/${groupId}`,
      'DELETE',
    );
    return result;
  }

  /**
   * Add a user to a permission group
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID to add
   * @returns {Promise<Object>} Membership confirmation
   * @example
   * await sdk.permissions.addGroupMember('group-123', 'user-456');
   */
  async addGroupMember(groupId, userId) {
    groupId = String(groupId);
    userId = String(userId);
    this.sdk.validateParams(
      { groupId, userId },
      {
        groupId: { type: 'string', required: true },
        userId: { type: 'string', required: true },
      },
    );

    const params = {
      body: { userId },
    };

    const result = await this.sdk._fetch(
      `/permissions/groups/${groupId}/members`,
      'POST',
      params,
    );
    return result;
  }

  /**
   * Remove a user from a permission group
   * @param {string} groupId - Group ID
   * @param {string} userId - User ID to remove
   * @returns {Promise<Object>} Removal confirmation
   * @example
   * await sdk.permissions.removeGroupMember('group-123', 'user-456');
   */
  async removeGroupMember(groupId, userId) {
    groupId = String(groupId);
    userId = String(userId);
    this.sdk.validateParams(
      { groupId, userId },
      {
        groupId: { type: 'string', required: true },
        userId: { type: 'string', required: true },
      },
    );

    const result = await this.sdk._fetch(
      `/permissions/groups/${groupId}/members/${userId}`,
      'DELETE',
    );
    return result;
  }

  /**
   * List permission sets (system defaults are returned first)
   * @returns {Promise<Object>} Object with results: Array of permission sets
   * @example
   * const { results } = await sdk.permissions.listPermissionSets();
   */
  async listPermissionSets() {
    const result = await this.sdk._fetch('/permissions/sets', 'GET');
    return result;
  }

  /**
   * Create a new permission set
   * @param {Object} set - Permission set configuration
   * @param {string} set.name - Permission set name (required)
   * @param {Array<string>} set.scopes - Scopes granted by this set (required)
   * @returns {Promise<Object>} Created permission set
   * @example
   * await sdk.permissions.createPermissionSet({
   *   name: 'Voice Admin',
   *   scopes: ['voice:calls:read', 'voice:calls:write'],
   * });
   */
  async createPermissionSet({ name, scopes }) {
    this.sdk.validateParams(
      { name, scopes },
      {
        name: { type: 'string', required: true },
        scopes: { type: 'array', required: true },
      },
    );

    const params = {
      body: { name, scopes },
    };

    const result = await this.sdk._fetch('/permissions/sets', 'POST', params);
    return result;
  }

  /**
   * Update an existing permission set
   * @param {string} setId - Permission set ID to update
   * @param {Object} data - Fields to update (e.g. name, scopes)
   * @returns {Promise<Object>} Updated permission set
   * @example
   * await sdk.permissions.updatePermissionSet('set-123', { scopes: ['voice:calls:read'] });
   */
  async updatePermissionSet(setId, data) {
    setId = String(setId);
    this.sdk.validateParams(
      { setId },
      {
        setId: { type: 'string', required: true },
      },
    );

    const params = {
      body: data,
    };

    const result = await this.sdk._fetch(
      `/permissions/sets/${setId}`,
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Delete a permission set
   * @param {string} setId - Permission set ID to delete
   * @returns {Promise<Object>} Deletion confirmation
   * @example
   * await sdk.permissions.deletePermissionSet('set-123');
   */
  async deletePermissionSet(setId) {
    setId = String(setId);
    this.sdk.validateParams(
      { setId },
      {
        setId: { type: 'string', required: true },
      },
    );

    const result = await this.sdk._fetch(
      `/permissions/sets/${setId}`,
      'DELETE',
    );
    return result;
  }

  /**
   * Assign a permission set to a principal (user or group)
   * @param {Object} assignment - Assignment configuration
   * @param {string} assignment.permissionSetId - Permission set ID (required)
   * @param {string} assignment.principalType - Principal type, e.g. 'user' or 'group' (required)
   * @param {string} assignment.principalId - Principal ID (required)
   * @param {string} assignment.grantType - Grant type, e.g. 'allow' or 'deny' (required)
   * @returns {Promise<Object>} Created assignment
   * @example
   * await sdk.permissions.assignPermissionSet({
   *   permissionSetId: 'set-123',
   *   principalType: 'user',
   *   principalId: 'user-456',
   *   grantType: 'allow',
   * });
   */
  async assignPermissionSet({
    permissionSetId,
    principalType,
    principalId,
    grantType,
  }) {
    permissionSetId = String(permissionSetId);
    principalId = String(principalId);
    this.sdk.validateParams(
      { permissionSetId, principalType, principalId, grantType },
      {
        permissionSetId: { type: 'string', required: true },
        principalType: { type: 'string', required: true },
        principalId: { type: 'string', required: true },
        grantType: { type: 'string', required: true },
      },
    );

    const params = {
      body: { permissionSetId, principalType, principalId, grantType },
    };

    const result = await this.sdk._fetch(
      '/permissions/assignments',
      'POST',
      params,
    );
    return result;
  }

  /**
   * Remove a permission set assignment from a principal
   * @param {string} permissionSetId - Permission set ID
   * @param {string} principalType - Principal type, e.g. 'user' or 'group'
   * @param {string} principalId - Principal ID
   * @returns {Promise<Object>} Removal confirmation
   * @example
   * await sdk.permissions.unassignPermissionSet('set-123', 'user', 'user-456');
   */
  async unassignPermissionSet(permissionSetId, principalType, principalId) {
    permissionSetId = String(permissionSetId);
    principalId = String(principalId);
    this.sdk.validateParams(
      { permissionSetId, principalType, principalId },
      {
        permissionSetId: { type: 'string', required: true },
        principalType: { type: 'string', required: true },
        principalId: { type: 'string', required: true },
      },
    );

    const result = await this.sdk._fetch(
      `/permissions/assignments/${permissionSetId}/${principalType}/${principalId}`,
      'DELETE',
    );
    return result;
  }

  /**
   * Get a user's effective scopes, resolved from all assigned permission sets
   * @param {string} userId - User ID
   * @returns {Promise<Object>} Object with userId, scopes, breakdown ({scope, sources}[]), deniedScopes
   * @example
   * const { scopes, breakdown, deniedScopes } = await sdk.permissions.getEffectiveScopes('user-456');
   */
  /**
   * Effective scopes contributed by membership in a group.
   * @param {string|number} groupId - Group ID (required)
   * @returns {Promise<Object>} { groupId, scopes, breakdown, deniedScopes }
   */
  async getGroupEffectiveScopes(groupId) {
    groupId = String(groupId);
    this.sdk.validateParams(
      { groupId },
      {
        groupId: { type: 'string', required: true },
      },
    );
    const result = await this.sdk._fetch(
      `/permissions/groups/${groupId}/effective-scopes`,
      'GET',
    );
    return result;
  }

  async getEffectiveScopes(userId) {
    userId = String(userId);
    this.sdk.validateParams(
      { userId },
      {
        userId: { type: 'string', required: true },
      },
    );

    const result = await this.sdk._fetch(
      `/permissions/users/${userId}/effective-scopes`,
      'GET',
    );
    return result;
  }

  /**
   * Get the full catalog of available scopes, grouped by pillar
   * @returns {Promise<Object>} Object with pillars: Array of {pillar, scopes: [{scope, label}]}
   * @example
   * const { pillars } = await sdk.permissions.getScopeCatalog();
   */
  async getScopeCatalog() {
    const result = await this.sdk._fetch('/permissions/scope-catalog', 'GET');
    return result;
  }

  /**
   * Catalog of group-settable configuration keys, plus the never-settable list.
   * @returns {Promise<Object>} { groupSettable: [{key,label,type,pillar,...}], neverSettable: [] }
   */
  async getSettingsCatalog() {
    return this.sdk._fetch('/permissions/settings/catalog', 'GET');
  }

  /**
   * Configuration values set at group level.
   * @param {string|number} groupId - Group ID (required)
   * @returns {Promise<Object>} { results: [{settingKey, value, updatedAt}] }
   */
  async listGroupSettings(groupId) {
    groupId = String(groupId);
    this.sdk.validateParams({ groupId }, { groupId: { type: 'string', required: true } });
    return this.sdk._fetch(`/permissions/groups/${groupId}/settings`, 'GET');
  }

  /** Set one configuration value on a group. */
  async setGroupSetting(groupId, settingKey, value) {
    groupId = String(groupId);
    settingKey = String(settingKey);
    this.sdk.validateParams(
      { groupId, settingKey },
      {
        groupId: { type: 'string', required: true },
        settingKey: { type: 'string', required: true },
      },
    );
    return this.sdk._fetch(
      `/permissions/groups/${groupId}/settings/${settingKey}`,
      'PUT',
      { body: { value } },
    );
  }

  /** Unset one configuration value on a group (members revert to the next tier). */
  async deleteGroupSetting(groupId, settingKey) {
    groupId = String(groupId);
    settingKey = String(settingKey);
    this.sdk.validateParams(
      { groupId, settingKey },
      {
        groupId: { type: 'string', required: true },
        settingKey: { type: 'string', required: true },
      },
    );
    return this.sdk._fetch(
      `/permissions/groups/${groupId}/settings/${settingKey}`,
      'DELETE',
    );
  }

  /**
   * Rank groups for same-key conflict resolution; first entry wins.
   * @param {Array<string|number>} order - Group IDs, highest priority first
   */
  async setGroupPriority(order) {
    this.sdk.validateParams({ order }, { order: { type: 'array', required: true } });
    return this.sdk._fetch('/permissions/groups/priority', 'PUT', {
      body: { order: order.map(String) },
    });
  }

  /**
   * Resolved configuration for a user: value, where it came from, and any
   * losing group values for the same key.
   * @returns {Promise<Object>} { [key]: { value, source: {tier, groupId, groupName}, conflicts: [] } }
   */
  async getUserSettings(userId) {
    userId = String(userId);
    this.sdk.validateParams({ userId }, { userId: { type: 'string', required: true } });
    return this.sdk._fetch(`/permissions/users/${userId}/settings`, 'GET');
  }

  /** Override one configuration value for a single user. */
  async setUserSetting(userId, settingKey, value) {
    userId = String(userId);
    settingKey = String(settingKey);
    this.sdk.validateParams(
      { userId, settingKey },
      {
        userId: { type: 'string', required: true },
        settingKey: { type: 'string', required: true },
      },
    );
    return this.sdk._fetch(
      `/permissions/users/${userId}/settings/${settingKey}`,
      'PUT',
      { body: { value } },
    );
  }

  /** Clear a user's override, reverting to the inherited value. */
  async deleteUserSetting(userId, settingKey) {
    userId = String(userId);
    settingKey = String(settingKey);
    this.sdk.validateParams(
      { userId, settingKey },
      {
        userId: { type: 'string', required: true },
        settingKey: { type: 'string', required: true },
      },
    );
    return this.sdk._fetch(
      `/permissions/users/${userId}/settings/${settingKey}`,
      'DELETE',
    );
  }

  // ---- Group-assigned skills and queues (§9.5) --------------------------
  // Set-shaped, not scalar: they union across every group a user belongs to
  // and never consult group priority. Writes fan out to each member's
  // materialized userSkills/queueUsers rows and re-push their live worker.
  //
  // NOTE for anyone adding a method here: `_fetch`'s third argument is the
  // params envelope — a request body MUST be passed as `{ body: {...} }`.
  // Passing the payload bare silently sends no body at all.

  /** Skill + queue vocabulary for the group assignment pickers. */
  async getTaskRoutingCatalog() {
    return this.sdk._fetch('/permissions/task-routing/catalog', 'GET');
  }

  /** Skills this group grants. @returns {Promise<{results: Array<{skillId}>}>} */
  async listGroupSkills(groupId) {
    groupId = String(groupId);
    this.sdk.validateParams(
      { groupId },
      { groupId: { type: 'string', required: true } },
    );
    return this.sdk._fetch(`/permissions/groups/${groupId}/skills`, 'GET');
  }

  /** Replace the group's full skill list. */
  async setGroupSkills(groupId, skillIds) {
    groupId = String(groupId);
    this.sdk.validateParams(
      { groupId, skillIds },
      {
        groupId: { type: 'string', required: true },
        skillIds: { type: 'array', required: true },
      },
    );
    return this.sdk._fetch(`/permissions/groups/${groupId}/skills`, 'PUT', {
      body: { skillIds: skillIds.map(String) },
    });
  }

  /** Queues this group grants. @returns {Promise<{results: Array<{queueId, access, autoLogin}>}>} */
  async listGroupQueues(groupId) {
    groupId = String(groupId);
    this.sdk.validateParams(
      { groupId },
      { groupId: { type: 'string', required: true } },
    );
    return this.sdk._fetch(`/permissions/groups/${groupId}/queues`, 'GET');
  }

  /**
   * Replace the group's full queue list.
   * @param {Array<{queueId: string, access?: boolean, autoLogin?: boolean}>} queues
   *   `autoLogin` seeds the derived membership row and takes effect at the
   *   agent's next availability transition — it never logs anyone in
   *   mid-session.
   */
  async setGroupQueues(groupId, queues) {
    groupId = String(groupId);
    this.sdk.validateParams(
      { groupId, queues },
      {
        groupId: { type: 'string', required: true },
        queues: { type: 'array', required: true },
      },
    );
    return this.sdk._fetch(`/permissions/groups/${groupId}/queues`, 'PUT', {
      body: {
        queues: queues.map((q) => ({
          queueId: String(q.queueId),
          access: q.access !== false,
          autoLogin: Boolean(q.autoLogin),
        })),
      },
    });
  }

  /**
   * A user's effective skills/queues with the source of each row, so the UI
   * can show "granted by group X" instead of offering a control that would
   * silently no-op.
   */
  async getUserTaskRouting(userId) {
    userId = String(userId);
    this.sdk.validateParams(
      { userId },
      { userId: { type: 'string', required: true } },
    );
    return this.sdk._fetch(`/permissions/users/${userId}/task-routing`, 'GET');
  }

  /** Exclude one group-granted skill/queue from this user ("in Sales but not queue X"). */
  async addTaskRoutingExclusion(userId, settingKey, value) {
    userId = String(userId);
    settingKey = String(settingKey);
    value = String(value);
    this.sdk.validateParams(
      { userId, settingKey, value },
      {
        userId: { type: 'string', required: true },
        settingKey: { type: 'string', required: true },
        value: { type: 'string', required: true },
      },
    );
    return this.sdk._fetch(
      `/permissions/users/${userId}/task-routing/exclusions/${settingKey}/${value}`,
      'PUT',
    );
  }

  /** Drop an exclusion, letting the group grant apply again. */
  async removeTaskRoutingExclusion(userId, settingKey, value) {
    userId = String(userId);
    settingKey = String(settingKey);
    value = String(value);
    this.sdk.validateParams(
      { userId, settingKey, value },
      {
        userId: { type: 'string', required: true },
        settingKey: { type: 'string', required: true },
        value: { type: 'string', required: true },
      },
    );
    return this.sdk._fetch(
      `/permissions/users/${userId}/task-routing/exclusions/${settingKey}/${value}`,
      'DELETE',
    );
  }
}
