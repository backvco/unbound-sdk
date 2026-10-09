import { internalRequest } from '../base.js';

/**
 * Admin-managed voicemail drop types (voicemail-drop-plan.md §5). A type is
 * the category a message belongs to (e.g. "Not home", "Left message");
 * queues/journeys preselect by type.
 */
export class VoicemailDropTypesService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * List voicemail drop types.
   * @param {Object} [params]
   * @param {boolean} [params.includeInactive]
   * @returns {Promise<{results: Object[]}>}
   */
  async list(params = {}) {
    return internalRequest(this.sdk, '/voicemailDrops/types', 'GET', { query: { ...params } });
  }

  /**
   * Get a single voicemail drop type.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async get(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/voicemailDrops/types/${id}`, 'GET');
  }

  /**
   * Create a voicemail drop type.
   * @param {Object} options
   * @param {string} options.name
   * @param {string} [options.description]
   * @param {boolean} [options.active]
   * @returns {Promise<Object>}
   */
  async create(options = {}) {
    this.sdk.validateParams(
      { name: options.name },
      { name: { type: 'string', required: true } },
    );
    return internalRequest(this.sdk, '/voicemailDrops/types', 'POST', {
      body: { ...options },
    });
  }

  /**
   * Update a voicemail drop type.
   * @param {string} id
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async update(id, options = {}) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/voicemailDrops/types/${id}`, 'PUT', {
      body: { ...options },
    });
  }

  /**
   * Remove (soft-delete) a voicemail drop type.
   * @param {string} id
   * @returns {Promise<{id: string, deleted: boolean}>}
   */
  async remove(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/voicemailDrops/types/${id}`, 'DELETE');
  }

  /**
   * Set which users/groups can see a voicemail drop type.
   * @param {string} id
   * @param {Object} options
   * @param {string[]} [options.userIds]
   * @param {string[]} [options.groupIds]
   * @returns {Promise<Object>}
   */
  async setAccess(id, { userIds, groupIds } = {}) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/voicemailDrops/types/${id}/access`, 'PUT', {
      body: { userIds, groupIds },
    });
  }

  /**
   * List users who have recorded a voicemail drop message for this type.
   * @param {string} id
   * @returns {Promise<{results: Object[]}>}
   */
  async recordings(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/voicemailDrops/types/${id}/recordings`, 'GET');
  }
}

// Build a multipart body for a single audio file + scalar fields. Mirrors
// storage.js's node/browser FormData construction so this works in both
// environments without depending on StorageService internals.
function buildMultipart(file, fields) {
  const isNode = typeof window === 'undefined';

  if (!isNode) {
    const formData = new FormData();
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer && Buffer.isBuffer(file)) {
      formData.append('file', new Blob([file]), fields.fileName || 'file');
    } else if (typeof File !== 'undefined' && file instanceof File) {
      formData.append('file', file);
    } else {
      throw new Error('In browser environment, file must be a Buffer or File object');
    }
    for (const [name, value] of Object.entries(fields)) {
      if (value === undefined || value === null) continue;
      formData.append(name, typeof value === 'object' ? JSON.stringify(value) : String(value));
    }
    return { body: formData, headers: {} };
  }

  // Node: build the multipart buffer by hand.
  const boundary = `----formdata-${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const CRLF = '\r\n';
  const fileName = fields.fileName || 'file';
  const parts = [];

  parts.push(Buffer.from(
    `--${boundary}${CRLF}Content-Disposition: form-data; name="file"; filename="${fileName}"${CRLF}` +
      `Content-Type: application/octet-stream${CRLF}${CRLF}`,
    'utf8',
  ));
  parts.push(Buffer.isBuffer(file) ? file : Buffer.from(file));
  parts.push(Buffer.from(CRLF, 'utf8'));

  for (const [name, value] of Object.entries(fields)) {
    if (value === undefined || value === null) continue;
    const v = typeof value === 'object' ? JSON.stringify(value) : String(value);
    parts.push(Buffer.from(
      `--${boundary}${CRLF}Content-Disposition: form-data; name="${name}"${CRLF}${CRLF}${v}${CRLF}`,
      'utf8',
    ));
  }
  parts.push(Buffer.from(`--${boundary}--${CRLF}`, 'utf8'));

  return {
    body: Buffer.concat(parts),
    headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
  };
}

/**
 * Per-user voicemail drop messages (voicemail-drop-plan.md §5, §6). A
 * message is either an uploaded/recorded file or TTS-generated, scoped to a
 * type (or personal/untyped), with one default per type.
 */
export class VoicemailDropsService {
  constructor(sdk) {
    this.sdk = sdk;
    this.types = new VoicemailDropTypesService(sdk);
  }

  /**
   * List the current user's own voicemail drop messages plus all active
   * types, with `hasMessage` flagged per type.
   * @returns {Promise<{messages: Object[], types: Object[]}>}
   */
  async listMine() {
    return internalRequest(this.sdk, '/voicemailDrops/mine', 'GET');
  }

  /**
   * Create a voicemail drop message — either an uploaded/recorded audio
   * file (multipart, works in browser and Node) or a TTS message (plain
   * JSON, no file needed).
   * @param {Object} options
   * @param {Object} [options.file] - Buffer or browser File; omit for TTS
   * @param {string} options.name
   * @param {string} [options.typeId]
   * @param {string} [options.ttsText]
   * @param {string} [options.ttsVoice]
   * @param {boolean} [options.isDefault]
   * @returns {Promise<Object>} the created row (status 'processing' until transcode completes)
   */
  async create({ file, name, typeId, ttsText, ttsVoice, isDefault, fileName } = {}) {
    this.sdk.validateParams(
      { name, typeId, ttsText, ttsVoice, isDefault, fileName },
      {
        name: { type: 'string', required: true },
        typeId: { type: 'string', required: false },
        ttsText: { type: 'string', required: false },
        ttsVoice: { type: 'string', required: false },
        isDefault: { type: 'boolean', required: false },
        fileName: { type: 'string', required: false },
      },
    );

    if (!file && !ttsText) {
      throw new Error('create requires either file or ttsText');
    }

    if (file) {
      const { body, headers } = buildMultipart(file, {
        fileName,
        name,
        typeId,
        isDefault,
      });
      return internalRequest(
        this.sdk,
        '/voicemailDrops',
        'POST',
        { body, headers },
        true,
      );
    }

    return internalRequest(this.sdk, '/voicemailDrops', 'POST', {
      body: { name, typeId, ttsText, ttsVoice, isDefault },
    });
  }

  /**
   * Update a voicemail drop message (rename, change type, set default).
   * @param {string} id
   * @param {Object} options
   * @returns {Promise<Object>}
   */
  async update(id, options = {}) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/voicemailDrops/${id}`, 'PUT', {
      body: { ...options },
    });
  }

  /**
   * Remove (soft-delete) a voicemail drop message.
   * @param {string} id
   * @returns {Promise<{id: string, deleted: boolean}>}
   */
  async remove(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/voicemailDrops/${id}`, 'DELETE');
  }

  /**
   * Get a short-lived signed preview URL for a message's audio.
   * @param {string} id
   * @returns {Promise<{url: string}>}
   */
  async preview(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/voicemailDrops/${id}/preview`, 'POST');
  }

  /**
   * Admin: a user's message coverage per type.
   * @param {string} userId
   * @returns {Promise<{messages: Object[], types: Object[]}>}
   */
  async forUser(userId) {
    this.sdk.validateParams(
      { userId },
      { userId: { type: 'string', required: true } },
    );
    return internalRequest(this.sdk, `/voicemailDrops/users/${userId}`, 'GET');
  }
}
