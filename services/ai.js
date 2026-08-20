import { internalRequest } from '../base.js';
import { PlaybooksService } from './ai/playbooks.js';
import { VocabularyService } from './ai/vocabulary.js';
import { translate as translateItems } from './ai/translate.js';
import {
  getSettings as getAiSettings,
  updateSettings as updateAiSettings,
} from './ai/settings.js';

export class AIService {
  constructor(sdk) {
    this.sdk = sdk;
    this.generative = new GenerativeService(sdk);
    this.tts = new TextToSpeechService(sdk);
    this.stt = new SpeechToTextService(sdk);
    this.extract = new ExtractService(sdk);
    this.playbooks = new PlaybooksService(sdk);
    this.vocabulary = new VocabularyService(sdk);
  }

  /**
   * Translate a batch of text items
   * @param {Object} params - { items, targetLanguage, sourceLanguage?, domain?, context? }
   * @returns {Promise<Object>} { items: [{id, text}] }
   */
  async translate(params) {
    return translateItems(this.sdk, params);
  }

  /**
   * Get account AI settings
   * @returns {Promise<Object>} { settings: { shareOcrEnabled } }
   */
  async getSettings() {
    return getAiSettings(this.sdk);
  }

  /**
   * Update account AI settings
   * @param {Object} options - { shareOcrEnabled }
   * @returns {Promise<Object>} { settings }
   */
  async updateSettings(options) {
    return updateAiSettings(this.sdk, options);
  }
}

export class GenerativeService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async chat({
    prompt,
    messages,
    systemPrompt,
    appendSystemPrompt,
    relatedId,
    peopleId,
    companyId,
    provider,
    model,
    temperature,
    maxTokens,
    subscriptionId,
    stream,
    isPlayground = false,
    responseFormat,
    sessionId,
    scope,
    manageSession,
    tools,
    toolConfig,
    maxToolRounds,
    recordTypeId,
    meta,
    qualityCheck,
    isPublic,
  }) {
    this.sdk.validateParams(
      {
        stream,
        temperature,
        maxTokens,
        subscriptionId,
        provider,
        model,
        prompt,
        messages,
        systemPrompt,
        appendSystemPrompt,
        isPlayground,
        responseFormat,
        sessionId,
        scope,
        manageSession,
        tools,
        toolConfig,
        maxToolRounds,
        recordTypeId,
        peopleId,
        companyId,
        meta,
        qualityCheck,
        isPublic,
      },
      {
        prompt: { type: 'string', required: false },
        messages: { type: 'array', required: false },
        systemPrompt: { type: 'string', required: false },
        appendSystemPrompt: { type: 'string', required: false },
        provider: { type: 'string', required: false },
        model: { type: 'string', required: false },
        temperature: { type: 'number', required: false },
        maxTokens: { type: 'number', required: false },
        subscriptionId: { type: 'string', required: false },
        stream: { type: 'boolean', required: false },
        isPlayground: { type: 'boolean', required: false },
        responseFormat: { type: 'object', required: false },
        sessionId: { type: 'string', required: false },
        scope: { type: 'string', required: false },
        manageSession: { type: 'boolean', required: false },
        tools: { type: 'array', required: false },
        toolConfig: { type: 'object', required: false },
        maxToolRounds: { type: 'number', required: false },
        recordTypeId: { type: 'string', required: false },
        peopleId: { type: 'string', required: false },
        companyId: { type: 'string', required: false },
        meta: { type: 'object', required: false },
        qualityCheck: { type: 'boolean', required: false },
        isPublic: { type: 'boolean', required: false },
      },
    );

    const params = {
      body: {
        isPlayground,
        prompt,
        messages,
        systemPrompt,
        appendSystemPrompt,
        relatedId,
        peopleId,
        companyId,
        provider,
        model,
        temperature,
        maxTokens,
        subscriptionId,
        stream,
        responseFormat,
        sessionId,
        scope,
        manageSession,
        tools,
        toolConfig,
        maxToolRounds,
        recordTypeId,
        meta,
        qualityCheck,
        isPublic,
      },
      // Return raw response for streaming to allow client-side stream handling
      returnRawResponse: stream === true,
    };

    // Force HTTP transport when streaming or when messages contain large content (too large for NATS)
    const hasLargeContent = messages?.some(
      (m) =>
        Array.isArray(m.content) &&
        m.content.some(
          (c) =>
            c.type === 'image' ||
            c.type === 'image_url' ||
            c.type === 'document',
        ),
    );
    const forceFetch = stream === true || hasLargeContent;
    const result = await internalRequest(this.sdk, 
      '/ai/generative/chat',
      'POST',
      params,
      forceFetch,
    );
    return result;
  }

  /**
   * Clone an existing chat session into a new one, importing conversation context.
   * Filters out system prompts and tool calls, keeps user/assistant turns.
   * If the transcript exceeds ~50k tokens it is summarized automatically.
   *
   * @param {Object} options
   * @param {string} options.sourceSessionId - Session to clone from (required)
   * @param {string} [options.systemPrompt] - New system prompt (appended after conversation context)
   * @param {string} [options.provider] - LLM provider (falls back to source session)
   * @param {string} [options.model] - Model ID (falls back to source session)
   * @param {Array}  [options.tools] - Tool names (falls back to source session)
   * @param {Object} [options.toolConfig] - Tool config (falls back to source session)
   * @param {string} [options.scope] - 'user' or 'account'
   * @param {string} [options.userId] - Owner user ID
   * @param {string} [options.peopleId] - Linked people record
   * @param {string} [options.companyId] - Linked company record
   * @param {string} [options.relatedId] - Linked related record
   * @returns {Promise<Object>} { id, sourceSessionId, wasSummarized }
   */
  async cloneSession({
    sourceSessionId,
    systemPrompt,
    provider,
    model,
    tools,
    toolConfig,
    scope,
    userId,
    peopleId,
    companyId,
    relatedId,
  }) {
    this.sdk.validateParams(
      { sourceSessionId },
      {
        sourceSessionId: { type: 'string', required: true },
        systemPrompt: { type: 'string', required: false },
        provider: { type: 'string', required: false },
        model: { type: 'string', required: false },
        tools: { type: 'array', required: false },
        toolConfig: { type: 'object', required: false },
        scope: { type: 'string', required: false },
        userId: { type: 'string', required: false },
        peopleId: { type: 'string', required: false },
        companyId: { type: 'string', required: false },
        relatedId: { type: 'string', required: false },
      },
    );

    const params = {
      body: {
        sourceSessionId,
        systemPrompt,
        provider,
        model,
        tools,
        toolConfig,
        scope,
        userId,
        peopleId,
        companyId,
        relatedId,
      },
    };

    const result = await internalRequest(this.sdk, 
      '/ai/generative/chat/clone',
      'POST',
      params,
    );
    return result;
  }

  /**
   * Summarize chat/transcript content (running summary, chapters, title)
   * @param {Object} payload
   * @param {string} [payload.domain] - Summary domain (e.g. 'meeting')
   * @param {string} [payload.mode] - Summary mode
   * @param {Array} [payload.lines] - Transcript/chat lines to summarize
   * @param {Array} [payload.chatMessages] - Chat messages to summarize
   * @param {string} [payload.runningSummary] - Existing running summary to extend
   * @param {boolean} [payload.includeChapters] - Include chapter breakdown
   * @param {boolean} [payload.includeTitle] - Include a generated title
   * @returns {Promise<Object>} Summary result
   */
  async summarize(payload = {}) {
    const params = {
      body: payload,
    };

    const result = await internalRequest(this.sdk, '/ai/summarize', 'POST', params);
    return result;
  }

  /**
   * List available chat tools and their metadata
   * @returns {Promise<Object>} { tools: Array<{ name, label, description, configRequirements }>, count: number }
   */
  async listTools() {
    return await internalRequest(this.sdk, '/ai/generative/tools', 'GET');
  }

  /**
   * List chat sessions visible to the current user
   * @param {Object} [options] - Filter options
   * @param {string} [options.relatedId] - Filter by related object ID
   * @param {string} [options.scope] - Filter by scope ('user' or 'account')
   * @param {number} [options.limit=25] - Results limit
   * @param {number} [options.offset=0] - Pagination offset
   * @returns {Promise<Object>} { sessions: Array }
   */
  async listSessions({ relatedId, scope, limit, offset } = {}) {
    this.sdk.validateParams(
      { relatedId, scope, limit, offset },
      {
        relatedId: { type: 'string', required: false },
        scope: { type: 'string', required: false },
        limit: { type: 'number', required: false },
        offset: { type: 'number', required: false },
      },
    );

    const params = { query: { relatedId, scope, limit, offset } };
    const result = await internalRequest(this.sdk, 
      '/ai/generative/sessions',
      'GET',
      params,
    );
    return result;
  }

  /**
   * Get a chat session with its message history
   * @param {Object} options
   * @param {string} options.sessionId - Session ID to retrieve
   * @returns {Promise<Object>} { session: { id, name, scope, relatedId, provider, model, messages, messageCount, lastMessageAt, createdAt } }
   */
  async getSession({ sessionId }) {
    this.sdk.validateParams(
      { sessionId },
      { sessionId: { type: 'string', required: true } },
    );

    const result = await internalRequest(this.sdk, 
      `/ai/generative/sessions/${sessionId}`,
      'GET',
    );
    return result;
  }

  /**
   * Update a chat session (name, scope)
   * @param {Object} options
   * @param {string} options.sessionId - Session ID to update
   * @param {string} [options.name] - New session name
   * @param {string} [options.scope] - New scope ('user' or 'account')
   * @returns {Promise<Object>} { success: true }
   */
  async updateSession({ sessionId, name, scope }) {
    this.sdk.validateParams(
      { sessionId, name, scope },
      {
        sessionId: { type: 'string', required: true },
        name: { type: 'string', required: false },
        scope: { type: 'string', required: false },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/ai/generative/sessions/${sessionId}`,
      'PUT',
      { body: { name, scope } },
    );
    return result;
  }

  /**
   * Delete a chat session
   * @param {Object} options
   * @param {string} options.sessionId - Session ID to delete
   * @returns {Promise<Object>} { success: true }
   */
  async deleteSession({ sessionId }) {
    this.sdk.validateParams(
      { sessionId },
      { sessionId: { type: 'string', required: true } },
    );

    const result = await internalRequest(this.sdk, 
      `/ai/generative/sessions/${sessionId}`,
      'DELETE',
    );
    return result;
  }

  async playbook({
    prompt,
    messages,
    relatedId,
    model,
    temperature,
    subscriptionId,
    stream,
    playbookId,
    sessionId,
  }) {
    this.sdk.validateParams(
      { playbookId },
      {
        prompt: { type: 'string', required: false },
        messages: { type: 'array', required: false },
        relatedId: { type: 'string', required: false },
        model: { type: 'string', required: false },
        temperature: { type: 'number', required: false },
        subscriptionId: { type: 'string', required: false },
        stream: { type: 'boolean', required: false },
        playbookId: { type: 'string', required: true },
        sessionId: { type: 'string', required: false },
      },
    );

    const params = {
      body: {
        prompt,
        messages,
        relatedId,
        model,
        temperature,
        subscriptionId,
        stream,
        playbookId,
        sessionId,
      },
    };

    const result = await internalRequest(this.sdk, 
      '/ai/generative/playbook',
      'POST',
      params,
    );
    return result;
  }

  // async chatOllama({
  //   prompt,
  //   messages,
  //   relatedId,
  //   model,
  //   temperature,
  //   subscriptionId,
  //   stream,
  //   method,
  // }) {
  //   this.sdk.validateParams(
  //     { method },
  //     {
  //       prompt: { type: 'string', required: false },
  //       messages: { type: 'array', required: false },
  //       relatedId: { type: 'string', required: false },
  //       model: { type: 'string', required: false },
  //       temperature: { type: 'number', required: false },
  //       subscriptionId: { type: 'string', required: false },
  //       stream: { type: 'boolean', required: false },
  //       method: { type: 'string', required: true },
  //     },
  //   );

  //   const params = {
  //     body: {
  //       prompt,
  //       messages,
  //       relatedId,
  //       model,
  //       temperature,
  //       subscriptionId,
  //       stream,
  //       method,
  //     },
  //     // Return raw response for streaming to allow client-side stream handling
  //     returnRawResponse: stream === true,
  //   };

  //   // Force HTTP transport when streaming is enabled since NATS doesn't support streaming responses
  //   const forceFetch = stream === true;
  //   const result = await internalRequest(this.sdk, 
  //     '/ai/generative/ollama',
  //     'POST',
  //     params,
  //     forceFetch,
  //   );
  //   return result;
  // }
}

export class TextToSpeechService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async create({
    text,
    voice,
    languageCode,
    ssmlGender,
    audioEncoding,
    speakingRate,
    pitch,
    volumeGainDb,
    effectsProfileIds,
    createAccessKey,
  }) {
    this.sdk.validateParams(
      {
        text,
        voice,
        languageCode,
        ssmlGender,
        audioEncoding,
        speakingRate,
        pitch,
        volumeGainDb,
        effectsProfileIds,
        createAccessKey,
      },
      {
        text: { type: 'string', required: true },
        voice: { type: 'string', required: false },
        languageCode: { type: 'string', required: false },
        ssmlGender: { type: 'string', required: false },
        audioEncoding: { type: 'string', required: false },
        speakingRate: { type: 'number', required: false },
        pitch: { type: 'number', required: false },
        volumeGainDb: { type: 'number', required: false },
        effectsProfileIds: { type: 'array', required: false },
        createAccessKey: { type: 'boolean', required: false },
      },
    );

    const ttsData = { text };
    if (voice) ttsData.voice = voice;
    if (languageCode) ttsData.languageCode = languageCode;
    if (ssmlGender) ttsData.ssmlGender = ssmlGender;
    if (audioEncoding) ttsData.audioEncoding = audioEncoding;
    if (speakingRate) ttsData.speakingRate = speakingRate;
    if (pitch) ttsData.pitch = pitch;
    if (volumeGainDb) ttsData.volumeGainDb = volumeGainDb;
    if (effectsProfileIds) ttsData.effectsProfileIds = effectsProfileIds;
    if (createAccessKey) ttsData.createAccessKey = createAccessKey;

    const params = {
      body: ttsData,
    };

    const result = await internalRequest(this.sdk, '/ai/tts', 'POST', params);
    return result;
  }

  /**
   * List available TTS voices
   * @returns {Promise<Object>} { voices: Array, count: number, supportedEncodings: Array, supportedLanguages: Array }
   */
  async list() {
    const result = await internalRequest(this.sdk, '/ai/tts', 'GET');
    return result;
  }
}

export class SpeechToTextService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Create a transcription from file or storage
   * @param {Object} options - Transcription options
   * @param {string} options.sourceType - 'file', 'storage', 'stream', or 'url'
   * @param {string} [options.sourceId] - Source identifier
   * @param {string} [options.storageId] - Storage ID if using storage
   * @param {string} [options.engine='google'] - STT engine ('google', 'deepgram', 'whisper')
   * @param {string} [options.languageCode='en-US'] - BCP-47 language code
   * @param {Object} [options.metadata] - Engine-specific configuration
   * @param {string} [options.engagementSessionId] - Engagement session ID
   * @param {string} [options.playbookId] - Playbook ID
   * @param {string} [options.name] - Transcription name
   * @param {string} [options.role] - Speaker role
   * @param {string} [options.direction] - Call direction
   * @returns {Promise<Object>} Transcription result
   */
  async create({
    sourceType,
    sourceId,
    sipCallId,
    cdrId,
    storageId,
    engine,
    languageCode,
    metadata,
    engagementSessionId,
    playbookId,
    name,
    role,
    direction,
  }) {
    this.sdk.validateParams(
      {
        sourceType,
        sourceId,
        sipCallId,
        cdrId,
        storageId,
        engine,
        languageCode,
        metadata,
        engagementSessionId,
        playbookId,
        name,
        role,
        direction,
      },
      {
        sourceType: { type: 'string', required: true },
        sourceId: { type: 'string', required: false },
        sipCallId: { type: 'string', required: false },
        cdrId: { type: 'string', required: false },
        storageId: { type: 'string', required: false },
        engine: { type: 'string', required: false },
        languageCode: { type: 'string', required: false },
        metadata: { type: 'object', required: false },
        engagementSessionId: { type: 'string', required: false },
        playbookId: { type: 'string', required: false },
        name: { type: 'string', required: false },
        role: { type: 'string', required: false },
        direction: { type: 'string', required: false },
      },
    );

    const params = {
      body: {
        sourceType,
        sourceId,
        sipCallId,
        cdrId,
        storageId,
        engine,
        languageCode,
        metadata,
        engagementSessionId,
        playbookId,
        name,
        role,
        direction,
      },
    };

    const result = await internalRequest(this.sdk, '/ai/stt', 'POST', params);
    return result;
  }

  /**
   * Synchronously transcribe a stored audio file (batch STT).
   * Counterpart to stream(): give it a storage file id, get the transcript
   * back in the response (typically ~1-3s for voicemail-length audio).
   *
   * @param {Object} options
   * @param {string} options.storageId - Storage file id of the audio (WAV by default).
   * @param {string} [options.language] - Language hint (default 'en').
   * @param {string} [options.encoding] - Audio encoding (default 'WAV').
   * @returns {Promise<{transcription: string|null, language: string|null, duration: number|null}>}
   */
  async file({ storageId, language, encoding } = {}) {
    this.sdk.validateParams(
      { storageId, language, encoding },
      {
        storageId: { type: 'string', required: true },
        language: { type: 'string', required: false },
        encoding: { type: 'string', required: false },
      },
    );
    const body = { storageId };
    if (language !== undefined) body.language = language;
    if (encoding !== undefined) body.encoding = encoding;
    return await internalRequest(this.sdk, '/ai/stt/file', 'POST', { body });
  }

  /**
   * Create a real-time streaming transcription session
   * Returns an EventEmitter-based stream for sending audio and receiving transcripts
   *
   * @param {Object} options - Stream options
   * @param {string} [options.engine='google'] - STT engine ('google' or 'whisper')
   * @param {string} [options.model] - STT model (e.g., 'phone_call' for Google)
   * @param {string} [options.languageCode='en-US'] - BCP-47 language code
   * @param {string} [options.encoding='LINEAR16'] - Audio encoding format
   * @param {number} [options.sampleRateHertz=16000] - Sample rate in Hertz
   * @param {number} [options.audioChannelCount=1] - Number of audio channels (1=mono, 2=stereo)
   * @param {boolean} [options.singleUtterance=false] - Stop after first utterance
   * @param {boolean} [options.interimResults=true] - Return interim results
   * @param {boolean} [options.enableAutomaticPunctuation=true] - Enable automatic punctuation
   * @param {boolean} [options.diarizationEnabled=false] - Enable speaker diarization
   * @param {number} [options.speakerCount] - Number of speakers (if diarization enabled)
   * @param {boolean} [options.vadEnabled=false] - Enable Voice Activity Detection
   * @param {number} [options.minSilenceDuration=500] - Min silence duration in ms (for VAD)
   * @param {number} [options.speechPadMs=400] - Speech padding in ms (for VAD)
   * @param {string} [options.engagementSessionId] - Engagement session ID
   * @param {string} [options.playbookId] - Playbook ID
   * @param {string} [options.name] - Session name
   * @param {Object} [options.metadata] - Additional metadata
   * @param {string} [options.videoRoomId] - Video (Meet) room ID this stream belongs to
   * @param {string} [options.videoParticipantId] - Video (Meet) room participant ID
   * @param {string} [options.displayName] - Participant display name (Meet sessions)
   * @param {string} [options.role] - Speaker role (e.g. 'participant', 'host')
   * @param {boolean} [options.serverVad] - Opt-in server-side VAD (Meet sessions; defaults false)
   * @returns {Promise<SttStream>} Stream object with write() method and transcript events
   *
   * @example
   * const stream = await sdk.ai.stt.stream({ engine: 'google', languageCode: 'en-US' });
   * stream.on('transcript', (result) => console.log(result.text, result.isFinal));
   * stream.on('error', (error) => console.error(error));
   * stream.on('close', () => console.log('Stream closed'));
   * stream.write(audioChunk);
   * stream.end();
   */
  async stream(options = {}) {
    // Environment check - STT streaming only works in Node.js
    if (this.sdk.environment !== 'node') {
      throw new Error(
        'STT streaming requires Node.js environment. ' +
          'This feature is only available in backend services. ' +
          'Browser-based streaming is not supported.',
      );
    }

    const {
      engine = 'google',
      model,
      languageCode = 'en-US',
      encoding = 'LINEAR16',
      sampleRateHertz = 16000,
      audioChannelCount = 1,
      singleUtterance = false,
      interimResults = true,
      enableAutomaticPunctuation = true,
      diarizationEnabled = false,
      speakerCount,
      vadEnabled = false,
      minSilenceDuration = 500,
      speechPadMs = 400,
      engagementSessionId,
      playbookId,
      taskId,
      workerId,
      generateSubject,
      generateTranscriptSummary,
      generateSentiment,
      bridgeId,
      name,
      metadata,
      sipCallId,
      cdrId,
      videoRoomId,
      videoParticipantId,
      displayName,
      role,
      serverVad,
    } = options;

    // Validate parameters
    this.sdk.validateParams(
      {
        engine,
        model,
        languageCode,
        encoding,
        sampleRateHertz,
        audioChannelCount,
        singleUtterance,
        interimResults,
        enableAutomaticPunctuation,
        diarizationEnabled,
        speakerCount,
        vadEnabled,
        minSilenceDuration,
        speechPadMs,
        engagementSessionId,
        playbookId,
        taskId,
        workerId,
        generateSubject,
        generateTranscriptSummary,
        generateSentiment,
        bridgeId,
        name,
        metadata,
        sipCallId,
        cdrId,
        videoRoomId,
        videoParticipantId,
        displayName,
        role,
        serverVad,
      },
      {
        engine: { type: 'string', required: false },
        model: { type: 'string', required: false },
        languageCode: { type: 'string', required: false },
        encoding: { type: 'string', required: false },
        sampleRateHertz: { type: 'number', required: false },
        audioChannelCount: { type: 'number', required: false },
        singleUtterance: { type: 'boolean', required: false },
        interimResults: { type: 'boolean', required: false },
        enableAutomaticPunctuation: { type: 'boolean', required: false },
        diarizationEnabled: { type: 'boolean', required: false },
        speakerCount: { type: 'number', required: false },
        vadEnabled: { type: 'boolean', required: false },
        minSilenceDuration: { type: 'number', required: false },
        speechPadMs: { type: 'number', required: false },
        engagementSessionId: { type: 'string', required: false },
        playbookId: { type: 'string', required: false },
        taskId: { type: 'string', required: false },
        workerId: { type: 'string', required: false },
        generateSubject: { type: 'boolean', required: false },
        generateTranscriptSummary: { type: 'boolean', required: false },
        generateSentiment: { type: 'boolean', required: false },
        bridgeId: { type: 'string', required: false },
        name: { type: 'string', required: false },
        metadata: { type: 'object', required: false },
        sipCallId: { type: 'string', required: false },
        cdrId: { type: 'string', required: false },
        videoRoomId: { type: 'string', required: false },
        videoParticipantId: { type: 'string', required: false },
        displayName: { type: 'string', required: false },
        role: { type: 'string', required: false },
        serverVad: { type: 'boolean', required: false },
      },
    );

    // Create session via API
    const sessionParams = {
      body: {
        engine,
        model,
        engagementSessionId,
        playbookId,
        taskId,
        workerId,
        generateSubject,
        generateTranscriptSummary,
        generateSentiment,
        bridgeId,
        sipCallId,
        cdrId,
        name,
        videoRoomId,
        videoParticipantId,
        displayName,
        role,
        metadata: {
          ...metadata,
          languageCode,
          encoding,
          sampleRateHertz,
          audioChannelCount,
          singleUtterance,
          interimResults,
          enableAutomaticPunctuation,
          diarizationEnabled,
          speakerCount,
          vadEnabled,
          minSilenceDuration,
          speechPadMs,
        },
      },
    };

    const session = await internalRequest(this.sdk, 
      '/ai/stt/stream',
      'POST',
      sessionParams,
    );

    // Dynamic import of SttStream (only loads when needed)
    const { SttStream } = await import('./ai/SttStream.js');

    // Create and return stream instance
    const streamOptions = {
      ...options,
      languageCode,
      encoding,
      sampleRateHertz,
      audioChannelCount,
      vadEnabled,
      minSilenceDuration,
      speechPadMs,
      // SttStream reads these as videoRoomId/participantId/displayName/serverVad
      // for the gRPC first-chunk session config.
      videoRoomId,
      participantId: videoParticipantId,
      displayName,
      serverVad,
    };

    return new SttStream(this.sdk, session, streamOptions);
  }

  /**
   * Get a transcription by ID
   * @param {string} id - Transcription ID
   * @param {Object} [options] - Retrieval options
   * @param {boolean} [options.includeMessages=true] - Include transcription messages
   * @returns {Promise<Object>} Transcription data
   */
  async get(id, { includeMessages = true } = {}) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
        includeMessages: { type: 'boolean', required: false },
      },
    );

    const params = {
      query: { includeMessages: includeMessages.toString() },
    };

    const result = await internalRequest(this.sdk, `/ai/stt/${id}`, 'GET', params);
    return result;
  }

  /**
   * List transcriptions with filters
   * @param {Object} [filters] - Filter options
   * @param {string} [filters.engagementSessionId] - Filter by engagement session
   * @param {string} [filters.userId] - Filter by user
   * @param {string} [filters.status] - Filter by status
   * @param {string} [filters.engine] - Filter by engine
   * @param {string} [filters.sourceType] - Filter by source type
   * @param {string} [filters.playbookId] - Filter by playbook
   * @param {string} [filters.startDate] - Filter by start date
   * @param {string} [filters.endDate] - Filter by end date
   * @param {number} [filters.limit=50] - Limit results
   * @param {number} [filters.offset=0] - Offset for pagination
   * @returns {Promise<Object>} List of transcriptions
   */
  async list(filters = {}) {
    this.sdk.validateParams(filters, {
      engagementSessionId: { type: 'string', required: false },
      userId: { type: 'string', required: false },
      status: { type: 'string', required: false },
      engine: { type: 'string', required: false },
      sourceType: { type: 'string', required: false },
      playbookId: { type: 'string', required: false },
      startDate: { type: 'string', required: false },
      endDate: { type: 'string', required: false },
      limit: { type: 'number', required: false },
      offset: { type: 'number', required: false },
    });

    const params = {
      query: filters,
    };

    const result = await internalRequest(this.sdk, '/ai/stt', 'GET', params);
    return result;
  }

  /**
   * Log a transcription message for a streaming session
   * @param {string} sessionId - Transcription session ID
   * @param {string} messageId - message id for the transcription
   * @param {number} timestamp - message timestamp (unix)
   * @param {Object} message - Message data
   * @param {string} message.text - Transcribed text
   * @param {Object} [message.transcriptionJson] - Full transcription metadata
   * @param {number} [message.duration] - Duration of this segment in seconds
   * @param {number} [message.confidence] - Confidence score (0-1)
   * @param {string} [message.languageCode] - Language code for this segment
   * @param {string} [message.userId] - User associated with this message
   * @param {string} [message.role] - Speaker role
   * @param {string} [message.sipCallId] - SIP call identifier
   * @param {string} [message.side] - Stream side ('send' or 'recv')
   * @param {string} [message.bridgeId] - bridge id
   * @param {Object} [message.sentiment] - Sentiment analysis data
   * @param {number} [message.sentiment.score] - Overall sentiment score (-100 to +100)
   * @param {number} [message.sentiment.previousScore] - Previous sentiment score (-100 to +100)
   * @param {number} [message.sentiment.delta] - Score change (score - previousScore)
   * @param {number} [message.sentiment.customerScore] - Customer sentiment score (-100 to +100)
   * @param {number} [message.sentiment.agentScore] - Agent sentiment score (-100 to +100)
   * @param {number} [message.sentiment.intensity] - Sentiment intensity (0 to 1)
   * @param {string[]} [message.sentiment.emotions] - Detected emotions (up to 3)
   * @param {string} [message.sentiment.trend] - Sentiment trend ('improving' | 'stable' | 'declining')
   * @param {string} [message.sentiment.source] - Analysis source ('llm+acoustic' | 'acoustic_only' | 'carry_forward')
   * @returns {Promise<Object>} Created message result
   */
  async logMessage(
    sessionId,
    {
      messageId,
      timestamp,
      text,
      transcriptionJson,
      duration,
      confidence,
      languageCode,
      userId,
      role,
      sipCallId,
      side,
      bridgeId,
      sentiment,
      videoRoomId,
      videoParticipantId,
    },
  ) {
    this.sdk.validateParams(
      { messageId, sessionId, text, bridgeId },
      {
        sessionId: { type: 'string', required: true },
        messageId: { type: 'string', required: false },
        timestamp: { type: 'number', required: false },
        text: { type: 'string', required: true },
        transcriptionJson: { type: 'object', required: false },
        duration: { type: 'number', required: false },
        confidence: { type: 'number', required: false },
        languageCode: { type: 'string', required: false },
        userId: { type: 'string', required: false },
        role: { type: 'string', required: false },
        sipCallId: { type: 'string', required: false },
        side: { type: 'string', required: false },
        bridgeId: { type: 'string', required: false },
        sentiment: { type: 'object', required: false },
        videoRoomId: { type: 'string', required: false },
        videoParticipantId: { type: 'string', required: false },
      },
    );

    const params = {
      body: {
        messageId,
        timestamp,
        text,
        transcriptionJson,
        duration,
        confidence,
        languageCode,
        userId,
        role,
        sipCallId,
        side,
        bridgeId,
        sentiment,
        videoRoomId,
        videoParticipantId,
      },
    };

    const result = await internalRequest(this.sdk, 
      `/ai/stt/stream/${sessionId}/messages`,
      'POST',
      params,
    );
    return result;
  }

  /**
   * Complete a streaming transcription session
   * @param {string} sessionId - Transcription session ID
   * @param {Object} [options] - Completion options
   * @param {string} [options.status='completed'] - Final status ('completed' or 'failed')
   * @param {string} [options.error] - Error message if status is 'failed'
   * @returns {Promise<Object>} Completion result
   */
  async complete(sessionId, { status = 'completed', error } = {}) {
    this.sdk.validateParams(
      { sessionId },
      {
        sessionId: { type: 'string', required: true },
        status: { type: 'string', required: false },
        error: { type: 'string', required: false },
      },
    );

    const params = {
      body: { status, error },
    };

    const result = await internalRequest(this.sdk, 
      `/ai/stt/stream/${sessionId}/complete`,
      'PUT',
      params,
    );
    return result;
  }
}

// STT Constants
export const STT = {
  ENGINES: {
    GOOGLE: 'google',
    DEEPGRAM: 'deepgram',
    WHISPER: 'whisper',
  },
  SOURCE_TYPES: {
    FILE: 'file',
    STORAGE: 'storage',
    STREAM: 'stream',
    URL: 'url',
  },
  STATUS: {
    PENDING: 'pending',
    PROCESSING: 'processing',
    COMPLETED: 'completed',
    FAILED: 'failed',
  },
  LANGUAGES: {
    EN_US: 'en-US',
    EN_GB: 'en-GB',
    EN_AU: 'en-AU',
    ES_ES: 'es-ES',
    ES_MX: 'es-MX',
    ES_US: 'es-US',
    FR_FR: 'fr-FR',
    FR_CA: 'fr-CA',
    DE_DE: 'de-DE',
    IT_IT: 'it-IT',
    PT_BR: 'pt-BR',
    PT_PT: 'pt-PT',
    ZH_CN: 'zh-CN',
    JA_JP: 'ja-JP',
    KO_KR: 'ko-KR',
  },
};

export class ExtractService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Extract phone number from text
   * @param {Object} options - Extraction options
   * @param {string} options.value - Text containing phone number
   * @param {string} [options.country='US'] - Country code for validation
   * @param {string} [options.format='E164'] - Output format: 'E164', 'national', 'international'
   * @returns {Promise<Object>} { isValid, parsedValue, confidence, metadata: { country, type, nationalNumber, ... } }
   */
  async phone({ value, country = 'US', format = 'E164' }) {
    return this._extract('phone', value, { country, format });
  }

  /**
   * Extract email address from text
   * @param {Object} options - Extraction options
   * @param {string} options.value - Text containing email
   * @returns {Promise<Object>} { isValid, parsedValue, confidence, metadata: { domain } }
   */
  async email({ value }) {
    return this._extract('email', value);
  }

  /**
   * Extract physical address from text
   * @param {Object} options - Extraction options
   * @param {string} options.value - Text containing address
   * @param {boolean} [options.useAI=false] - Use AI for better extraction from conversational text
   * @returns {Promise<Object>} { isValid, parsedValue, confidence, metadata: { components } }
   */
  async address({ value, useAI = false }) {
    return this._extract('address', value, { useAI });
  }

  /**
   * Extract person's name from text
   * @param {Object} options - Extraction options
   * @param {string} options.value - Text containing name
   * @param {boolean} [options.useAI=true] - Use AI for extraction from conversational text
   * @returns {Promise<Object>} { isValid, parsedValue, firstName, lastName, title }
   */
  async personName({ value, useAI = true }) {
    return this._extract('personName', value, { useAI });
  }

  /**
   * Extract and validate credit card number (masked for security)
   * @param {Object} options - Extraction options
   * @param {string} options.value - Text containing credit card
   * @param {boolean} [options.maskOutput=true] - Mask all but last 4 digits
   * @returns {Promise<Object>} { isValid, parsedValue (masked), confidence, metadata: { cardType, length } }
   */
  async creditCard({ value, maskOutput = true }) {
    return this._extract('creditCard', value, { maskOutput });
  }

  /**
   * Extract and validate SSN (masked for security)
   * @param {Object} options - Extraction options
   * @param {string} options.value - Text containing SSN
   * @param {boolean} [options.maskOutput=true] - Mask all but last 4 digits
   * @returns {Promise<Object>} { isValid, parsedValue (masked), confidence, metadata }
   */
  async ssn({ value, maskOutput = true }) {
    return this._extract('ssn', value, { maskOutput });
  }

  /**
   * Extract phone extension
   * @param {Object} options - Extraction options
   * @param {string} options.value - Text containing extension
   * @param {number} [options.minLength=1] - Minimum digits
   * @param {number} [options.maxLength=10] - Maximum digits
   * @returns {Promise<Object>} { isValid, parsedValue, confidence }
   */
  async extension({ value, minLength = 1, maxLength = 10 }) {
    return this._extract('extension', value, { minLength, maxLength });
  }

  /**
   * Detect correct/incorrect response from natural language
   * @param {Object} options - Extraction options
   * @param {string} options.value - User's response (e.g., "yes", "no", "correct", "nope")
   * @returns {Promise<Object>} { isValid, parsedValue: 'correct'|'incorrect', booleanValue: true|false }
   */
  async correctIncorrect({ value }) {
    return this._extract('correctIncorrect', value);
  }

  /**
   * Extract using custom regex pattern
   * @param {Object} options - Extraction options
   * @param {string} options.value - Text to match against
   * @param {string} options.pattern - Regex pattern
   * @param {number} [options.maxLength] - Maximum length of extracted value
   * @param {string} [options.flags='g'] - Regex flags
   * @param {boolean} [options.replaceNumbers=true] - Convert number words to digits first
   * @returns {Promise<Object>} { isValid, parsedValue, originalValue, processedValue }
   */
  async regex({
    value,
    pattern,
    maxLength,
    flags = 'g',
    replaceNumbers = true,
  }) {
    return this._extract('regex', value, {
      pattern,
      maxLength,
      flags,
      replaceNumbers,
    });
  }

  /**
   * Detect intent response from natural language
   * @param {Object} options - Extraction options
   * @param {string} options.value - User's response (e.g., "I need help with my invoice")
   * @param {Object} options.params.question - The Question posed to the user to answer
   * @param {Object} options.params.validOptions - An array of objects with the valid intents
   *
   * @returns {Promise<Object>} { isValid, value: 'Billing',  }
   */
  async intent({ value, params }) {
    return this._extract('intent', value, params);
  }

  /**
   * Extract ALL entities from text (phone, email, address, name, etc.)
   * @param {Object} options - Extraction options
   * @param {string} options.value - Text to extract from
   * @param {array} [options.types] - Array of strings of the types you want to find ('correctIncorrect', 'phone', 'email', 'address', 'personName', 'extension', 'creditCard', 'ssn'). If not provided, all types will be extracted.
   * @param {string} [options.question] - The original question that was asked to the user. Providing this context significantly improves extraction accuracy by helping the AI understand what data entities to look for.
   * @returns {Promise<Object>} { isValid, extractions: [{ type, value, ...metadata }], metadata }
   */
  async all({ value, types = [], question }) {
    const params = {
      types,
      question,
    };
    return this._extract('all', value, params);
  }

  // Internal method
  async _extract(type, value, params = {}) {
    this.sdk.validateParams(
      { type, value },
      {
        type: { type: 'string', required: true },
        value: { type: 'string', required: true },
      },
    );

    const requestParams = {
      body: {
        type,
        value,
        params,
      },
    };

    const result = await internalRequest(this.sdk, '/ai/extract', 'POST', requestParams);
    return result;
  }
}
