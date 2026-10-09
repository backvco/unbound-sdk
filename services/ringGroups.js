import { internalRequest } from '../base.js';

// Ring groups CRUD goes through sdk.objects.* ('ringGroups' /
// 'ringGroupMembers') -- this service only carries the 3 helper endpoints
// that don't fit the generic objects shape (ring-groups-plan.md §4.5).
export class RingGroupsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Check whether an extension number is free, with a suggested next free
   * number when it isn't.
   *
   * @param {string|number} extension - Extension number to check
   * @param {string} [excludeId] - An extensions row id to ignore (the
   *   group's own extension, when re-checking its current number while
   *   editing it)
   * @returns {Promise<Object>} result
   * @returns {boolean} result.available
   * @returns {number|null} result.suggestion - Next free extension when
   *   `available` is false
   *
   * @example
   * const { available, suggestion } = await sdk.ringGroups.extensionAvailable(305);
   */
  async extensionAvailable(extension, excludeId) {
    this.sdk.validateParams(
      { extension },
      { extension: { type: 'string', required: true } },
    );

    const params = {
      query: {
        extension,
        ...(excludeId ? { excludeId } : {}),
      },
    };

    return await internalRequest(
      this.sdk,
      '/ringGroups/extensions/available',
      'GET',
      params,
    );
  }

  /**
   * Rewrites a ring group's hunt-order sortOrder to 1..n in the given
   * order. 400s if `memberIds` isn't exactly the group's current
   * (non-deleted) member set.
   *
   * @param {string} id - Ring group id
   * @param {string[]} memberIds - Member ids in the desired hunt order
   * @returns {Promise<Object>} result with the applied memberIds
   *
   * @example
   * await sdk.ringGroups.reorderMembers('290...', ['291...a', '291...b']);
   */
  async reorderMembers(id, memberIds) {
    this.sdk.validateParams(
      { id, memberIds },
      {
        id: { type: 'string', required: true },
        memberIds: { type: 'array', required: true },
      },
    );

    const params = { body: { memberIds } };

    return await internalRequest(
      this.sdk,
      `/ringGroups/${id}/members/reorder`,
      'POST',
      params,
    );
  }

  /**
   * Lists ring groups as routing-picker targets: `{ id, name, extension }`
   * per group, for phone-number and final-destination pickers.
   *
   * @returns {Promise<Array<Object>>} targets
   *
   * @example
   * const targets = await sdk.ringGroups.routingTargets();
   */
  async routingTargets() {
    return await internalRequest(this.sdk, '/ringGroups/routingTargets', 'GET', {});
  }
}
