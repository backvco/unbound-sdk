import { internalRequest } from '../../base.js';

/**
 * `sdk.journeys.types.*` -- journeyTypes generic-object CRUD. `queueId`
 * stays empty until P5.
 */
export class JourneyTypesService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async list(opts = {}) {
    return await this.sdk.objects.query({ object: 'journeyTypes', ...opts });
  }

  async get(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return await this.sdk.objects.byId({ id });
  }

  /**
   * @param {Object} body
   * @param {string} body.name
   * @param {'firstTouchClaims'|'perTouch'} [body.poolClaimMode] - first rep to take a pool touch owns the member for the rest of the cadence (default) | no auto-claim
   * @param {'never'|'ifEmpty'|'always'} [body.syncPersonOwner] - whether a member owner assignment also writes people.ownerId (default 'ifEmpty')
   * @param {'person'|'company'} [body.ownerScope] - 'company': claims/reassigns fan out to every open member of the same company in this type (default 'person')
   * @param {'reassign'|'needsAttention'} [body.ownerMissingPolicy] - owner deactivated / lost salesEnabled / left the queue: auto-reassign (backup user → round-robin → pool, default) or park with statusReason 'ownerMissing'
   * @param {number|null} [body.maxActiveMembersPerOwner] - cap of active+needsAttention members per owner across the type; members over the cap wait (status 'waiting', statusReason 'ownerCapacity') and are admitted by people.score DESC, enteredAt ASC. null = unlimited
   * All five are type defaults; a journey may override each with the same field (null = use type default).
   * @returns {Promise<Object>} Created journeyType
   */
  async create(body) {
    this.sdk.validateParams(
      { name: body?.name },
      { name: { type: 'string', required: true } },
    );
    return await this.sdk.objects.create({ object: 'journeyTypes', body });
  }

  async update(id, update) {
    this.sdk.validateParams(
      { id, update },
      {
        id: { type: 'string', required: true },
        update: { type: 'object', required: true },
      },
    );
    return await this.sdk.objects.updateById({
      object: 'journeyTypes',
      id,
      update,
    });
  }

  async remove(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return await this.sdk.objects.deleteById({ object: 'journeyTypes', id });
  }
}
