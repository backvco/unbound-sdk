import { internalRequest } from '../base.js';
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
   *   ('call','voicemail','fax','sms','meeting'). Pass an array or a
   *   comma-joined string; omit to include all kinds.
   * @param {number} [params.limit] - Max items to return.
   * @param {string} [params.before] - UTC cursor 'YYYY-MM-DD HH:mm:ss';
   *   only items strictly older than this are returned.
   * @param {boolean} [params.unreadOnly] - When true, only unread items.
   * @param {string} [params.startDate] - Inclusive range start `YYYY-MM-DD`.
   * @param {string} [params.endDate] - Inclusive range end `YYYY-MM-DD`.
   * @param {string} [params.q] - Search numbers, names, previews.
   * @param {string} [params.direction] - `inbound` or `outbound`.
   * @param {boolean} [params.missed] - Missed inbound calls only.
   * @param {boolean} [params.hasRecording] - Calls/meetings with a recording.
   * @param {boolean} [params.hasTranscription] - Calls/meetings/voicemail
   *   with a transcript.
   * @returns {Promise<{items: Object[], nextCursor: string|null}>}
   */
  async list({
    types,
    limit,
    before,
    unreadOnly,
    startDate,
    endDate,
    q,
    direction,
    missed,
    hasRecording,
    hasTranscription,
  } = {}) {
    this.sdk.validateParams(
      {
        limit,
        before,
        unreadOnly,
        startDate,
        endDate,
        q,
        direction,
        missed,
        hasRecording,
        hasTranscription,
      },
      {
        limit: { type: 'number', required: false },
        before: { type: 'string', required: false },
        unreadOnly: { type: 'boolean', required: false },
        startDate: { type: 'string', required: false },
        endDate: { type: 'string', required: false },
        q: { type: 'string', required: false },
        direction: { type: 'string', required: false },
        missed: { type: 'boolean', required: false },
        hasRecording: { type: 'boolean', required: false },
        hasTranscription: { type: 'boolean', required: false },
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
    if (startDate !== undefined) query.startDate = startDate;
    if (endDate !== undefined) query.endDate = endDate;
    if (q !== undefined) query.q = q;
    if (direction !== undefined) query.direction = direction;
    if (missed !== undefined) query.missed = missed;
    if (hasRecording !== undefined) query.hasRecording = hasRecording;
    if (hasTranscription !== undefined) {
      query.hasTranscription = hasTranscription;
    }

    const params = { query };

    const result = await internalRequest(this.sdk, '/inbox', 'GET', params);
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

    const result = await internalRequest(this.sdk, '/inbox/smsThread', 'GET', params);
    return result;
  }

  /**
   * Fetch inbox stats (calls/talk time/missed/unread voicemail/meetings) for
   * the current user.
   *
   * @returns {Promise<{callsToday: number, talkTimeSeconds: number, missedToday: number, unreadVoicemail: number, oldestUnreadVoicemailAt: string|null, meetingsToday: number, meetingMinutesToday: number}>}
   */
  async stats() {
    const result = await internalRequest(this.sdk, '/inbox/stats', 'GET');
    return result;
  }

  /**
   * Trigger transcription for a voicemail that has a recording but no
   * transcript (fire-and-forget server-side; poll the record for the
   * resulting `transcription` / `transcriptionStatus`).
   *
   * @param {string} voicemailMessageId
   * @returns {Promise<{accepted?: boolean, skipped?: boolean}>}
   */
  async transcribeVoicemail(voicemailMessageId) {
    this.sdk.validateParams(
      { voicemailMessageId },
      { voicemailMessageId: { type: 'string', required: true } },
    );
    return await internalRequest(this.sdk, 
      `/inbox/voicemail/${voicemailMessageId}/transcribe`,
      'POST',
      { body: {} },
    );
  }
}
