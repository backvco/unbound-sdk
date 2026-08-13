import { EventEmitter } from 'events';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * SttStream - Speech-to-Text streaming interface
 *
 * Wraps gRPC connection to transcription service with EventEmitter API
 *
 * Events:
 * - 'ready': Stream connected and ready for audio
 * - 'transcript': Transcription result received
 * - 'final-transcript': Final transcription result received
 * - 'error': Error occurred
 * - 'close': Stream closed
 *
 * Methods:
 * - write(audioChunk): Send audio data (Buffer or Uint8Array)
 * - end(): Close stream gracefully
 */
export class SttStream extends EventEmitter {
  constructor(sdk, session, options) {
    super();

    this.sdk = sdk;
    this.session = session;
    this.options = options;

    // Connection state
    this.isReady = false;
    this.isClosed = false;
    this.grpcCall = null;
    this.firstChunkSent = false;

    // Initialize connection asynchronously
    this._initialize().catch((error) => {
      this.emit('error', error);
    });
  }

  async _initialize() {
    try {
      // Dynamic import of gRPC (only loads when stream is used)
      const grpc = await import('@grpc/grpc-js');
      const protoLoader = await import('@grpc/proto-loader');

      // Load proto file from SDK proto directory
      const PROTO_PATH = path.join(
        __dirname,
        '../../proto/transcription.proto',
      );

      const packageDefinition = protoLoader.loadSync(PROTO_PATH, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true,
      });

      const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
      const TranscriptionService =
        protoDescriptor.transcription.TranscriptionService;

      // Create gRPC client
      const endpoint = `${this.session.grpcHost}:${this.session.grpcPort}`;
      const client = new TranscriptionService(
        endpoint,
        grpc.credentials.createInsecure(),
      );

      // Create bidirectional stream
      this.grpcCall = client.StreamTranscribe();

      // Setup event handlers
      this.grpcCall.on('data', (response) => {
        this._handleTranscript(response);
      });

      this.grpcCall.on('error', (error) => {
        if (!this.isClosed) {
          this.emit('error', error);
          this.close();
        }
      });

      this.grpcCall.on('end', () => {
        this.close();
      });

      // Mark as ready
      this.isReady = true;
      this.emit('ready');
    } catch (error) {
      this.emit(
        'error',
        new Error(`Failed to initialize gRPC connection: ${error.message}`),
      );
      this.close();
    }
  }

  _handleTranscript(response) {
    // Parse gRPC response and emit transcript event
    // Response format from transcription service (camelCase from proto snake_case):
    // {
    //   transcript: string,
    //   isFinal: boolean,
    //   confidence: float,
    //   language: string,
    //   timestamp: long,
    //   words: [{ word, startTime, endTime, confidence }],
    //   startTime: float,
    //   endTime: float,
    //   sipCallId: string,   // NEW
    //   side: string,        // NEW
    //   role: string         // NEW
    //   videoRoomId: string,     // NEW (meet sessions only, else '')
    //   participantId: string,   // NEW (meet sessions only, else '')
    //   displayName: string,     // NEW (meet sessions only, else '')
    //   messageId: string        // NEW (proto field 14)
    // }

    if (response.transcript) {
      const transcriptData = {
        text: response.transcript,
        isFinal: response.isFinal || response.is_final || false,
        confidence: response.confidence || 0,
        languageCode: response.language,
        words: response.words || [],
        startTime: response.startTime || response.start_time,
        endTime: response.endTime || response.end_time,
        timestamp: new Date(),
        // Stream identification (NEW)
        sipCallId: response.sipCallId || response.sip_call_id || '',
        side: response.side || '',
        role: response.role || '',
        // Meet (video-room) session metadata (NEW, additive, '' when not a meet session)
        videoRoomId: response.videoRoomId || response.video_room_id || '',
        participantId: response.participantId || response.participant_id || '',
        displayName: response.displayName || response.display_name || '',
        messageId: response.messageId || response.message_id || '',
      };

      this.emit('transcript', transcriptData);

      // If final transcript, also emit final-transcript event
      if (transcriptData.isFinal) {
        this.emit('final-transcript', transcriptData);
      }
    }
  }

  /**
   * Write audio chunk to stream
   * @param {Buffer|Uint8Array} audioChunk - Audio data
   * @param {Object} streamMetadata - Stream identification (sipCallId, side, role, isLastChunk)
   * @param {string} streamMetadata.sipCallId - SIP call identifier
   * @param {string} streamMetadata.side - 'send' or 'recv'
   * @param {string} streamMetadata.role - Optional speaker role (e.g., 'customer', 'agent', 'system')
   * @param {boolean} streamMetadata.isLastChunk - If true, marks this specific stream as complete
   * @returns {boolean} - True if write successful
   *
   * Meet (video-room) session metadata is not per-chunk — it is sent once in the
   * first-chunk session config, read from stream options: options.videoRoomId,
   * options.participantId, options.displayName, options.serverVad. See constructor.
   * @param {string[]} [options.vocabulary] - Custom vocabulary terms to bias
   * transcription toward (sent once in the first-chunk session config).
   */
  write(audioChunk, streamMetadata = {}) {
    if (this.isClosed) {
      this.emit('error', new Error('Stream is closed'));
      return false;
    }

    if (!this.isReady) {
      // Wait for ready and then write
      this.once('ready', () => this.write(audioChunk, streamMetadata));
      return true;
    }

    try {
      const {
        sipCallId = '',
        side = '',
        role = '',
        isLastChunk = false,
        bridgeId = '',
      } = streamMetadata;

      // First chunk includes token and configuration
      if (!this.firstChunkSent) {
        const request = {
          audio_chunk: audioChunk,
          token: this.session.token,
          session_id: this.session.id,
          language: this.options.languageCode || 'en-US',
          engine: this.options.engine || 'google',
          config: {
            encoding: this.options.encoding || 'LINEAR16',
            sample_rate_hertz: this.options.sampleRateHertz || 16000,
            audio_channel_count: this.options.audioChannelCount || 1,
            vad_enabled: this.options.vadEnabled || false,
            min_silence_duration_ms: this.options.minSilenceDuration || 500,
            speech_pad_ms: this.options.speechPadMs || 400,
          },
          is_first_chunk: true,
          is_last_chunk: isLastChunk,
          // Stream identification
          sip_call_id: sipCallId,
          side: side,
          role: role,
          playbook_id: this.options.playbookId || '',
          task_id: this.options.taskId || '',
          worker_id: this.options.workerId || '',
          generate_subject: this.options.generateSubject || false,
          generate_transcript_summary: this.options.generateTranscriptSummary || false,
          generate_sentiment: this.options.generateSentiment || false,
          bridge_id: bridgeId,
          // Meet (video-room) session metadata (NEW, additive, optional)
          video_room_id: this.options.videoRoomId || '',
          participant_id: this.options.participantId || '',
          display_name: this.options.displayName || '',
          server_vad: this.options.serverVad || false,
          vocabulary: this.options.vocabulary || [],
        };

        this.grpcCall.write(request);
        this.firstChunkSent = true;
      } else {
        // Subsequent chunks include audio, session ID, and stream identification
        const request = {
          audio_chunk: audioChunk,
          session_id: this.session.id,
          is_first_chunk: false,
          is_last_chunk: isLastChunk,
          // Stream identification - sent on every chunk
          sip_call_id: sipCallId,
          side: side,
          role: role,
          bridge_id: bridgeId,
        };

        // Include VAD fields if present in metadata
        if (streamMetadata.vad_event) {
          request.vad_event = streamMetadata.vad_event;
          request.vad_timestamp = streamMetadata.vad_timestamp;

          if (streamMetadata.vad_energy !== undefined) {
            request.vad_energy = streamMetadata.vad_energy;
          }
          if (streamMetadata.vad_duration !== undefined) {
            request.vad_duration = streamMetadata.vad_duration;
          }
        }

        this.grpcCall.write(request);
      }

      return true;
    } catch (error) {
      this.emit(
        'error',
        new Error(`Failed to write audio chunk: ${error.message}`),
      );
      return false;
    }
  }

  /**
   * End the stream gracefully
   */
  end() {
    if (!this.isClosed && this.grpcCall) {
      try {
        // Send final chunk marker
        if (this.firstChunkSent) {
          this.grpcCall.write({
            audio_chunk: Buffer.alloc(0),
            session_id: this.session.id,
            is_first_chunk: false,
            is_last_chunk: true,
          });
        }
        this.grpcCall.end();
      } catch (error) {
        // Ignore errors during end
      }
    }
  }

  /**
   * Close the stream and cleanup resources
   */
  close() {
    if (this.isClosed) return;

    this.isClosed = true;
    this.isReady = false;

    if (this.grpcCall) {
      try {
        this.grpcCall.end();
      } catch (error) {
        // Ignore errors during cleanup
      }
      this.grpcCall = null;
    }

    this.emit('close');
    this.removeAllListeners();
  }

  /**
   * Check if stream is ready for audio
   * @returns {boolean}
   */
  get ready() {
    return this.isReady && !this.isClosed;
  }

  /**
   * Get the session ID
   * @returns {string}
   */
  get sessionId() {
    return this.session.id;
  }
}
