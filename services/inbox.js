export class InboxService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * List unified inbox items merged across call/voicemail/fax/sms sources,
   * sorted descending by timestamp.
   *
   * @param {Object} params
   * @param {string|string[]} [params.types] - Source kinds to include
   *   ('call','voicemail','fax','sms'). Pass an array or a comma-joined
   *   string; omit to include all kinds.
   * @param {number} [params.limit] - Max items to return.
   * @param {string} [params.before] - UTC cursor 'YYYY-MM-DD HH:mm:ss';
   *   only items strictly older than this are returned.
   * @param {boolean} [params.unreadOnly] - When true, only unread items.
   * @returns {Promise<{items: Object[], nextCursor: string|null}>}
   */
  async list({ types, limit, before, unreadOnly } = {}) {
    this.sdk.validateParams(
      { limit, before, unreadOnly },
      {
        limit: { type: 'number', required: false },
        before: { type: 'string', required: false },
        unreadOnly: { type: 'boolean', required: false },
      },
    );

    if (
      types !== undefined &&
      typeof types !== 'string' &&
      !Array.isArray(types)
    ) {
      throw new Error('types must be a string or an array of strings');
    }

    const query = {};
    if (types !== undefined) {
      query.types = Array.isArray(types) ? types.join(',') : types;
    }
    if (limit !== undefined) query.limit = limit;
    if (before !== undefined) query.before = before;
    if (unreadOnly !== undefined) query.unreadOnly = unreadOnly;

    const params = { query };

    const result = await this.sdk._fetch('/inbox', 'GET', params);
    return result;
  }

  /**
   * Fetch a paginated SMS/MMS thread for a phone number + counterparty pair.
   *
   * @param {Object} params
   * @param {string} params.phoneNumberId - Our phone number id (required).
   * @param {string} params.counterparty - Counterparty phone number (required).
   * @param {number} [params.limit] - Max messages to return.
   * @param {string} [params.before] - UTC cursor 'YYYY-MM-DD HH:mm:ss';
   *   only messages strictly older than this are returned.
   * @returns {Promise<{messages: Object[], nextCursor: string|null}>}
   */
  async smsThread({ phoneNumberId, counterparty, limit, before }) {
    this.sdk.validateParams(
      { phoneNumberId, counterparty, limit, before },
      {
        phoneNumberId: { type: 'string', required: true },
        counterparty: { type: 'string', required: true },
        limit: { type: 'number', required: false },
        before: { type: 'string', required: false },
      },
    );

    const query = { phoneNumberId, counterparty };
    if (limit !== undefined) query.limit = limit;
    if (before !== undefined) query.before = before;

    const params = { query };

    const result = await this.sdk._fetch('/inbox/smsThread', 'GET', params);
    return result;
  }

  /**
   * Fetch inbox stats (calls/talk time/missed/unread voicemail) for the
   * current user.
   *
   * @returns {Promise<{callsToday: number, talkTimeSeconds: number, missedToday: number, unreadVoicemail: number, oldestUnreadVoicemailAt: string|null}>}
   */
  async stats() {
    const result = await this.sdk._fetch('/inbox/stats', 'GET');
    return result;
  }
}
