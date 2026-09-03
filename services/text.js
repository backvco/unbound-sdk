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

  /**
   * Join a UC-Chat-owned conversation's text channel (sms-routing-plan.md
   * §3.3, contract C5) -- private channels aren't joinable via
   * sdk.chat.channels.join (public-only); public-visibility text channels
   * still require `messaging:sms:send`, which this route enforces.
   * @param {string} id - textConversations id (required)
   * @returns {Promise<Object>} { channel, membership }
   */
  async join(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );

    return internalRequest(this.sdk, `/text/conversations/${id}/join`, 'POST');
  }

  /**
   * Escalate a UC-Chat-owned ('user') conversation to a queue or a
   * workflow (sms-routing-plan.md §3.3/§3.4 "Send to queue" / "Send to
   * workflow"). Pass exactly one of queueId or workflowId/workflowVersionId.
   * @param {string} id - textConversations id (required)
   * @param {Object} options - Parameters
   * @param {string} [options.queueId] - Escalate to a queue (new task)
   * @param {string} [options.workflowId] - Escalate to a workflow's current version
   * @param {string} [options.workflowVersionId] - Escalate to a pinned workflow version
   * @returns {Promise<Object>} The updated conversation row
   */
  async escalate(id, options = {}) {
    const { queueId, workflowId, workflowVersionId } = options;

    this.sdk.validateParams(
      { id, queueId, workflowId, workflowVersionId },
      {
        id: { type: 'string', required: true },
        queueId: { type: 'string', required: false },
        workflowId: { type: 'string', required: false },
        workflowVersionId: { type: 'string', required: false },
      },
    );
    if (!queueId && !workflowId && !workflowVersionId) {
      throw new Error(
        'escalate requires queueId or workflowId/workflowVersionId',
      );
    }

    return internalRequest(this.sdk, `/text/conversations/${id}/escalate`, 'POST', {
      body: { queueId, workflowId, workflowVersionId },
    });
  }
}

export class TextService {
  constructor(sdk) {
    this.sdk = sdk;
    this.conversations = new TextConversationsService(sdk);
  }
}
