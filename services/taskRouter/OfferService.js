import { internalRequest } from '../../base.js';

/**
 * Offer Service - accept/decline a direct offer (transfer/invite/help) routed to a user
 */
export class OfferService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Accept a pending direct offer.
   * Creates/reuses the caller's worker session as needed and assigns the task to them.
   *
   * @param {Object} options - Options
   * @param {string} options.offerId - Offer ID
   * @returns {Promise<Object>} { taskId, workerId, isVoice }
   *
   * @example
   * const result = await sdk.taskRouter.offer.accept({ offerId: 'offer_123' });
   */
  async accept({ offerId }) {
    this.sdk.validateParams(
      { offerId },
      {
        offerId: { type: 'string', required: true },
      },
    );

    const params = {
      body: { offerId },
    };

    const result = await internalRequest(this.sdk,
      '/taskRouter/offers/accept',
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Decline a pending direct offer.
   *
   * @param {Object} options - Options
   * @param {string} options.offerId - Offer ID
   * @returns {Promise<Object>} { offerId }
   *
   * @example
   * const result = await sdk.taskRouter.offer.decline({ offerId: 'offer_123' });
   */
  async decline({ offerId }) {
    this.sdk.validateParams(
      { offerId },
      {
        offerId: { type: 'string', required: true },
      },
    );

    const params = {
      body: { offerId },
    };

    const result = await internalRequest(this.sdk,
      '/taskRouter/offers/decline',
      'PUT',
      params,
    );
    return result;
  }
}
