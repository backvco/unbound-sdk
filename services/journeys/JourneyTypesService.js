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
