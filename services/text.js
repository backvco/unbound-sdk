import { internalRequest } from '../base.js';

// Text routing (sms-routing-plan.md §2/§3.2/§3.4): read-only lookups for the
// durable textConversations row. Mutations (send, park, transfer) go through
// sdk.messaging.sms / sdk.taskRouter.task — this service is for resolving
// "what conversation is this" from the client/CC UI.
export class TextConversationsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Get a single text conversation by id.
   * @param {string} id - textConversations id (required)
   * @returns {Promise<Object>}
   */
  async get(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );

    return internalRequest(this.sdk, `/text/conversations/${id}`, 'GET');
  }

  /**
   * Resolve the currently-open conversation for an (identity, counterparty)
   * pair, if any.
   * @param {Object} options - Parameters
   * @param {string} options.phoneNumberId - our-side identity id (required)
   * @param {string} options.counterparty - external address (required)
   * @returns {Promise<Object|null>} the open conversation row, or null
   */
  async resolve(options = {}) {
    const { phoneNumberId, counterparty } = options;

    this.sdk.validateParams(
      { phoneNumberId, counterparty },
      {
        phoneNumberId: { type: 'string', required: true },
        counterparty: { type: 'string', required: true },
      },
    );

    return internalRequest(this.sdk, '/text/conversations/resolve', 'GET', {
      query: { phoneNumberId, counterparty },
    });
  }
}

export class TextService {
  constructor(sdk) {
    this.sdk = sdk;
    this.conversations = new TextConversationsService(sdk);
  }
}
