import * as layoutSchemas from '../schemas/layouts/index.js';

export class LayoutsService {
  constructor(sdk) {
    this.sdk = sdk;
    this.schema = layoutSchemas;   // sdk.layouts.schema.{LayoutDoc, validateLayoutDoc, migrateLayoutSchema, ...}
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
}
