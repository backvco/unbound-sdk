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
   * @param {string} params.to - Recipient phone number (required)
   * @param {string} [params.from] - Sender phone number
   * @param {string} [params.message] - Message text
   * @param {string} [params.templateId] - Template ID to use
   * @param {Object} [params.variables] - Template variables
   * @param {Array<string>} [params.mediaUrls] - Media URLs for MMS
   * @param {string} [params.webhookUrl] - Webhook URL for delivery status
   * @param {string} [params.relatedId] - Task/engagement (or other record) id
   *   to attach this message to, so it surfaces on that record's feed
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
  }) {
    const messageData = {};
    if (from) messageData.from = from;
    if (message) messageData.message = message;
    if (templateId) messageData.templateId = templateId;
    if (variables) messageData.variables = variables;
    if (mediaUrls) messageData.mediaUrls = mediaUrls;
    if (webhookUrl) messageData.webhookUrl = webhookUrl;
    if (relatedId) messageData.relatedId = relatedId;

    this.sdk.validateParams(
      { to, ...messageData },
      {
        to: { type: 'string', required: true },
        from: { type: 'string', required: false },
        message: { type: 'string', required: false },
        templateId: { type: 'string', required: false },
        variables: { type: 'object', required: false },
        mediaUrls: { type: 'array', required: false },
        webhookUrl: { type: 'string', required: false },
        relatedId: { type: 'string', required: false },
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
}
