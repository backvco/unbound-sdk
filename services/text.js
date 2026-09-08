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

  /**
   * Move a TASK-owned conversation to a user (or UC Chat group) or to a
   * workflow (sms-routing-plan.md K4, plan §3.4 "task -> user"/"task ->
   * workflow"). Caller must be the task's current worker or a manager --
   * enforced server-side. Moving to a user creates/reuses the UC Chat
   * channel for that (identity, counterparty) pair starting from now --
   * prior message history is NOT backfilled into the channel.
   * @param {string} id - textConversations id (required)
   * @param {Object} options - Parameters
   * @param {'user'|'workflow'} options.to - Move target (required)
   * @param {string} [options.userId] - Target user (required if to:'user' and no groupId)
   * @param {string} [options.groupId] - Target UC Chat group (required if to:'user' and no userId)
   * @param {'private'|'public'} [options.visibility] - New channel visibility (to:'user' only)
   * @param {string} [options.workflowId] - Move to a workflow's current version
   * @param {string} [options.workflowVersionId] - Move to a pinned workflow version
   * @returns {Promise<Object>} The updated conversation row
   */
  async move(id, options = {}) {
    const { to, userId, groupId, visibility, workflowId, workflowVersionId } =
      options;

    this.sdk.validateParams(
      { id, to, userId, groupId, visibility, workflowId, workflowVersionId },
      {
        id: { type: 'string', required: true },
        to: { type: 'string', required: true },
        userId: { type: 'string', required: false },
        groupId: { type: 'string', required: false },
        visibility: { type: 'string', required: false },
        workflowId: { type: 'string', required: false },
        workflowVersionId: { type: 'string', required: false },
      },
    );
    if (to !== 'user' && to !== 'workflow') {
      throw new Error("move requires to: 'user' or 'workflow'");
    }
    if (to === 'user' && !userId && !groupId) {
      throw new Error("move to:'user' requires userId or groupId");
    }
    if (to === 'workflow' && !workflowId && !workflowVersionId) {
      throw new Error(
        "move to:'workflow' requires workflowId or workflowVersionId",
      );
    }

    return internalRequest(this.sdk, `/text/conversations/${id}/move`, 'POST', {
      body: { to, userId, groupId, visibility, workflowId, workflowVersionId },
    });
  }

  /**
   * "SMS from an active call": check whether the current user may open the
   * UC Chat text channel for a call's (our number, other party) pair.
   * Never throws for an unavailable result -- check `available`/`reason`.
   * @param {string} cdrId - cdr_acct id for the call (required)
   * @returns {Promise<Object>} { available, reason, phoneNumberId, ourNumber, counterparty, conversationId, channelId, isMember }
   */
  async callThread(cdrId) {
    this.sdk.validateParams(
      { cdrId },
      { cdrId: { type: 'string', required: true } },
    );

    return internalRequest(this.sdk, '/text/call-thread', 'GET', {
      query: { cdrId },
    });
  }

  /**
   * Open (or join) the UC Chat text channel for a call's (our number,
   * other party) pair, minting the conversation/channel if none is open
   * yet. 403s if callThread(cdrId) would report `available: false`.
   * @param {string} cdrId - cdr_acct id for the call (required)
   * @returns {Promise<Object>} { channel, conversationId }
   */
  async openCallThread(cdrId) {
    this.sdk.validateParams(
      { cdrId },
      { cdrId: { type: 'string', required: true } },
    );

    return internalRequest(this.sdk, '/text/call-thread', 'POST', {
      body: { cdrId },
    });
  }
}

export class TextService {
  constructor(sdk) {
    this.sdk = sdk;
    this.conversations = new TextConversationsService(sdk);
  }
}
