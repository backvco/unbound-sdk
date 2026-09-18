import { internalRequest } from '../../base.js';

/**
 * Text-to-speech. `sdk.ai.tts.*`.
 *
 * @see app1-api src/services/ai/routes/tts.js
 */
export class TextToSpeechService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Render text to speech and get back a storage id/url (buffered — waits
   * for the whole file). For low-latency playback (e.g. a voice bot) use
   * `stream()` instead.
   * @param {Object} params
   * @param {string} params.text
   * @param {string} [params.voice]
   * @param {string} [params.languageCode]
   * @param {string} [params.ssmlGender]
   * @param {string} [params.audioEncoding]
   * @param {number} [params.speakingRate]
   * @param {number} [params.pitch]
   * @param {number} [params.volumeGainDb]
   * @param {string[]} [params.effectsProfileIds]
   * @param {boolean} [params.createAccessKey]
   * @returns {Promise<Object>} `{ id, storageId, url? }`
   */
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

  /**
   * Stream TTS audio as it's generated — first bytes can arrive well before
   * the whole utterance finishes rendering (Groq voices: TTFB ~0.2s).
   * Always renders wav; shares its cache with `create()` when
   * audioEncoding:'wav' is used there.
   *
   * Node: wrap the result in `Readable.fromWeb(result.body)` to get a
   * normal Node stream (e.g. to pipe into ffmpeg). Browser: `result.body`
   * is already a web ReadableStream you can read directly or hand to
   * `new Response(result.body)` / a `<audio>` element via a Blob.
   *
   * Response headers of note: `x-tts-cache` (`hit`|`miss`) and `x-tts-id`
   * (set on a cache hit, when the id is already known).
   *
   * @param {Object} params
   * @param {string} params.text
   * @param {string} [params.voice]
   * @param {string} [params.languageCode]
   * @returns {Promise<{body: ReadableStream, headers: Headers, status: number}>}
   * @example
   * const result = await sdk.ai.tts.stream({ text: 'Hi there', voice: 'hannah' });
   * const nodeStream = Readable.fromWeb(result.body);
   * nodeStream.pipe(ffmpegProcess.stdin);
   */
  async stream({ text, voice, languageCode }) {
    this.sdk.validateParams(
      { text, voice, languageCode },
      {
        text: { type: 'string', required: true },
        voice: { type: 'string', required: false },
        languageCode: { type: 'string', required: false },
      },
    );

    const ttsData = { text };
    if (voice) ttsData.voice = voice;
    if (languageCode) ttsData.languageCode = languageCode;

    const params = {
      body: ttsData,
      returnRawResponse: true,
    };

    // forceFetch: true — NATS transport can't carry a streamed body.
    const response = await internalRequest(
      this.sdk,
      '/ai/tts/stream',
      'POST',
      params,
      true,
    );

    return {
      body: response.body,
      headers: response.headers,
      status: response.status,
    };
  }
}
