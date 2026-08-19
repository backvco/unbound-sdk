import * as layoutSchemas from '../schemas/layouts/index.js';

export class LayoutsService {
  constructor(sdk) {
    this.sdk = sdk;
    this.schema = layoutSchemas;   // sdk.layouts.schema.{LayoutDoc, validateLayoutDoc, migrateLayoutSchema, ...}
    this.assignments = new LayoutAssignmentsService(sdk);   // sdk.layouts.assignments.{list,create,update,delete}
  }

  async get(objectName, id, query = {}) {
    this.sdk.validateParams(
      { objectName, id, query },
      {
        objectName: { type: 'string', required: false },
        id: { type: 'string', required: false },
        query: { type: 'object', required: false },
      },
    );

    const params = {
      query,
    };

    let uri = `/layouts/${objectName}`;
    if (id) {
      uri = `${uri}/${id}`;
    }

    const result = await this.sdk._fetch(uri, 'GET', params);
    return result;
  }

  async create(layout) {
    this.sdk.validateParams(
      { layout },
      {
        layout: { type: 'object', required: true },
      },
    );

    const params = {
      body: layout,
    };

    const result = await this.sdk._fetch('/layouts/', 'POST', params);
    return result;
  }

  async update(id, layout) {
    this.sdk.validateParams(
      { id, layout },
      {
        id: { type: 'string', required: true },
        layout: { type: 'object', required: true },
      },
    );

    const params = {
      body: layout,
    };

    const result = await this.sdk._fetch(`/layouts/${id}`, 'PUT', params);
    return result;
  }

  async delete(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const params = {};

    const result = await this.sdk._fetch(`/layouts/${id}`, 'DELETE', params);
    return result;
  }

  async dynamicSelectSearch(query) {
    this.sdk.validateParams(
      { query },
      {
        query: { type: 'object', required: true },
      },
    );

    const params = {
      query,
    };

    const result = await this.sdk._fetch(
      '/layouts/selectDynamic/search',
      'GET',
      params,
    );
    return result;
  }

  // `object` is required for object-scoped kinds ('list'/'detail'/'compact')
  // but omitted for kind:'home' (home layouts are not object-scoped).
  async resolve({
    object, kind, recordId, recordTypeId, asUser, preset,
  } = {}) {
    this.sdk.validateParams(
      { object, kind, preset },
      {
        object: { type: 'string', required: kind !== 'home' },
        kind: { type: 'string', required: true },
        recordId: { type: 'string', required: false },
        recordTypeId: { type: 'string', required: false },
        asUser: { type: 'string', required: false },
        preset: { type: 'string', required: false },
      },
    );

    const query = { kind, recordId, recordTypeId, asUser, preset };
    if (object) {
      query.object = object;
    }

    const params = { query };

    const result = await this.sdk._fetch('/layouts/resolve', 'GET', params);
    return result;
  }

  async getVersions(layoutId) {
    this.sdk.validateParams(
      { layoutId },
      { layoutId: { type: 'string', required: true } },
    );

    const result = await this.sdk._fetch(`/layouts/${layoutId}/versions`, 'GET', {});
    return result;
  }

  async getForEdit(layoutId) {
    this.sdk.validateParams(
      { layoutId },
      { layoutId: { type: 'string', required: true } },
    );

    const result = await this.sdk._fetch(`/layouts/${layoutId}/edit`, 'GET', {});
    return result;
  }

  async publish(layoutId, { changeNote } = {}) {
    this.sdk.validateParams(
      { layoutId },
      { layoutId: { type: 'string', required: true } },
    );

    const params = {
      body: { changeNote },
    };

    const result = await this.sdk._fetch(`/layouts/${layoutId}/publish`, 'POST', params);
    return result;
  }

  async rollback(layoutId, version) {
    this.sdk.validateParams(
      { layoutId, version },
      {
        layoutId: { type: 'string', required: true },
        version: { type: 'number', required: true },
      },
    );

    const result = await this.sdk._fetch(
      `/layouts/${layoutId}/versions/${version}/rollback`,
      'POST',
      {},
    );
    return result;
  }
}

export class LayoutAssignmentsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  // objectName defaults to '' for kind:'home' — matches the assignments
  // table's existing "empty string = wildcard" convention for
  // recordTypeId/audienceId; not a new pattern.
  async list({ objectName, kind } = {}) {
    const resolvedObjectName = objectName ?? (kind === 'home' ? '' : objectName);
    this.sdk.validateParams(
      { objectName: resolvedObjectName, kind },
      {
        objectName: { type: 'string', required: true },
        kind: { type: 'string', required: true },
      },
    );

    const params = {
      query: { objectName: resolvedObjectName, kind },
    };

    const result = await this.sdk._fetch('/layouts/assignments', 'GET', params);
    return result;
  }

  async create({ objectName, kind, recordTypeId, audienceType, audienceId, layoutId, priority } = {}) {
    const resolvedObjectName = objectName ?? (kind === 'home' ? '' : objectName);
    this.sdk.validateParams(
      { objectName: resolvedObjectName, kind, audienceType, layoutId },
      {
        objectName: { type: 'string', required: true },
        kind: { type: 'string', required: true },
        audienceType: { type: 'string', required: true },
        layoutId: { type: 'string', required: true },
      },
    );

    const params = {
      body: {
        objectName: resolvedObjectName, kind, recordTypeId, audienceType, audienceId, layoutId, priority,
      },
    };

    const result = await this.sdk._fetch('/layouts/assignments', 'POST', params);
    return result;
  }

  async update(id, updates) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );

    const params = {
      body: updates,
    };

    const result = await this.sdk._fetch(`/layouts/assignments/${id}`, 'PUT', params);
    return result;
  }

  async delete(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );

    const result = await this.sdk._fetch(`/layouts/assignments/${id}`, 'DELETE', {});
    return result;
  }
}
