import { internalRequest } from '../base.js';
export class GoogleCalendarService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async setupWebhook({
    calendarId,
    eventTypes,
    webhookUrl,
    expirationTime,
    recordTypeId,
  } = {}) {
    // Only calendarId is required. The server derives the webhook URL itself
    // (per-environment: https://login.<API_BASE_URL>/webhooks/google/...) and
    // watches all event types, so eventTypes/webhookUrl are optional. They
    // were previously marked required, which broke the common
    // setupWebhook({ calendarId }) call site (createRoom) with
    // "Missing required parameter eventTypes".
    // recordTypeId is optional: callers (e.g. createRoom) pass the meeting's
    // already-resolved recordTypeId so the webhook row inherits it; if omitted
    // the server resolves a fallback via findRecordTypeId.
    this.sdk.validateParams(
      { calendarId, eventTypes, webhookUrl, recordTypeId },
      {
        calendarId: { type: 'string', required: true },
        eventTypes: { type: 'array', required: false },
        webhookUrl: { type: 'string', required: false },
        expirationTime: { type: 'number', required: false },
        recordTypeId: { type: 'string', required: false },
      },
    );

    const webhookData = { calendarId };
    if (eventTypes) webhookData.eventTypes = eventTypes;
    if (webhookUrl) webhookData.webhookUrl = webhookUrl;
    if (expirationTime) webhookData.expirationTime = expirationTime;
    if (recordTypeId) webhookData.recordTypeId = recordTypeId;

    const params = {
      body: webhookData,
    };

    const result = await internalRequest(this.sdk, 
      '/googleCalendar/webhook',
      'POST',
      params,
    );
    return result;
  }

  async removeWebhook(webhookId) {
    this.sdk.validateParams(
      { webhookId },
      {
        webhookId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/googleCalendar/webhook/${webhookId}`,
      'DELETE',
    );
    return result;
  }

  async listWebhooks() {
    const result = await internalRequest(this.sdk, '/googleCalendar/webhooks', 'GET');
    return result;
  }

  async getCalendarList() {
    const result = await internalRequest(this.sdk, '/googleCalendar/calendars', 'GET');
    return result;
  }

  async getCalendarEvents(calendarId, options = {}) {
    this.sdk.validateParams(
      { calendarId },
      {
        calendarId: { type: 'string', required: true },
      },
    );

    // Validate optional parameters
    const validationSchema = {};
    if ('timeMin' in options) validationSchema.timeMin = { type: 'string' };
    if ('timeMax' in options) validationSchema.timeMax = { type: 'string' };
    if ('maxResults' in options)
      validationSchema.maxResults = { type: 'number' };
    if ('orderBy' in options) validationSchema.orderBy = { type: 'string' };

    if (Object.keys(validationSchema).length > 0) {
      this.sdk.validateParams(options, validationSchema);
    }

    const params = {
      query: { calendarId, ...options },
    };

    const result = await internalRequest(this.sdk, 
      '/googleCalendar/events',
      'GET',
      params,
    );
    return result;
  }

  async processCalendarChange(changeData) {
    this.sdk.validateParams(
      { changeData },
      {
        changeData: { type: 'object', required: true },
      },
    );

    const params = {
      body: changeData,
    };

    const result = await internalRequest(this.sdk, 
      '/googleCalendar/processChange',
      'POST',
      params,
    );
    return result;
  }
}
