import { SmsTemplatesService } from './SmsTemplatesService.js';

import { internalRequest } from '../../base.js';
export class SmsService {
  constructor(sdk) {
    this.sdk = sdk;
    this.templates = new SmsTemplatesService(sdk);
  }

  /**
   * Send an SMS/MMS message
   * @param {Object} params - Message parameters
   * @param {string|string[]} params.to - Recipient phone number, or an
   *   array of up to 8 for a group MMS send (required)
   * @param {string} [params.from] - Sender phone number
   * @param {string} [params.message] - Message text
   * @param {string} [params.templateId] - Template ID to use
   * @param {Object} [params.variables] - Template variables
   * @param {Array<string>} [params.mediaUrls] - Media URLs for MMS
   * @param {string} [params.webhookUrl] - Webhook URL for delivery status
   * @param {string} [params.relatedId] - Task/engagement (or other record) id
   *   to attach this message to, so it surfaces on that record's feed
   * @param {string} [params.engagementSessionId] - Engagement to attach this message to
   * @param {string} [params.taskId] - Task the message was sent under (multi-channel-per-task attribution)
   * @param {boolean} [params.force] - Force-send past a busy-conversation
   *   (409 TEXT_CONVERSATION_BUSY) collision
   * @returns {Promise<Object>} Message details
   */
  async send({
    from,
    to,
    message,
    templateId,
    variables,
    mediaUrls,
    webhookUrl,
    relatedId,
    engagementSessionId,
    taskId,
    force,
  }) {
    const messageData = {};
    if (from) messageData.from = from;
    if (message) messageData.message = message;
    if (templateId) messageData.templateId = templateId;
    if (variables) messageData.variables = variables;
    if (mediaUrls) messageData.mediaUrls = mediaUrls;
    if (webhookUrl) messageData.webhookUrl = webhookUrl;
    if (relatedId) messageData.relatedId = relatedId;
    if (engagementSessionId) messageData.engagementSessionId = engagementSessionId;
    if (taskId) messageData.taskId = taskId;
    if (force !== undefined) messageData.force = force;

    // `to` is string | string[] (group MMS, up to 8 recipients) --
    // validated by hand since sdk.validateParams has no multi-type support
    // (see TaskService.js's ['string','array'] usage, which hits the same
    // gap) rather than compounding that on a new call site.
    if (to === undefined || to === null) {
      throw new Error('Missing required parameter to');
    }
    if (Array.isArray(to)) {
      if (!to.length || !to.every((n) => typeof n === 'string')) {
        throw new Error('Invalid type for parameter to: expected string or string[]');
      }
    } else if (typeof to !== 'string') {
      throw new Error('Invalid type for parameter to: expected string or string[]');
    }

    this.sdk.validateParams(
      { ...messageData },
      {
        from: { type: 'string', required: false },
        message: { type: 'string', required: false },
        templateId: { type: 'string', required: false },
        variables: { type: 'object', required: false },
        mediaUrls: { type: 'array', required: false },
        webhookUrl: { type: 'string', required: false },
        relatedId: { type: 'string', required: false },
        engagementSessionId: { type: 'string', required: false },
        taskId: { type: 'string', required: false },
        force: { type: 'boolean', required: false },
      },
    );

    const options = {
      body: { to, ...messageData },
    };

    const result = await internalRequest(this.sdk, '/messaging/sms', 'POST', options);
    return result;
  }

  /**
   * Get SMS/MMS message by ID
   * @param {string} id - Message ID
   * @returns {Promise<Object>} Message details
   */
  async get(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, `/messaging/sms/${id}`, 'GET');
    return result;
  }

  /**
   * List SMS/MMS messages tied to a task/engagement (or other record) id —
   * feed read path for the contact-center interaction timeline.
   * @param {string} relatedId - Related record id
   * @returns {Promise<Object>} { messages: [...] }
   */
  async getByRelated(relatedId) {
    this.sdk.validateParams(
      { relatedId },
      {
        relatedId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(
      this.sdk,
      `/messaging/sms/related/${relatedId}`,
      'GET',
    );
    return result;
  }

  /**
   * Re-send a failed message as a new row, linked back via retryOfId
   * (sms-routing-plan.md §5.1, contract C2).
   * @param {string} id - The failed message's id (required)
   * @returns {Promise<Object>} The new message's { id, status }
   */
  async retry(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(
      this.sdk,
      `/messaging/sms/${id}/retry`,
      'POST',
    );
    return result;
  }
}
