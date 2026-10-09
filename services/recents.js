import { internalRequest } from '../base.js';
export class RecentsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * List unified recents items merged across call/voicemail/fax/sms sources,
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
   * @param {string} [params.voicemailBoxId] - Review this mailbox. Omit
   *   to list the current user's own voicemail.
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
    voicemailBoxId,
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
        voicemailBoxId,
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
        voicemailBoxId: { type: 'string', required: false },
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
    if (voicemailBoxId !== undefined) query.voicemailBoxId = voicemailBoxId;

    const params = { query };

    const result = await internalRequest(this.sdk, '/recents', 'GET', params);
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

    const result = await internalRequest(this.sdk, '/recents/smsThread', 'GET', params);
    return result;
  }

  /**
   * Mailboxes the current user can review: their own, then any personal
   * boxes shared with them. Each row includes that box's unread count.
   *
   * @returns {Promise<{boxes: Object[]}>}
   */
  async voicemailBoxes() {
    return await internalRequest(this.sdk, '/recents/voicemailBoxes', 'GET');
  }

  /**
   * Fetch recents stats (calls/talk time/missed/unread voicemail/meetings) for
   * the current user.
   *
   * @returns {Promise<{callsToday: number, talkTimeSeconds: number, missedToday: number, unreadVoicemail: number, oldestUnreadVoicemailAt: string|null, meetingsToday: number, meetingMinutesToday: number}>}
   */
  async stats() {
    const result = await internalRequest(this.sdk, '/recents/stats', 'GET');
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
      `/recents/voicemail/${voicemailMessageId}/transcribe`,
      'POST',
      { body: {} },
    );
  }
}
