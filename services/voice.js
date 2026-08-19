export class VoiceService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async record({ cdrId, callId, action = 'start', direction = 'sendrecv' }) {
    this.sdk.validateParams(
      { callId, cdrId, action, direction },
      {
        cdrId: { type: 'string', required: false },
        callId: { type: 'string', required: false },
        action: { type: 'string', required: false },
        direction: { type: 'string', required: false },
      },
    );

    const params = {
      body: { callId, cdrId, action, direction },
    };

    const result = await this.sdk._fetch(`/voice/record/`, 'POST', params);
    return result;
  }

  async call({ to, from, destination, app, timeout, customHeaders, statusWebhook }) {
    this.sdk.validateParams(
      { to, from, destination, app, timeout, customHeaders, statusWebhook },
      {
        to: { type: 'string', required: true },
        from: { type: 'string', required: true },
        destination: { type: 'string', required: false },
        app: { type: 'object', required: false },
        timeout: { type: 'number', required: false },
        customHeaders: { type: 'object', required: false },
        // { url, static } — internal endpoint that receives call progress
        // events (trying/ringing/answered/failed) with `static` fields
        // merged into each POST body
        statusWebhook: { type: 'object', required: false },
      },
    );

    const params = {
      body: {
        to,
        from,
        destination,
        app,
        timeout,
        customHeaders,
        statusWebhook,
      },
    };

    const result = await this.sdk._fetch('/voice/', 'POST', params);
    return result;
  }

  /**
   * Replace the voice application on an active call
   * Dynamically updates the voice app running on a call, allowing you to change the call flow in real-time.
   * This can be used to play new audio, gather input, or execute any other voice commands while the call is active.
   *
   * @param {Object} options - Parameters
   * @param {string} options.callId - The call ID to replace the app for (required)
   * @param {Object} options.app - The voice app object containing commands to execute (required)
   * @param {string} options.app.version - Voice app version (e.g., '2.0')
   * @param {string} options.app.name - Voice app name identifier
   * @param {Array} options.app.commands - Array of command objects to execute
   * @returns {Promise<Object>} Object containing the operation status and metadata
   * @returns {boolean} result.status - Whether the replacement was successful
   * @returns {Object} result.meta - Metadata including the payload sent to media manager
   *
   * @example
   * // Replace call app to play audio and hangup
   * const result = await sdk.voice.replaceCallApp({
   *   callId: 'call123',
   *   app: {
   *     version: '2.0',
   *     name: 'dynamic-app',
   *     commands: [
   *       { command: 'play', file: 'example.wav' },
   *       { command: 'hangup' }
   *     ]
   *   }
   * });
   * console.log(result.status); // true
   *
   * @example
   * // Replace call app to gather input
   * const result = await sdk.voice.replaceCallApp({
   *   callId: 'call456',
   *   app: {
   *     version: '2.0',
   *     name: 'gather-app',
   *     commands: [
   *       { command: 'play', file: 'prompt.wav' },
   *       { command: 'gather', numDigits: 1, timeout: 5 }
   *     ]
   *   }
   * });
   */
  async replaceCallApp({ callId, app }) {
    this.sdk.validateParams(
      { callId, app },
      {
        callId: { type: 'string', required: true },
        app: { type: 'object', required: true },
      },
    );

    const params = {
      body: {
        callId,
        app,
      },
    };

    const result = await this.sdk._fetch('/voice/replace', 'PUT', params);
    return result;
  }

  /**
   * HangUp active call
   * Ends a currently active SIP phone call
   *
   * @param {string} callId - The call ID to hangup (required)
   * @returns {Promise<Object>} Object containing the operation status and metadata
   * @returns {boolean} result.status - Whether the replacement was successful
   *
   * @example
   * // hangup call
   * const result = await sdk.voice.hangup(callId);
   * console.log(result.status); // true
   *
   */

  async hangup(callId) {
    this.sdk.validateParams(
      { callId },
      {
        callId: { type: 'string', required: true },
      },
    );
    const params = {
      body: {
        callId,
      },
    };

    const result = await this.sdk._fetch(`/voice/hangup`, 'PUT', params);
    return result;
  }

  /**
   * Get the discrete event timeline for a call
   * Returns the ordered sequence of discrete CDR events (ringing, answered,
   * hold, transfer, queue/assignment transitions, recording, dtmf, etc.)
   * recorded for a call, ordered oldest-first.
   *
   * @param {string} cdrId - The CDR id to fetch events for (required)
   * @returns {Promise<Object>} result
   * @returns {Array<Object>} result.events - Ordered list of `{ eventType, ts, actorType, actorId, data }`
   *
   * @example
   * const { events } = await sdk.voice.getCdrEvents(cdrId);
   * events.forEach((e) => console.log(e.eventType, e.ts));
   */
  async getCdrEvents(cdrId) {
    this.sdk.validateParams(
      { cdrId },
      {
        cdrId: { type: 'string', required: true },
      },
    );

    const result = await this.sdk._fetch(`/voice/cdr/${cdrId}/events`, 'GET');
    return result;
  }

  /* legacy methods, to be updated and replaced */

  async hold(channels) {
    this.sdk.validateParams(
      { channels },
      {
        channels: { type: 'array', required: true },
      },
    );

    const params = {
      body: { channels },
    };

    const result = await this.sdk._fetch('/voice/calls/hold', 'PUT', params);
    return result;
  }

  async mute(voiceChannelId, action = 'mute', direction = 'in') {
    this.sdk.validateParams(
      { voiceChannelId },
      {
        voiceChannelId: { type: 'string', required: true },
        action: { type: 'string', required: false },
        direction: { type: 'string', required: false },
      },
    );

    const params = {
      body: { action, direction },
    };

    const result = await this.sdk._fetch(
      `/voice/calls/mute/${voiceChannelId}`,
      'PUT',
      params,
    );
    return result;
  }

  async unmute(voiceChannelId, direction = 'in') {
    return this.mute(voiceChannelId, 'unmute', direction);
  }

  async sendDtmf(voiceChannelId, dtmf) {
    this.sdk.validateParams(
      { voiceChannelId, dtmf },
      {
        voiceChannelId: { type: 'string', required: true },
        dtmf: { type: 'string', required: true },
      },
    );

    const params = {
      body: { dtmf },
    };

    const result = await this.sdk._fetch(
      `/voice/calls/dtmf/${voiceChannelId}`,
      'POST',
      params,
    );
    return result;
  }

  async stopRecording(voiceChannelId, direction = 'both') {
    return this.record(voiceChannelId, 'stop', direction);
  }

  async pauseRecording(voiceChannelId, direction = 'both') {
    return this.record(voiceChannelId, 'pause', direction);
  }

  async resumeRecording(voiceChannelId, direction = 'both') {
    return this.record(voiceChannelId, 'resume', direction);
  }

  async transcribe(
    voiceChannelId,
    action = 'start',
    direction = 'in',
    forwardText,
    forwardRtp,
  ) {
    this.sdk.validateParams(
      { voiceChannelId },
      {
        voiceChannelId: { type: 'string', required: true },
        action: { type: 'string', required: false },
        direction: { type: 'string', required: false },
        forwardText: { type: 'object', required: false },
        forwardRtp: { type: 'object', required: false },
      },
    );

    const bodyData = { action, direction };
    if (forwardText) bodyData.forwardText = forwardText;
    if (forwardRtp) bodyData.forwardRtp = forwardRtp;

    const params = {
      body: bodyData,
    };

    const result = await this.sdk._fetch(
      `/voice/calls/transcribe/${voiceChannelId}`,
      'POST',
      params,
    );
    return result;
  }

  async stopTranscribing(voiceChannelId, direction = 'in') {
    return this.transcribe(voiceChannelId, 'stop', direction);
  }

  async transfer({
    channels,
    to,
    callerIdName,
    callerIdNumber,
    timeout,
    voiceApp,
  }) {
    this.sdk.validateParams(
      { channels },
      {
        channels: { type: 'array', required: true },
        to: { type: 'string', required: false },
        callerIdName: { type: 'string', required: false },
        callerIdNumber: { type: 'string', required: false },
        timeout: { type: 'number', required: false },
        voiceApp: { type: 'object', required: false },
      },
    );

    const bodyData = { channels };
    if (to) bodyData.to = to;
    if (callerIdName) bodyData.callerIdName = callerIdName;
    if (callerIdNumber) bodyData.callerIdNumber = callerIdNumber;
    if (timeout !== undefined) bodyData.timeout = timeout;
    if (voiceApp) bodyData.voiceApp = voiceApp;

    const params = {
      body: bodyData,
    };

    const result = await this.sdk._fetch(
      '/voice/calls/transfer',
      'POST',
      params,
    );
    return result;
  }

  async conference(channels) {
    this.sdk.validateParams(
      { channels },
      {
        channels: { type: 'array', required: true },
      },
    );

    const params = {
      body: { channels },
    };

    const result = await this.sdk._fetch(
      '/voice/calls/conference',
      'POST',
      params,
    );
    return result;
  }
}
