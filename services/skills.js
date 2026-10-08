import { internalRequest } from '../base.js';

// Skill-proficiency tiers (skill-proficiency-tiers-plan.md). Tier-set/sync
// helpers that don't fit the generic sdk.objects.* shape (userSkills.tier
// writes do go through sdk.objects.* for single-row create/update; this
// service is the bulk/group/resync/suggestion surface).
export class SkillsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Set one user's tier on one skill. Requires the user already have the
   * skill assigned (userSkills row must exist) -- this does not assign
   * the skill. Pushes the updated tier to the task-router worker
   * metadata (setSkillTiers) so routing sees it immediately.
   *
   * @param {string} userId
   * @param {string} skillId
   * @param {string} tier - 'expert' | 'proficient' | 'learning'
   * @returns {Promise<Object>} result
   * @returns {number} result.updated - 1 if a matching userSkills row was found, else 0
   *
   * @example
   * await sdk.skills.setUserTier('u123', 'sk456', 'proficient');
   */
  async setUserTier(userId, skillId, tier) {
    this.sdk.validateParams(
      { userId, skillId, tier },
      {
        userId: { type: 'string', required: true },
        skillId: { type: 'string', required: true },
        tier: { type: 'string', required: true },
      },
    );

    return await internalRequest(this.sdk, '/skills/tiers/set', 'POST', {
      body: { userId, skillId, tier },
    });
  }

  /**
   * Bulk-set a tier on one skill for a list of users. Only users who
   * already have the skill assigned are affected.
   *
   * @param {object} args
   * @param {string[]} args.userIds
   * @param {string} args.skillId
   * @param {string} args.tier - 'expert' | 'proficient' | 'learning'
   * @returns {Promise<Object>} result
   * @returns {number} result.updated - Count of userSkills rows changed
   *
   * @example
   * const { updated } = await sdk.skills.bulkSetTier({
   *   userIds: ['u1', 'u2', 'u3'],
   *   skillId: 'sk456',
   *   tier: 'expert',
   * });
   */
  async bulkSetTier({ userIds, skillId, tier }) {
    this.sdk.validateParams(
      { userIds, skillId, tier },
      {
        userIds: { type: 'array', required: true },
        skillId: { type: 'string', required: true },
        tier: { type: 'string', required: true },
      },
    );

    return await internalRequest(
      this.sdk,
      '/skills/tiers/bulkSet',
      'POST',
      { body: { userIds, skillId, tier } },
    );
  }

  /**
   * Bulk-set a tier on one skill for every currently-active member of a
   * group/team. Membership (groupMembers.removedAt IS NULL) is resolved
   * server-side at call time, so it can never be stale against the
   * caller's last page load.
   *
   * @param {object} args
   * @param {string} args.groupId
   * @param {string} args.skillId
   * @param {string} args.tier - 'expert' | 'proficient' | 'learning'
   * @returns {Promise<Object>} result
   * @returns {number} result.updated - Count of userSkills rows changed
   *
   * @example
   * await sdk.skills.bulkSetTierForGroup({
   *   groupId: 'g789',
   *   skillId: 'sk456',
   *   tier: 'proficient',
   * });
   */
  async bulkSetTierForGroup({ groupId, skillId, tier }) {
    this.sdk.validateParams(
      { groupId, skillId, tier },
      {
        groupId: { type: 'string', required: true },
        skillId: { type: 'string', required: true },
        tier: { type: 'string', required: true },
      },
    );

    return await internalRequest(
      this.sdk,
      '/skills/tiers/bulkSetForGroup',
      'POST',
      { body: { groupId, skillId, tier } },
    );
  }

  /**
   * Re-push every user-with-a-worker's effective skill tiers to
   * task-router worker metadata for the caller's account. Idempotent:
   * pushes real `userSkills.tier` values when `accounts.useSkillTiers` is
   * on, or `{}` (everyone defaults to Expert) when it's off. Used by the
   * account toggle handler and as a manual "Resync tiers" action.
   *
   * @returns {Promise<Object>} result
   * @returns {number} result.workers - Count of workers resynced
   *
   * @example
   * const { workers } = await sdk.skills.resyncTiers();
   */
  async resyncTiers() {
    return await internalRequest(this.sdk, '/skills/tiers/resync', 'POST', {
      body: {},
    });
  }

  /**
   * List pending suggested-tier rows for a user (userSkillSuggestions).
   *
   * @param {string} userId
   * @returns {Promise<Object>} result
   * @returns {Object[]} result.suggestions
   *
   * @example
   * const { suggestions } = await sdk.skills.getSuggestions('u123');
   */
  async getSuggestions(userId) {
    this.sdk.validateParams(
      { userId },
      { userId: { type: 'string', required: true } },
    );

    return await internalRequest(this.sdk, '/skills/suggestions', 'GET', {
      query: { userId },
    });
  }

  /**
   * Accept a suggested tier: sets userSkills.tier to the suggestion's
   * suggestedTier, pushes the change to the router, and marks the
   * suggestion row accepted.
   *
   * @param {string} id - Suggestion id (userSkillSuggestions.id)
   * @returns {Promise<Object>} result
   * @returns {string} result.id
   * @returns {string} result.tier - The tier now in effect
   * @returns {number} result.updated
   *
   * @example
   * await sdk.skills.acceptSuggestion('sugg123');
   */
  async acceptSuggestion(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );

    return await internalRequest(
      this.sdk,
      `/skills/suggestions/${id}/accept`,
      'POST',
      { body: {} },
    );
  }

  /**
   * Dismiss a suggested tier without changing userSkills.tier.
   *
   * @param {string} id - Suggestion id (userSkillSuggestions.id)
   * @returns {Promise<Object>} result
   * @returns {string} result.id
   *
   * @example
   * await sdk.skills.dismissSuggestion('sugg123');
   */
  async dismissSuggestion(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );

    return await internalRequest(
      this.sdk,
      `/skills/suggestions/${id}/dismiss`,
      'POST',
      { body: {} },
    );
  }
}
