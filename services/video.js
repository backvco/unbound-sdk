import { internalRequest } from '../base.js';
export class VideoService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async clearToken() {
    const params = {};
    const result = await internalRequest(this.sdk, 
      `/video/clearVideoToken`,
      'POST',
      params,
      true,
    );
    return result;
  }

  async joinRoom(
    room,
    password,
    email,
    name,
    firstName,
    lastName,
    tokenType = 'cookie',
    token,
  ) {
    this.sdk.validateParams(
      { room, password, email, name, firstName, lastName, tokenType, token },
      {
        room: { type: 'string', required: true },
        password: { type: 'string', required: false },
        email: { type: 'string', required: false },
        name: { type: 'string', required: false },
        firstName: { type: 'string', required: false },
        lastName: { type: 'string', required: false },
        tokenType: { type: 'string', required: true },
        token: { type: 'string', required: false },
      },
    );

    const params = {
      body: {
        room,
        password,
        email,
        name,
        firstName,
        lastName,
        tokenType,
        token,
      },
    };
    const result = await internalRequest(this.sdk, 
      `/video/${room}/join`,
      'POST',
      params,
      true,
    );
    return result;
  }

  async joinRoomSip({
    room,
    password,
    phoneNumber,
    engagementSessionId,
    voiceChannelId,
    serverId,
    meetingJoinType = 'outboundApi',
  }) {
    this.sdk.validateParams(
      {
        room,
        password,
        phoneNumber,
        engagementSessionId,
        voiceChannelId,
        serverId,
        meetingJoinType,
      },
      {
        room: { type: 'string', required: true },
        password: { type: 'string', required: false },
        phoneNumber: { type: 'string', required: true },
        engagementSessionId: { type: 'string', required: false },
        voiceChannelId: { type: 'string', required: true },
        serverId: { type: 'string', required: true },
        meetingJoinType: { type: 'string', required: true },
      },
    );

    const params = {
      body: {
        room,
        password,
        phoneNumber,
        engagementSessionId,
        voiceChannelId,
        serverId,
        meetingJoinType,
        isSip: true,
      },
    };
    const result = await internalRequest(this.sdk, 
      `/video/${room}/join`,
      'POST',
      params,
      true,
    );
    return result;
  }

  async updateParticipant(roomId, participantId, update) {
    this.sdk.validateParams(
      { roomId, participantId, update },
      {
        roomId: { type: 'string', required: true },
        participantId: { type: 'string', required: true },
        update: { type: 'object', required: true },
      },
    );
    const params = {
      body: {
        ...update,
      },
    };
    const result = await internalRequest(this.sdk, 
      `/video/${roomId}/${participantId}`,
      'PUT',
      params,
    );
    return result;
  }

  async removeParticipant(roomId, participantId) {
    this.sdk.validateParams(
      { roomId, participantId },
      {
        roomId: { type: 'string', required: true },
        participantId: { type: 'string', required: true },
      },
    );
    const params = {
      body: {
        participantId,
      },
    };
    const result = await internalRequest(this.sdk, 
      `/video/${roomId}/leave`,
      'DELETE',
      params,
    );
    return result;
  }

  async leaveRoom(roomId) {
    this.sdk.validateParams(
      { roomId },
      {
        roomId: { type: 'string', required: true },
      },
    );
    const params = {};
    const result = await internalRequest(this.sdk, 
      `/video/${roomId}/leave`,
      'DELETE',
      params,
    );
    return result;
  }

  async mute(
    roomId,
    participantId,
    mediaType,
    isMute,
    noDevice = false,
    streamCreation = false,
  ) {
    this.sdk.validateParams(
      { roomId, participantId, mediaType, isMute, noDevice, streamCreation },
      {
        roomId: { type: 'string', required: true },
        participantId: { type: 'string', required: true },
        mediaType: { type: 'string', required: true }, // camera, microphone
        isMute: { type: 'boolean', required: true },
        noDevice: { type: 'boolean', required: false },
        streamCreation: { type: 'boolean', required: false },
      },
    );
    const params = {
      body: {
        isMute,
        noDevice,
        streamCreation,
      },
    };
    const result = await internalRequest(this.sdk, 
      `/video/${roomId}/${participantId}/mute/${mediaType}`,
      'PUT',
      params,
    );
    return result;
  }

  async createRoom({
    name,
    password,
    startTime,
    endTime,
    isAllDay,
    duration,
    durationUnit,
    timezone,
    waitingRoom,
    hosts,
    participants,
    startCameraMuted,
    startCameraMutedAfter,
    startMicrophoneMuted,
    startMicrophoneMutedAfter,
    enableChat,
    engagementSessionId,
    startRecordingOn,
    startTranscribingOn,
    syncToCalendar,
    source,
    calendarId,
    eventId,
    calendarProvider,
    vocabularyTerms,
    shareOcrEnabled,
    earlyJoinMinutes,
  }) {
    this.sdk.validateParams(
      {
        name,
        password,
        startTime,
        endTime,
        isAllDay,
        duration,
        durationUnit,
        timezone,
        waitingRoom,
        hosts,
        participants,
        startCameraMuted,
        startCameraMutedAfter,
        startMicrophoneMuted,
        startMicrophoneMutedAfter,
        enableChat,
        engagementSessionId,
        startRecordingOn,
        startTranscribingOn,
        syncToCalendar,
        source,
        calendarId,
        eventId,
        calendarProvider,
        vocabularyTerms,
        shareOcrEnabled,
        earlyJoinMinutes,
      },
      {
        name: { type: 'string', required: false },
        password: { type: 'string', required: false },
        startTime: { type: 'string', required: false },
        endTime: { type: 'string', required: false },
        isAllDay: { type: 'boolean', required: false },
        duration: { type: 'number', required: false },
        durationUnit: { type: 'string', required: false },
        timezone: { type: 'string', required: false },
        waitingRoom: { type: 'boolean', required: false },
        hosts: { type: 'array', required: false },
        participants: { type: 'array', required: false },
        startCameraMuted: { type: 'boolean', required: false },
        startCameraMutedAfter: { type: 'number', required: false },
        startMicrophoneMuted: { type: 'boolean', required: false },
        startMicrophoneMutedAfter: { type: 'number', required: false },
        enableChat: { type: 'boolean', required: false },
        engagementSessionId: { type: 'string', required: false },
        startRecordingOn: { type: 'boolean', required: false },
        startTranscribingOn: { type: 'boolean', required: false },
        syncToCalendar: { type: 'boolean', required: false },
        source: { type: 'string', required: false },
        calendarId: { type: 'string', required: false },
        eventId: { type: 'string', required: false },
        calendarProvider: { type: 'string', required: false },
        vocabularyTerms: { type: 'array', required: false },
        shareOcrEnabled: { type: 'boolean', required: false },
        // 0 = strict at startTime, 5 = 5-min early window (api rejects
        // other values); omit for no schedule-window enforcement.
        earlyJoinMinutes: { type: 'number', required: false },
      },
    );
    const params = {
      body: {
        name,
        password,
        startTime,
        endTime,
        isAllDay,
        duration,
        durationUnit,
        timezone,
        waitingRoom,
        hosts,
        participants,
        startCameraMuted,
        startCameraMutedAfter,
        startMicrophoneMuted,
        startMicrophoneMutedAfter,
        enableChat,
        engagementSessionId,
        startRecordingOn,
        startTranscribingOn,
        syncToCalendar,
        source,
        calendarId,
        eventId,
        calendarProvider,
        vocabularyTerms,
        shareOcrEnabled,
        earlyJoinMinutes,
      },
    };
    const result = await internalRequest(this.sdk, `/video`, 'POST', params);
    return result;
  }

  async updateRoom(roomId, update) {
    this.sdk.validateParams(
      { roomId, update },
      {
        roomId: { type: 'string', required: true },
        update: { type: 'object', required: true },
      },
    );

    // Validate specific update fields if they exist
    const validationSchema = {};
    if ('name' in update) validationSchema.name = { type: 'string' };
    if ('password' in update) validationSchema.password = { type: 'string' };
    if ('startTime' in update) validationSchema.startTime = { type: 'string' };
    if ('endTime' in update) validationSchema.endTime = { type: 'string' };
    if ('timezone' in update) validationSchema.timezone = { type: 'string' };
    if ('waitingRoom' in update)
      validationSchema.waitingRoom = { type: 'boolean' };
    if ('hosts' in update) validationSchema.hosts = { type: 'array' };
    if ('participants' in update)
      validationSchema.participants = { type: 'array' };
    if ('startCameraMuted' in update)
      validationSchema.startCameraMuted = { type: 'boolean' };
    if ('startCameraMutedAfter' in update)
      validationSchema.startCameraMutedAfter = { type: 'number' };
    if ('startMicrophoneMuted' in update)
      validationSchema.startMicrophoneMuted = { type: 'boolean' };
    if ('startMicrophoneMutedAfter' in update)
      validationSchema.startMicrophoneMutedAfter = { type: 'number' };
    if ('startRecordingOn' in update)
      validationSchema.startRecordingOn = { type: 'boolean' };
    if ('startTranscribingOn' in update)
      validationSchema.startTranscribingOn = { type: 'boolean' };
    if ('enableChat' in update)
      validationSchema.enableChat = { type: 'boolean' };
    if ('vocabularyTerms' in update)
      validationSchema.vocabularyTerms = { type: 'array' };
    if ('shareOcrEnabled' in update)
      validationSchema.shareOcrEnabled = { type: 'boolean' };
    if ('earlyJoinMinutes' in update)
      validationSchema.earlyJoinMinutes = { type: 'number' };

    if (Object.keys(validationSchema).length > 0) {
      this.sdk.validateParams(update, validationSchema);
    }

    const params = {
      body: {
        ...update,
      },
    };
    const result = await internalRequest(this.sdk, `/video/${roomId}`, 'PUT', params);
    return result;
  }

  async updateRoomBot(
    roomId,
    { isRecording, isTranscribing, recordingAssetStatus },
  ) {
    this.sdk.validateParams(
      { roomId, isRecording, isTranscribing, recordingAssetStatus },
      {
        roomId: { type: 'string', required: true },
        isRecording: { type: 'boolean', required: false },
        isTranscribing: { type: 'boolean', required: false },
        // none|processing|ready_webm|ready_mp4|failed
        recordingAssetStatus: { type: 'string', required: false },
      },
    );
    const update = {
      isRecording,
      isTranscribing,
      recordingAssetStatus,
    };
    const params = {
      body: {
        ...update,
      },
    };
    const result = await internalRequest(this.sdk, `/video/${roomId}/bot`, 'PUT', params);
    return result;
  }

  async placeCall(roomId, phoneNumber, callerIdNumber) {
    this.sdk.validateParams(
      { roomId, phoneNumber, callerIdNumber },
      {
        roomId: { type: 'string', required: true },
        phoneNumber: { type: 'string', required: true },
        callerIdNumber: { type: 'string', required: false },
      },
    );

    const params = {
      body: {
        phoneNumber,
        callerIdNumber,
      },
    };
    const result = await internalRequest(this.sdk, 
      `/video/${roomId}/placeOutboundCall`,
      'POST',
      params,
    );
    return result;
  }

  async describe(roomId, { includeParticipants = false }) {
    this.sdk.validateParams(
      { roomId, includeParticipants },
      {
        roomId: { type: 'string', required: true },
        includeParticipants: { type: 'boolean', required: false },
      },
    );

    const params = {
      query: {
        includeParticipants,
      },
    };

    return await internalRequest(this.sdk, `/video/${roomId}`, 'GET', params);
  }

  /**
   * List meetings visible to the current user.
   *
   * @param {Object} [options] - Parameters
   * @param {string} [options.startDate] - Start of the search window
   * @param {string} [options.endDate] - End of the search window
   * @param {number} [options.limit] - Max results
   * @param {number} [options.offset] - Pagination offset
   * @param {string} [options.engagementSessionId] - When set, returns meetings tied to this
   *   engagement session instead of filtering by the caller's own hosts/participants email —
   *   lets a reviewing manager see meetings they weren't part of.
   * @returns {Promise<Object>} Meetings list result
   */
  async listMeetings(options = {}) {
    const { engagementSessionId, ...rest } = options;

    // Validate optional parameters
    const validationSchema = {};
    if ('startDate' in rest) validationSchema.startDate = { type: 'string' };
    if ('endDate' in rest) validationSchema.endDate = { type: 'string' };
    if ('limit' in rest) validationSchema.limit = { type: 'number' };
    if ('offset' in rest) validationSchema.offset = { type: 'number' };
    if (engagementSessionId !== undefined)
      validationSchema.engagementSessionId = { type: 'string' };

    if (Object.keys(validationSchema).length > 0) {
      this.sdk.validateParams({ ...rest, engagementSessionId }, validationSchema);
    }

    const params = {
      query: {
        ...rest,
        engagementSessionId,
      },
    };

    const result = await internalRequest(this.sdk, '/video/meetings', 'GET', params);
    return result;
  }

  async getMeetingAnalytics(roomId, params = {}) {
    this.sdk.validateParams(
      { roomId },
      {
        roomId: { type: 'string', required: true },
      },
    );

    // Validate optional parameters
    const validationSchema = {};
    if ('participantId' in params)
      validationSchema.participantId = { type: 'string' };
    if ('startTime' in params) validationSchema.startTime = { type: 'string' };
    if ('endTime' in params) validationSchema.endTime = { type: 'string' };
    if ('granularity' in params)
      validationSchema.granularity = { type: 'string' };
    if ('timezone' in params) validationSchema.timezone = { type: 'string' };
    if (Object.keys(validationSchema).length > 0) {
      this.sdk.validateParams(params, validationSchema);
    }

    const options = {
      query: params,
    };

    const result = await internalRequest(this.sdk, 
      `/video/meetings/${roomId}/analytics`,
      'GET',
      options,
    );
    return result;
  }

  async deleteRoom(roomId, options = {}) {
    this.sdk.validateParams(
      { roomId },
      {
        roomId: { type: 'string', required: true },
      },
    );
    const params = {};
    if (options && options.deleteCalendarEvent === true) {
      params.body = { deleteCalendarEvent: true };
    }
    const result = await internalRequest(this.sdk, `/video/${roomId}`, 'DELETE', params);
    return result;
  }

  async addParticipant(roomId, participant) {
    this.sdk.validateParams(
      { roomId, participant },
      {
        roomId: { type: 'string', required: true },
        participant: { type: 'object', required: true },
      },
    );

    const params = {
      body: participant,
    };

    const result = await internalRequest(this.sdk, 
      `/video/${roomId}/participants`,
      'POST',
      params,
    );
    return result;
  }

  async closeRoom(roomId) {
    this.sdk.validateParams(
      { roomId },
      {
        roomId: { type: 'string', required: true },
      },
    );

    const params = {};
    const result = await internalRequest(this.sdk, 
      `/video/${roomId}/close`,
      'POST',
      params,
    );
    return result;
  }

  /**
   * Validate a guest JWT for a video room. Used by app1-socket's
   * `authorizeVideoSocketConnection` middleware during the `/video` Socket.IO
   * handshake to decide whether to admit the connection.
   *
   * @param {string} id - videoRoom id (must match the token's `roomId` claim)
   * @param {string} [token] - raw JWT. Omit to let the server read it from
   *   the `videoAuthToken` cookie on the SDK's request.
   * @returns {Promise<{
   *   valid: boolean,
   *   account: { id: string, namespace: string, accountCode: string },
   *   participant: Object,
   *   token: { id: string, type: 'videoRoomGuest', expiresAt: string },
   *   videoRoom: Object,
   *   podName: string,
   * }>} The `podName` field (added with centralized signaling) is the
   * video-server pod assigned to this room at token-mint time, re-validated
   * against app1-api's live podRegistry. If the pod is no longer alive the
   * server returns HTTP 409 `POD_UNAVAILABLE` — the client reacts by calling
   * `/video/rooms/:id/join` for a fresh assignment.
   */
  async validateGuestToken(id, token) {
    this.sdk.validateParams(
      { id, token },
      {
        id: { type: 'string', required: true },
        token: { type: 'string', required: false },
      },
    );

    const params = {
      body: { token },
    };

    const result = await internalRequest(this.sdk, 
      `/video/${id}/validate`,
      'POST',
      params,
    );
    return result;
  }

  /**
   * Construct a `VideoMeetingClient` configured for this SDK instance.
   *
   * Dynamically imports `@unboundcx/video-sdk-client` so WebRTC peer deps
   * (`mediasoup-client`, `socket.io-client`) stay out of backend bundles that
   * never touch video. Returns a client with `this` SDK injected so it can
   * transparently call `sdk.video.joinRoom()` for reassignment recovery and
   * `sdk.video.endSession()` on leave.
   *
   * **Bundler note**: SvelteKit/Vite handle the dynamic import natively. If
   * you use a bundler that eagerly resolves imports, pin the import path or
   * ensure the package is marked external.
   *
   * @param {Object} [options] - Forwarded to the `VideoMeetingClient` constructor
   * @returns {Promise<import('@unboundcx/video-sdk-client').VideoMeetingClient>}
   */
  async createMeetingClient(options = {}) {
    const { VideoMeetingClient } = await import('@unboundcx/video-sdk-client');
    return new VideoMeetingClient({ ...options, sdk: this.sdk });
  }

  /**
   * End the meeting session server-side. Invalidates the token row in the
   * `tokens` table and clears the `videoAuthToken` cookie so a stale cookie
   * from a prior meeting can't be replayed.
   *
   * The endpoint is deliberately permissive: accepts expired and
   * room-mismatched cookies and never returns 401/403 — rejection would
   * strand stale cookies.
   *
   * @param {string} roomId
   */
  async endSession(roomId) {
    this.sdk.validateParams(
      { roomId },
      { roomId: { type: 'string', required: true } },
    );
    const result = await internalRequest(this.sdk, 
      `/video/session/end`,
      'POST',
      { body: { roomId } },
      true,
    );
    return result;
  }

  async logStats(roomId, stats) {
    this.sdk.validateParams(
      { roomId, stats },
      {
        roomId: { type: 'string', required: true },
        stats: { type: 'object', required: true },
      },
    );

    const params = {
      body: stats,
    };

    const result = await internalRequest(this.sdk, 
      `/video/${roomId}/stats`,
      'POST',
      params,
    );
    return result;
  }

  // Persist a rolled-up quality summary to MySQL (one row per participant
  // per meeting). Internal endpoint, called by app1-video-server on
  // participant.leave. Long-term home for billing (bytes) and "was this
  // meeting good?" support lookups, surviving ClickHouse TTL expiry.
  async submitParticipantSummary(roomId, participantId, summary) {
    this.sdk.validateParams(
      { roomId, participantId, summary },
      {
        roomId: { type: 'string', required: true },
        participantId: { type: 'string', required: true },
        summary: { type: 'object', required: true },
      },
    );
    return internalRequest(this.sdk, 
      `/internal/video/${roomId}/participants/${participantId}/summary`,
      'POST',
      { body: summary },
    );
  }

  async submitSurvey({
    videoRoomId,
    participantId,
    email,
    videoQuality,
    audioQuality,
    feedback,
  }) {
    this.sdk.validateParams(
      { videoRoomId },
      {
        videoRoomId: { type: 'string', required: true },
      },
    );

    // Validate optional parameters
    const validationSchema = {};
    if (participantId !== undefined)
      validationSchema.participantId = { type: 'string' };
    if (email !== undefined) validationSchema.email = { type: 'string' };
    if (videoQuality !== undefined)
      validationSchema.videoQuality = { type: 'number' };
    if (audioQuality !== undefined)
      validationSchema.audioQuality = { type: 'number' };
    if (feedback !== undefined) validationSchema.feedback = { type: 'string' };

    const surveyData = {
      participantId,
      email,
      videoQuality,
      audioQuality,
      feedback,
    };

    if (Object.keys(validationSchema).length > 0) {
      this.sdk.validateParams(surveyData, validationSchema);
    }

    const params = {
      body: {
        videoRoomId,
        ...surveyData,
      },
    };

    const result = await internalRequest(this.sdk, '/video/survey', 'POST', params);
    return result;
  }

  /**
   * Post a chat message to a video room
   * @param {string} roomId - The video room ID
   * @param {Array} content - Message content as JSON array (TipTap format)
   * @param {string} [storageId] - Optional storage ID for attachments
   * @returns {Promise} Created feed message
   */
  async postChatMessage(roomId, content, storageId = null) {
    this.sdk.validateParams(
      { roomId, content },
      {
        roomId: { type: 'string', required: true },
        content: { type: 'array', required: true },
      },
    );

    const body = {
      content,
    };

    if (storageId) {
      body.storageId = storageId;
    }

    const params = { body };

    const result = await internalRequest(this.sdk, 
      `/video/${roomId}/chat`,
      'POST',
      params,
    );
    return result;
  }

  /**
   * Get chat messages from a video room
   * @param {string} roomId - The video room ID
   * @param {Object} [options={}] - Query options
   * @param {string} [options.select] - Fields to select
   * @param {number} [options.limit] - Limit number of results
   * @param {string} [options.nextId] - Cursor for next page
   * @param {string} [options.previousId] - Cursor for previous page
   * @param {string} [options.orderByDirection] - 'ASC' or 'DESC'
   * @param {boolean} [options.expandDetails] - Whether to expand details
   * @returns {Promise} Chat messages with participant info
   */
  async getChatMessages(roomId, options = {}) {
    this.sdk.validateParams(
      { roomId },
      {
        roomId: { type: 'string', required: true },
      },
    );

    // Validate optional parameters
    const validationSchema = {};
    if ('select' in options) validationSchema.select = { type: 'string' };
    if ('limit' in options) validationSchema.limit = { type: 'number' };
    if ('nextId' in options) validationSchema.nextId = { type: 'string' };
    if ('previousId' in options)
      validationSchema.previousId = { type: 'string' };
    if ('orderByDirection' in options)
      validationSchema.orderByDirection = { type: 'string' };
    if ('expandDetails' in options)
      validationSchema.expandDetails = { type: 'boolean' };

    if (Object.keys(validationSchema).length > 0) {
      this.sdk.validateParams(options, validationSchema);
    }

    const params = {
      query: options,
    };

    const result = await internalRequest(this.sdk, 
      `/video/${roomId}/chat`,
      'GET',
      params,
    );
    return result;
  }

  /**
   * Get the live transcription transcript for a video room, paged.
   * @param {string} roomId - The video room ID
   * @param {Object} [options] - Paging options
   * @param {number} [options.limit] - Max rows to return
   * @param {number} [options.offset] - Row offset
   * @returns {Promise} Paged transcript rows, ordered by timestamp/createdAt ascending
   */
  async getTranscript(roomId, options = {}) {
    this.sdk.validateParams(
      { roomId },
      {
        roomId: { type: 'string', required: true },
      },
    );

    const validationSchema = {};
    if ('limit' in options) validationSchema.limit = { type: 'number' };
    if ('offset' in options) validationSchema.offset = { type: 'number' };

    if (Object.keys(validationSchema).length > 0) {
      this.sdk.validateParams(options, validationSchema);
    }

    const params = {
      query: options,
    };

    const result = await internalRequest(this.sdk, 
      `/video/${roomId}/transcript`,
      'GET',
      params,
    );
    return result;
  }

  /**
   * Edit a chat message in a video room
   * Only the participant who created the message can edit it
   * @param {string} roomId - The video room ID
   * @param {string} messageId - The message ID to edit
   * @param {Array} content - Updated message content as JSON array (TipTap format)
   * @param {string} [storageId] - Optional storage ID for attachments
   * @returns {Promise} Updated feed message
   */
  async editChatMessage(roomId, messageId, content, storageId = null) {
    this.sdk.validateParams(
      { roomId, messageId, content },
      {
        roomId: { type: 'string', required: true },
        messageId: { type: 'string', required: true },
        content: { type: 'array', required: true },
      },
    );

    const body = {
      content,
    };

    if (storageId) {
      body.storageId = storageId;
    }

    const params = { body };

    const result = await internalRequest(this.sdk, 
      `/video/${roomId}/chat/${messageId}`,
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Delete a chat message from a video room
   * Hosts can delete any message, participants can only delete their own
   * @param {string} roomId - The video room ID
   * @param {string} messageId - The message ID to delete
   * @returns {Promise} Deletion result
   */
  async deleteChatMessage(roomId, messageId) {
    this.sdk.validateParams(
      { roomId, messageId },
      {
        roomId: { type: 'string', required: true },
        messageId: { type: 'string', required: true },
      },
    );

    const params = {};

    const result = await internalRequest(this.sdk, 
      `/video/${roomId}/chat/${messageId}`,
      'DELETE',
      params,
    );
    return result;
  }

  /**
   * Create or update user's default video room settings
   * @param {Object} settings - Video room settings
   * @param {string} [settings.userId] - Optional userId to update settings for another user
   * @param {boolean} [settings.waitingRoom] - Enable waiting room by default
   * @param {boolean} [settings.enableChat] - Enable chat by default
   * @param {number} [settings.maxVideoResolution] - Max video resolution (1080 or 720)
   * @param {boolean} [settings.startCameraMuted] - Start with camera muted
   * @param {number} [settings.startCameraMutedAfter] - Auto-mute cameras after N participants
   * @param {boolean} [settings.startMicrophoneMuted] - Start with microphone muted
   * @param {number} [settings.startMicrophoneMutedAfter] - Auto-mute mics after N participants
   * @param {number} [settings.endMeetingWithoutHostTimeLimit] - Time limit to end meeting without host (seconds)
   * @param {boolean} [settings.startRecordingOn] - Start recording automatically
   * @param {boolean} [settings.startTranscribingOn] - Start transcribing automatically
   * @param {Array<string>} [settings.hosts] - Default hosts to add to every meeting
   * @param {Array<string>} [settings.participants] - Default participants to add to every meeting
   * @returns {Promise} Created/updated settings
   */
  async createUserSettings(settings = {}) {
    // Validate optional parameters
    const validationSchema = {};
    if ('userId' in settings) validationSchema.userId = { type: 'string' };
    if ('waitingRoom' in settings)
      validationSchema.waitingRoom = { type: 'boolean' };
    if ('enableChat' in settings)
      validationSchema.enableChat = { type: 'boolean' };
    if ('maxVideoResolution' in settings)
      validationSchema.maxVideoResolution = { type: 'number' };
    if ('startCameraMuted' in settings)
      validationSchema.startCameraMuted = { type: 'boolean' };
    if ('startCameraMutedAfter' in settings)
      validationSchema.startCameraMutedAfter = { type: 'number' };
    if ('startMicrophoneMuted' in settings)
      validationSchema.startMicrophoneMuted = { type: 'boolean' };
    if ('startMicrophoneMutedAfter' in settings)
      validationSchema.startMicrophoneMutedAfter = { type: 'number' };
    if ('endMeetingWithoutHostTimeLimit' in settings)
      validationSchema.endMeetingWithoutHostTimeLimit = { type: 'number' };
    if ('startRecordingOn' in settings)
      validationSchema.startRecordingOn = { type: 'boolean' };
    if ('startTranscribingOn' in settings)
      validationSchema.startTranscribingOn = { type: 'boolean' };
    if ('hosts' in settings) validationSchema.hosts = { type: 'array' };
    if ('participants' in settings)
      validationSchema.participants = { type: 'array' };

    if (Object.keys(validationSchema).length > 0) {
      this.sdk.validateParams(settings, validationSchema);
    }

    const params = {
      body: settings,
    };

    const result = await internalRequest(this.sdk, 
      '/video/settings/user',
      'POST',
      params,
    );
    return result;
  }

  /**
   * Update user's default video room settings
   * This is an alias for createOrUpdateUserSettings
   * @param {Object} settings - Video room settings to update
   * @returns {Promise} Updated settings
   */
  async updateUserSettings(settings = {}) {
    // Validate optional parameters (same as createOrUpdateUserSettings)
    const validationSchema = {};
    if ('userId' in settings) validationSchema.userId = { type: 'string' };
    if ('waitingRoom' in settings)
      validationSchema.waitingRoom = { type: 'boolean' };
    if ('enableChat' in settings)
      validationSchema.enableChat = { type: 'boolean' };
    if ('maxVideoResolution' in settings)
      validationSchema.maxVideoResolution = { type: 'number' };
    if ('startCameraMuted' in settings)
      validationSchema.startCameraMuted = { type: 'boolean' };
    if ('startCameraMutedAfter' in settings)
      validationSchema.startCameraMutedAfter = { type: 'number' };
    if ('startMicrophoneMuted' in settings)
      validationSchema.startMicrophoneMuted = { type: 'boolean' };
    if ('startMicrophoneMutedAfter' in settings)
      validationSchema.startMicrophoneMutedAfter = { type: 'number' };
    if ('endMeetingWithoutHostTimeLimit' in settings)
      validationSchema.endMeetingWithoutHostTimeLimit = { type: 'number' };
    if ('startRecordingOn' in settings)
      validationSchema.startRecordingOn = { type: 'boolean' };
    if ('startTranscribingOn' in settings)
      validationSchema.startTranscribingOn = { type: 'boolean' };
    if ('hosts' in settings) validationSchema.hosts = { type: 'array' };
    if ('participants' in settings)
      validationSchema.participants = { type: 'array' };

    if (Object.keys(validationSchema).length > 0) {
      this.sdk.validateParams(settings, validationSchema);
    }

    const params = {
      body: settings,
    };

    const result = await internalRequest(this.sdk, '/video/settings/user', 'PUT', params);
    return result;
  }

  /**
   * Get user's default video room settings
   * @param {string} [userId] - Optional userId to get settings for another user
   * @returns {Promise} User's video room settings
   */
  async getUserSettings(userId = null) {
    const params = {
      query: {},
    };

    if (userId) {
      this.sdk.validateParams(
        { userId },
        {
          userId: { type: 'string', required: true },
        },
      );
      params.query.userId = userId;
    }

    const result = await internalRequest(this.sdk, '/video/settings/user', 'GET', params);
    return result;
  }

  /**
   * Get live presence for a video room (current participants, grouped by
   * waiting-room state)
   * @param {string} roomId - The video room ID
   * @returns {Promise} Live presence info
   */
  async getLivePresence(roomId) {
    this.sdk.validateParams(
      { roomId },
      {
        roomId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/video/${roomId}/livePresence`,
      'GET',
    );
    return result;
  }

  /**
   * Get the AI-generated summary for a video room's transcript
   * @param {string} roomId - The video room ID
   * @returns {Promise} Meeting summary
   */
  async getSummary(roomId) {
    this.sdk.validateParams(
      { roomId },
      {
        roomId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, `/video/${roomId}/summary`, 'GET');
    return result;
  }

  /**
   * Host-only edit of a video room's post-meeting AI summary
   * @param {string} roomId - The video room ID
   * @param {Object} update
   * @param {Object} update.summaryJson - {title, summary, actionItems, chapters}
   * @returns {Promise} Update result
   */
  async updateSummary(roomId, { summaryJson }) {
    this.sdk.validateParams(
      { roomId, summaryJson },
      {
        roomId: { type: 'string', required: true },
        summaryJson: { type: 'object', required: true },
      },
    );

    const params = {
      body: { summaryJson },
    };

    const result = await internalRequest(this.sdk, 
      `/video/${roomId}/summary`,
      'PATCH',
      params,
    );
    return result;
  }

  /**
   * Generate a "catch me up" recap of a video room's transcript so far
   * @param {string} roomId - The video room ID
   * @returns {Promise} Catch-up summary
   */
  async catchMeUp(roomId) {
    this.sdk.validateParams(
      { roomId },
      {
        roomId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/video/${roomId}/catch-me-up`,
      'POST',
      {},
    );
    return result;
  }

  /**
   * Ask the room-scoped AI assistant a question, grounded in the meeting
   * transcript so far
   * @param {string} roomId - The video room ID
   * @param {Object} params
   * @param {string} params.question - The question to ask
   * @param {Array<{role: 'user'|'assistant', content: string}>} [params.history] - Prior turns
   * @returns {Promise} Assistant answer
   */
  async assistantChat(roomId, { question, history } = {}) {
    this.sdk.validateParams(
      { roomId, question },
      {
        roomId: { type: 'string', required: true },
        question: { type: 'string', required: true },
      },
    );

    const body = { question };
    if (history !== undefined) {
      body.history = history;
    }

    const result = await internalRequest(this.sdk, `/video/${roomId}/assistant`, 'POST', {
      body,
    });
    return result;
  }

  /**
   * Update the text of a transcript message
   * @param {string} roomId - The video room ID
   * @param {string} messageId - The transcript message ID
   * @param {Object} update
   * @param {string} update.text - New transcript text
   * @returns {Promise} Updated transcript message
   */
  async updateTranscriptMessage(roomId, messageId, { text }) {
    this.sdk.validateParams(
      { roomId, messageId, text },
      {
        roomId: { type: 'string', required: true },
        messageId: { type: 'string', required: true },
        text: { type: 'string', required: true },
      },
    );

    const params = {
      body: { text },
    };

    const result = await internalRequest(this.sdk, 
      `/video/${roomId}/transcript/${messageId}`,
      'PATCH',
      params,
    );
    return result;
  }

  /**
   * Redact a transcript message
   * @param {string} roomId - The video room ID
   * @param {string} messageId - The transcript message ID
   * @returns {Promise} Redaction result
   */
  async redactTranscriptMessage(roomId, messageId) {
    this.sdk.validateParams(
      { roomId, messageId },
      {
        roomId: { type: 'string', required: true },
        messageId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/video/${roomId}/transcript/${messageId}/redact`,
      'POST',
      {},
    );
    return result;
  }

  /**
   * Rename a speaker in the transcript for a video room
   * @param {string} roomId - The video room ID
   * @param {Object} update
   * @param {string} update.participantId - Participant ID whose transcript speaker name to update
   * @param {string} update.displayName - New display name
   * @returns {Promise} Update result
   */
  async renameTranscriptSpeaker(roomId, { participantId, displayName }) {
    this.sdk.validateParams(
      { roomId, participantId, displayName },
      {
        roomId: { type: 'string', required: true },
        participantId: { type: 'string', required: true },
        displayName: { type: 'string', required: true },
      },
    );

    const params = {
      body: { participantId, displayName },
    };

    const result = await internalRequest(this.sdk, 
      `/video/${roomId}/transcript-speakers`,
      'PATCH',
      params,
    );
    return result;
  }

  /**
   * Host-only manual retry for a stuck/failed webm->mp4 recording conversion
   * @param {string} roomId - The video room ID
   * @returns {Promise} { launched: true } on success
   */
  async retryRecordingConvert(roomId) {
    this.sdk.validateParams(
      { roomId },
      {
        roomId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/video/${roomId}/recording-convert-retry`,
      'POST',
      {},
    );
    return result;
  }

  /**
   * Host-triggered "generate meeting name from transcript" action. Always
   * force-regenerates the room name.
   * @param {string} roomId - The video room ID
   * @returns {Promise} { ok: true, name: string } on success
   */
  async autoNameMeeting(roomId) {
    this.sdk.validateParams(
      { roomId },
      {
        roomId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/video/${roomId}/auto-name`,
      'POST',
      {},
    );
    return result;
  }

  /**
   * Host-authorized live-transcription toggle, mirrors the recording control
   * @param {string} roomId - The video room ID
   * @param {'start'|'stop'} action - Whether to start or stop transcription
   * @returns {Promise} { action, ok: true } on success
   */
  async controlTranscription(roomId, action) {
    this.sdk.validateParams(
      { roomId, action },
      {
        roomId: { type: 'string', required: true },
        action: { type: 'string', required: true },
      },
    );

    const params = {
      body: { action },
    };

    const result = await internalRequest(this.sdk, 
      `/video/${roomId}/transcription`,
      'POST',
      params,
    );
    return result;
  }

  /**
   * Set the caption language for the calling participant in a video room
   * @param {string} roomId - The video room ID
   * @param {Object} options
   * @param {string} options.language - Language code, or 'original' for no translation
   * @returns {Promise} { ok: true } on success
   */
  async setCaptionLanguage(roomId, { language }) {
    this.sdk.validateParams(
      { roomId, language },
      {
        roomId: { type: 'string', required: true },
        language: { type: 'string', required: true },
      },
    );

    const params = {
      body: { language },
    };

    const result = await internalRequest(this.sdk, 
      `/video/${roomId}/caption-language`,
      'POST',
      params,
    );
    return result;
  }

  /**
   * Translate a video room's full transcript into a target language (account users).
   * Batches the full transcript and caches translations server-side.
   * @param {string} roomId - The video room ID
   * @param {Object} options
   * @param {string} options.targetLanguage - Target language code
   * @returns {Promise} { items: [{messageId, text}] }
   */
  async translateTranscript(roomId, { targetLanguage }) {
    this.sdk.validateParams(
      { roomId, targetLanguage },
      {
        roomId: { type: 'string', required: true },
        targetLanguage: { type: 'string', required: true },
      },
    );

    const params = {
      body: { targetLanguage },
    };

    const result = await internalRequest(this.sdk, 
      `/video/${roomId}/transcript/translate`,
      'POST',
      params,
    );
    return result;
  }

  /**
   * Submit a captured content-share keyframe for OCR/indexing
   * @param {string} roomId - The video room ID
   * @param {Object} options
   * @param {string} options.image - Base64 jpeg image data (no data: prefix)
   * @param {string} [options.title] - Optional title for the content frame
   * @returns {Promise} { event }
   */
  async submitContentFrame(roomId, { image, title }) {
    this.sdk.validateParams(
      { roomId, image, title },
      {
        roomId: { type: 'string', required: true },
        image: { type: 'string', required: true },
        title: { type: 'string', required: false },
      },
    );

    const params = {
      body: { image, title },
    };

    const result = await internalRequest(this.sdk, 
      `/video/${roomId}/content-frame`,
      'POST',
      params,
    );
    return result;
  }

  /**
   * Get captured content-share events for a video room
   * @param {string} roomId - The video room ID
   * @returns {Promise} { events: [{id, participantId, displayName, timestamp, title, text, fileId}] }
   */
  async getContentEvents(roomId) {
    this.sdk.validateParams(
      { roomId },
      {
        roomId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/video/${roomId}/content-events`,
      'GET',
    );
    return result;
  }

  /**
   * Get (or lazily create) the calling user's personal meeting room for this
   * account. Every account user has exactly one; the first call provisions
   * it server-side.
   *
   * NOTE: implemented flat (`getPersonalRoom`/`updatePersonalRoom`/
   * `regeneratePersonalRoomPin`/`resolvePersonalRoom`) rather than the
   * `sdk.video.personalRoom.{get,update,regeneratePin}` namespace named in
   * the meet-hub plan — this file has no existing nested-namespace
   * precedent, so flat matches every other method here.
   *
   * @param {string} [userId] - Optional target userId (admin viewing another user's room, e.g. Setup -> Users -> Meet). Defaults to the calling user.
   * @returns {Promise<{personalRoom: {id: string, slug: string, url: string|null, dialInPin: string, guestsCanStart: boolean}}>}
   */
  async getPersonalRoom(userId = null) {
    const params = { query: {} };
    if (userId) {
      this.sdk.validateParams(
        { userId },
        { userId: { type: 'string', required: true } },
      );
      params.query.userId = userId;
    }
    const result = await internalRequest(this.sdk, '/video/personal-room', 'GET', params);
    return result;
  }

  /**
   * Update the calling user's personal meeting room (slug and/or
   * guests-can-start). Omit a field to leave it unchanged.
   *
   * @param {Object} [update]
   * @param {string} [update.slug] - New slug (3-32 chars, lowercase/numbers/hyphens, not reserved). 409-equivalent BadRequestError on collision.
   * @param {boolean} [update.guestsCanStart] - Whether guests can start the room without the host present.
   * @param {string} [update.password] - New static room passcode.
   * @param {string} [update.userId] - Optional target userId (admin editing another user's room). Defaults to the calling user.
   * @returns {Promise<{personalRoom: {id: string, slug: string, url: string|null, dialInPin: string, guestsCanStart: boolean}}>}
   */
  async updatePersonalRoom({ slug, guestsCanStart, password, userId } = {}) {
    const validationSchema = {};
    if (slug !== undefined) validationSchema.slug = { type: 'string' };
    if (guestsCanStart !== undefined)
      validationSchema.guestsCanStart = { type: 'boolean' };
    // Static room passcode — 4-6 digits (api-enforced); applied to every
    // session the room link mints.
    if (password !== undefined) validationSchema.password = { type: 'string' };
    if (userId !== undefined) validationSchema.userId = { type: 'string' };

    if (Object.keys(validationSchema).length > 0) {
      this.sdk.validateParams(
        { slug, guestsCanStart, password, userId },
        validationSchema,
      );
    }

    const body = {};
    if (slug !== undefined) body.slug = slug;
    if (guestsCanStart !== undefined) body.guestsCanStart = guestsCanStart;
    if (password !== undefined) body.password = password;
    if (userId !== undefined) body.userId = userId;

    const params = { body };
    const result = await internalRequest(this.sdk, '/video/personal-room', 'PUT', params);
    return result;
  }

  /**
   * Regenerate the dial-in PIN for the calling user's personal meeting room.
   *
   * @param {string} [userId] - Optional target userId (admin action). Defaults to the calling user.
   * @returns {Promise<{personalRoom: {id: string, dialInPin: string}}>}
   */
  async regeneratePersonalRoomPin(userId = null) {
    const body = {};
    if (userId) {
      this.sdk.validateParams(
        { userId },
        { userId: { type: 'string', required: true } },
      );
      body.userId = userId;
    }
    const result = await internalRequest(this.sdk, 
      '/video/personal-room/regenerate-pin',
      'POST',
      { body },
    );
    return result;
  }

  /**
   * Live availability dry-run for a personal-room slug (settings editor).
   *
   * @param {string} slug - Candidate slug.
   * @param {string} [userId] - Optional target userId (admin action). Defaults to the calling user.
   * @returns {Promise<{slug: string, available: boolean, reason?: 'invalid'|'taken'}>}
   */
  async checkPersonalRoomSlug(slug, userId = null) {
    this.sdk.validateParams(
      { slug, userId },
      {
        slug: { type: 'string', required: true },
        userId: { type: 'string', required: false },
      },
    );
    const query = { slug };
    if (userId) query.userId = userId;
    const result = await internalRequest(this.sdk, 
      '/video/personal-room/slug-available',
      'GET',
      { query },
    );
    return result;
  }

  /**
   * Regenerate the static web passcode for the calling user's personal
   * meeting room (a separate secret from the dial-in PIN). Sessions minted
   * after this use the new value.
   *
   * @param {string} [userId] - Optional target userId (admin action). Defaults to the calling user.
   * @returns {Promise<{personalRoom: {id: string, password: string}}>}
   */
  async regeneratePersonalRoomPassword(userId = null) {
    const body = {};
    if (userId) {
      this.sdk.validateParams(
        { userId },
        { userId: { type: 'string', required: true } },
      );
      body.userId = userId;
    }
    const result = await internalRequest(this.sdk, 
      '/video/personal-room/regenerate-password',
      'POST',
      { body },
    );
    return result;
  }

  /**
   * Resolve a personal-room slug to a live session (join page). Guest-capable
   * — mints/claims a fresh meeting if none is live, or returns the already
   * -claimed session; if the caller is an unauthenticated guest and the room
   * doesn't allow guests to start, returns `waitingForHost: true` instead.
   * Guests only receive `password` when they supply the room's static
   * passcode; otherwise `passwordRequired: true` is returned and the join
   * page should prompt.
   *
   * @param {string} slug - The personal room's slug.
   * @param {{password?: string}} [options] - The room's static passcode, when known.
   * @returns {Promise<{claimed: boolean, meetingId?: string, friendlyName?: string, password?: string, passwordRequired?: boolean, waitingForHost?: boolean}>}
   */
  async resolvePersonalRoom(slug, { password } = {}) {
    this.sdk.validateParams(
      { slug, password },
      {
        slug: { type: 'string', required: true },
        password: { type: 'string', required: false },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/video/personal-room/resolve/${slug}`,
      'POST',
      { body: { password } },
    );
    return result;
  }
}
