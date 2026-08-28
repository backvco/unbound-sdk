import { internalRequest } from '../base.js';
export class DocumentTemplatesService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Create a document template head (draft, no version row).
   * @param {Object} params
   * @param {string} params.name - Template name (required)
   * @param {string} [params.description]
   * @param {string} [params.tag]
   * @param {string[]} [params.uses] - Consumer surfaces (`fax`). Empty = all.
   * @param {'generative'|'overlay'} [params.engine='generative']
   * @param {string} [params.sourcePdfStorageId] - Required when engine is overlay
   * @param {Object[]} [params.objects] - `[{objectName, recordTypeIds}]`. Empty/omitted = applies to every object.
   * @param {Object} [params.draftSchemaJson]
   * @param {Object} [params.draftLayoutJson]
   * @param {Object} [params.draftPageJson]
   * @param {Object} [params.draftThemeJson]
   * @returns {Promise<Object>} Created template (includes draft*)
   */
  async create({
    name,
    description,
    tag,
    uses,
    engine,
    sourcePdfStorageId,
    objects,
    draftSchemaJson,
    draftLayoutJson,
    draftPageJson,
    draftThemeJson,
  }) {
    this.sdk.validateParams(
      { name },
      {
        name: { type: 'string', required: true },
        description: { type: 'string', required: false },
        tag: { type: 'string', required: false },
        uses: { type: 'object', required: false },
        engine: { type: 'string', required: false },
        sourcePdfStorageId: { type: 'string', required: false },
        objects: { type: 'object', required: false },
        draftSchemaJson: { type: 'object', required: false },
        draftLayoutJson: { type: 'object', required: false },
        draftPageJson: { type: 'object', required: false },
        draftThemeJson: { type: 'object', required: false },
      },
    );

    const body = { name };
    if (description !== undefined) body.description = description;
    if (tag !== undefined) body.tag = tag;
    if (uses !== undefined) body.uses = uses;
    if (engine !== undefined) body.engine = engine;
    if (sourcePdfStorageId !== undefined) {
      body.sourcePdfStorageId = sourcePdfStorageId;
    }
    if (objects !== undefined) body.objects = objects;
    if (draftSchemaJson !== undefined) body.draftSchemaJson = draftSchemaJson;
    if (draftLayoutJson !== undefined) body.draftLayoutJson = draftLayoutJson;
    if (draftPageJson !== undefined) body.draftPageJson = draftPageJson;
    if (draftThemeJson !== undefined) body.draftThemeJson = draftThemeJson;

    return internalRequest(this.sdk, '/documents/templates', 'POST', { body });
  }

  /**
   * List document templates (not deleted). Returns draft* for authoring.
   * @param {Object} [params]
   * @param {string} [params.tag]
   * @param {string} [params.status]
   * @param {string} [params.use] - Consumer surface (`fax`). Empty uses match all.
   * @param {string} [params.object] - Target object name (e.g. `people`). Filters to templates that apply to it.
   * @param {string} [params.recordTypeId] - Record type within `object`; ignored without `object`.
   * @param {number} [params.limit]
   * @returns {Promise<{results: Object[]}>}
   */
  async list({ tag, status, use, object, recordTypeId, limit } = {}) {
    const query = {};
    if (tag) query.tag = tag;
    if (status) query.status = status;
    if (use) query.use = use;
    if (object) query.object = object;
    if (recordTypeId) query.recordTypeId = recordTypeId;
    if (limit) query.limit = limit;
    return internalRequest(this.sdk, '/documents/templates', 'GET', { query });
  }

  /**
   * Get a document template by id (head + draft* + published version if any).
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async get(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/documents/templates/${id}`, 'GET');
  }

  /**
   * Update name/description/tag/draft*. Cannot change engine.
   * @param {string} id
   * @param {Object} params
   * @param {string} [params.name]
   * @param {string} [params.description]
   * @param {string} [params.tag]
   * @param {string[]} [params.uses]
   * @param {Object[]} [params.objects] - `[{objectName, recordTypeIds}]`. Empty/omitted = applies to every object.
   * @param {Object} [params.draftSchemaJson]
   * @param {Object} [params.draftLayoutJson]
   * @param {Object} [params.draftPageJson]
   * @param {Object} [params.draftThemeJson]
   * @returns {Promise<Object>}
   */
  async update(
    id,
    {
      name,
      description,
      tag,
      uses,
      recordTypeId,
      objects,
      draftSchemaJson,
      draftLayoutJson,
      draftPageJson,
      draftThemeJson,
    } = {},
  ) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
        name: { type: 'string', required: false },
        description: { type: 'string', required: false },
        tag: { type: 'string', required: false },
        uses: { type: 'object', required: false },
        recordTypeId: { type: 'string', required: false },
        objects: { type: 'object', required: false },
        draftSchemaJson: { type: 'object', required: false },
        draftLayoutJson: { type: 'object', required: false },
        draftPageJson: { type: 'object', required: false },
        draftThemeJson: { type: 'object', required: false },
      },
    );

    const body = {};
    if (name !== undefined) body.name = name;
    if (description !== undefined) body.description = description;
    if (tag !== undefined) body.tag = tag;
    if (uses !== undefined) body.uses = uses;
    if (recordTypeId !== undefined) body.recordTypeId = recordTypeId;
    if (objects !== undefined) body.objects = objects;
    if (draftSchemaJson !== undefined) body.draftSchemaJson = draftSchemaJson;
    if (draftLayoutJson !== undefined) body.draftLayoutJson = draftLayoutJson;
    if (draftPageJson !== undefined) body.draftPageJson = draftPageJson;
    if (draftThemeJson !== undefined) body.draftThemeJson = draftThemeJson;

    return internalRequest(this.sdk, `/documents/templates/${id}`, 'PATCH', { body });
  }

  /**
   * Snapshot draft* into a new published version and set currentVersionId.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async publish(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/documents/templates/${id}/publish`, 'POST', {
      body: {},
    });
  }

  /**
   * Soft-delete a document template.
   * @param {string} id
   * @returns {Promise<{id: string, deleted: boolean}>}
   */
  async delete(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/documents/templates/${id}`, 'DELETE');
  }
}

export class DocumentsService {
  constructor(sdk) {
    this.sdk = sdk;
    this.templates = new DocumentTemplatesService(sdk);
  }

  /**
   * Generate a PDF from the published template version.
   * @param {Object} params
   * @param {string} params.templateId
   * @param {Object} params.data
   * @param {string} [params.versionId]
   * @param {Object} [params.options]
   * @param {string} [params.options.filename]
   * @param {boolean} [params.options.includeRecipientFieldMap] - Persist recipient field geometry for esign
   * @param {Object} [params.source]
   * @param {string} [params.source.type]
   * @param {string} [params.source.id]
   * @returns {Promise<Object>}
   */
  async generate({ templateId, data, versionId, options, source }) {
    this.sdk.validateParams(
      { templateId, data },
      {
        templateId: { type: 'string', required: true },
        data: { type: 'object', required: true },
        versionId: { type: 'string', required: false },
        options: { type: 'object', required: false },
        source: { type: 'object', required: false },
      },
    );

    const body = { templateId, data };
    if (versionId !== undefined) body.versionId = versionId;
    if (options !== undefined) body.options = options;
    if (source !== undefined) body.source = source;

    return internalRequest(this.sdk, '/documents/generate', 'POST', { body });
  }

  /**
   * Preview a PDF from draft* (or a specific versionId). isPreview=1.
   * @param {Object} params
   * @param {string} params.templateId
   * @param {Object} [params.data]
   * @param {string} [params.versionId]
   * @returns {Promise<Object>}
   */
  async preview({ templateId, data, versionId }) {
    this.sdk.validateParams(
      { templateId },
      {
        templateId: { type: 'string', required: true },
        data: { type: 'object', required: false },
        versionId: { type: 'string', required: false },
      },
    );

    const body = { templateId };
    if (data !== undefined) body.data = data;
    if (versionId !== undefined) body.versionId = versionId;

    return internalRequest(this.sdk, '/documents/preview', 'POST', { body });
  }

  /**
   * Attach a consumer id (e.g. fax document) after send.
   * @param {Object} params
   * @param {string} params.id - generatedDocuments id
   * @param {string} [params.sourceId]
   * @param {string} [params.sourceType]
   * @returns {Promise<Object>}
   */
  async updateGenerated({ id, sourceId, sourceType }) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
        sourceId: { type: 'string', required: false },
        sourceType: { type: 'string', required: false },
      },
    );

    const body = {};
    if (sourceId !== undefined) body.sourceId = sourceId;
    if (sourceType !== undefined) body.sourceType = sourceType;

    return internalRequest(this.sdk, `/documents/generated/${id}`, 'PATCH', { body });
  }

  /**
   * Page count / size for a stored PDF.
   * @param {Object} params
   * @param {string} params.storageId
   * @returns {Promise<{pageCount: number, pageSize: string|null}>}
   */
  async inspect({ storageId }) {
    this.sdk.validateParams(
      { storageId },
      { storageId: { type: 'string', required: true } },
    );
    return internalRequest(this.sdk, '/documents/inspect', 'POST', { body: { storageId } });
  }
}
