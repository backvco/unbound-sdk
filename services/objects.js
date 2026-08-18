/**
 * Objects Service - Manage data objects in the Unbound platform
 *
 * This service supports both new object-based signatures and legacy positional arguments
 * for backward compatibility. New projects should use the object-based signatures.
 *
 * @example
 * // Preferred (new) usage:
 * const result = await sdk.objects.query({
 *   object: 'users',
 *   select: ['id', 'name', 'email'],
 *   where: { status: 'active' },
 *   limit: 100
 * });
 *
 * @example
 * // Legacy (deprecated) usage still supported:
 * const result = await sdk.objects.query('users', { status: 'active' });
 */
import { liveQuery } from './liveQuery.js';

export class ObjectsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Subscribe to real-time changes on an object (see services/liveQuery.js
   * for the full contract: heartbeat, seq-gap resync, reconnect
   * re-subscribe, revoked teardown).
   *
   * sdk.objects.liveQuery({ socket, object, filter, fields, recordTypeId, onEvent, onStateChange })
   * sdk.objects.liveQuery({ socket, uoql, onEvent, onStateChange }) // uoql is mutually
   *   exclusive with object/filter/fields/recordTypeId
   * -> Promise<{ subscriptionId, mode, unsubscribe() }>
   */
  liveQuery(args) {
    return liveQuery(this.sdk, args);
  }

  /**
   * Retrieve an object by ID
   *
   * Preferred usage (new signature):
   * sdk.objects.byId({ id: 'someId', expandDetails: true, isAiPrompt: true })
   *
   * Legacy usage (deprecated, but supported):
   * sdk.objects.byId('someId', { 'select[]': ['field1', 'field2'] })
   *
   * @param {string|object} args - Either ID string or options object
   * @param {boolean} [args.isAiPrompt] - Clean data for AI prompt usage (removes system fields)
   * @returns {Promise} Object data
   */
  async byId(arg1, arg2) {
    let id;
    let query = {};
    if (typeof arg1 === 'string') {
      id = arg1;
      if (typeof arg2 === 'object') {
        query = { ...arg2 };
      }
    } else if (typeof arg1 === 'object') {
      id = arg1.id;
      if (arg1.query) {
        query = { ...arg1.query };
      } else {
        query = { ...arg1 };
        if (query.id) {
          delete query.id;
        }
      }
    }

    if (Array.isArray(query.select)) {
      query.select = query.select.join(',');
    }

    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const params = { query };

    const result = await this.sdk._fetch(`/object/${id}`, 'GET', params);
    // console.log(`sdk.objects.byId :: params :: `, params, result);
    return result;
  }

  /**
   * Query objects with filters
   *
   * Preferred usage (new signature):
   * sdk.objects.query({
   *   object: 'users',
   *   select: ['id', 'name'],
   *   where: { status: 'active' },
   *   limit: 50,
   *   expandDetails: true
   * })
   *
   * Legacy usage (deprecated, but supported):
   * sdk.objects.query('users', { 'select[]': ['id', 'name'], status: 'active' })
   *
   * @param {object} args - Query parameters
   * @returns {Promise} Query results
   */
  async query(...args) {
    // New signature: query({ object, select, where, ... })
    if (args.length === 1 && typeof args[0] === 'object' && args[0].object) {
      const {
        object,
        select = null,
        where = {},
        limit = 100,
        nextId = null,
        previousId = null,
        orderByDirection = 'DESC',
        expandDetails = false,
        meta = {},
      } = args[0];

      this.sdk.validateParams(
        {
          object,
          select,
          where,
          limit,
          nextId,
          previousId,
          orderByDirection,
          expandDetails,
          meta,
        },
        {
          object: { type: 'string', required: true },
          select: { type: 'object', required: false }, // array or string
          where: { type: 'object', required: false },
          limit: { type: 'number', required: false },
          nextId: { type: 'string', required: false },
          previousId: { type: 'string', required: false },
          orderByDirection: { type: 'string', required: false },
          expandDetails: { type: 'boolean', required: false },
          meta: { type: 'object', required: false },
        },
      );

      const query = { ...where };
      if (select !== null) query.select = select;
      if (limit !== 100) query.limit = limit;
      if (nextId !== null) query.nextId = nextId;
      if (previousId !== null) query.previousId = previousId;
      if (orderByDirection !== 'DESC')
        query.orderByDirection = orderByDirection;
      if (expandDetails) query.expandDetails = expandDetails;

      const params = { query };
      return await this.sdk._fetch(`/object/query/${object}`, 'GET', params);
    }

    // Old signature: query(objectName, queryParams)
    if (args.length === 2 && typeof args[0] === 'string') {
      const [objectName, queryParams = {}] = args;

      this.sdk.validateParams(
        { object: objectName },
        {
          object: { type: 'string', required: true },
        },
      );

      const params = { query: queryParams };
      return await this.sdk._fetch(
        `/object/query/${objectName}`,
        'GET',
        params,
      );
    }

    throw new Error('Invalid arguments for query method');
  }

  /**
   * Query objects using UOQL v2 (SQL-like syntax).
   *
   * Usage:
   * sdk.objects.queryV2({ query: "SELECT firstName, lastName FROM people WHERE companyId = '123' LIMIT 10" })
   *
   * @param {object} args
   * @param {string} args.query - UOQL query string
   * @param {boolean} [args.expandDetails=false] - Whether to expand related details
   * @returns {Promise} Query results with pagination
   */
  async queryV2({ query, expandDetails = false, isPublic = false }) {
    this.sdk.validateParams(
      { query },
      {
        query: { type: 'string', required: true },
      },
    );

    const body = { query, expandDetails };
    if (isPublic) body.isPublic = isPublic;
    const params = { body };
    return await this.sdk._fetch('/object/query/v2', 'POST', params);
  }

  /**
   * Update an object record by ID
   *
   * Preferred usage (new signature):
   * sdk.objects.updateById({ object: 'users', id: 'userId', update: { name: 'Jane' }, skipTriggers: true })
   *
   * Legacy usage (deprecated, but supported):
   * sdk.objects.updateById('users', 'userId', { name: 'Jane' })
   *
   * @param {object} args - Update parameters
   * @param {boolean} [args.skipTriggers=false] - Skip trigger execution for this write
   * @returns {Promise} Updated object data
   */
  async updateById(...args) {
    // New signature: updateById({ object, id, update, skipTriggers })
    if (args.length === 1 && typeof args[0] === 'object' && args[0].object) {
      const { object, id, update, skipTriggers = false } = args[0];

      this.sdk.validateParams(
        { object, id, update, skipTriggers },
        {
          object: { type: 'string', required: true },
          id: { type: 'string', required: true },
          update: { type: 'object', required: true },
          skipTriggers: { type: 'boolean', required: false },
        },
      );

      const params = {
        body: {
          where: { id },
          update,
        },
      };
      if (skipTriggers) params.query = { skipTriggers: true };

      return await this.sdk._fetch(`/object/${object}`, 'PUT', params);
    }

    // Old signature: updateById(object, id, update)
    if (args.length === 3) {
      const [object, id, update] = args;

      this.sdk.validateParams(
        { object, id, update },
        {
          object: { type: 'string', required: true },
          id: { type: 'string', required: true },
          update: { type: 'object', required: true },
        },
      );

      const params = {
        body: {
          where: { id },
          update,
        },
      };

      return await this.sdk._fetch(`/object/${object}`, 'PUT', params);
    }

    throw new Error('Invalid arguments for updateById method');
  }

  /**
   * Update records matching a where clause.
   *
   * @param {object} args
   * @param {string} args.object
   * @param {object} args.where
   * @param {object} args.update
   * @param {boolean} [args.skipTriggers=false] - Do not run triggers for this write
   * @returns {Promise} Update result
   *
   * @example
   * await sdk.objects.update({
   *   object: 'people',
   *   where: { id: '013…' },
   *   update: { leadScore: 200 },
   *   skipTriggers: true,
   * });
   */
  async update({ object, where, update, skipTriggers = false }) {
    this.sdk.validateParams(
      { object, where, update, skipTriggers },
      {
        object: { type: 'string', required: true },
        where: { type: 'object', required: true },
        update: { type: 'object', required: true },
        skipTriggers: { type: 'boolean', required: false },
      },
    );

    const params = {
      body: {
        where,
        update,
      },
    };
    if (skipTriggers) params.query = { skipTriggers: true };

    const result = await this.sdk._fetch(`/object/${object}`, 'PUT', params);
    return result;
  }

  /**
   * Create a new object record
   *
   * Preferred usage (new signature):
   * sdk.objects.create({ object: 'users', body: { name: 'John', email: 'john@example.com' }, skipTriggers: true })
   *
   * Legacy usage (deprecated, but supported):
   * sdk.objects.create('users', { name: 'John', email: 'john@example.com' })
   *
   * @param {object} args - Creation parameters
   * @param {boolean} [args.skipTriggers=false] - Skip trigger execution for this write
   * @returns {Promise} Created object data
   */
  async create(...args) {
    // New signature: create({ object, body, skipTriggers })
    if (args.length === 1 && typeof args[0] === 'object' && args[0].object) {
      const { object, body, skipTriggers = false } = args[0];

      this.sdk.validateParams(
        { object, body, skipTriggers },
        {
          object: { type: 'string', required: true },
          body: { type: 'object', required: true },
          skipTriggers: { type: 'boolean', required: false },
        },
      );

      const params = { body };
      if (skipTriggers) params.query = { skipTriggers: true };
      return await this.sdk._fetch(`/object/${object}`, 'POST', params);
    }

    // Old signature: create(object, body)
    if (args.length === 2) {
      const [object, body] = args;

      this.sdk.validateParams(
        { object, body },
        {
          object: { type: 'string', required: true },
          body: { type: 'object', required: true },
        },
      );

      const params = { body };
      return await this.sdk._fetch(`/object/${object}`, 'POST', params);
    }

    throw new Error('Invalid arguments for create method');
  }

  /**
   * Delete records matching a where clause.
   *
   * @param {object} args
   * @param {string} args.object
   * @param {object} args.where
   * @param {boolean} [args.skipTriggers=false] - Do not run triggers for this write
   * @returns {Promise} Delete result
   *
   * @example
   * await sdk.objects.delete({
   *   object: 'people',
   *   where: { id: '013…' },
   *   skipTriggers: true,
   * });
   */
  async delete({ object, where, skipTriggers = false }) {
    this.sdk.validateParams(
      { object, where, skipTriggers },
      {
        object: { type: 'string', required: true },
        where: { type: 'object', required: true },
        skipTriggers: { type: 'boolean', required: false },
      },
    );

    const params = {
      body: {
        where,
      },
    };
    if (skipTriggers) params.query = { skipTriggers: true };

    const result = await this.sdk._fetch(`/object/${object}`, 'DELETE', params);
    return result;
  }

  /**
   * Delete a record by id.
   *
   * @param {object} args
   * @param {string} args.object
   * @param {string} args.id
   * @param {boolean} [args.skipTriggers=false] - Do not run triggers for this write
   * @returns {Promise} Delete result
   *
   * @example
   * await sdk.objects.deleteById({ object: 'people', id: '013…', skipTriggers: true });
   */
  async deleteById({ object, id, skipTriggers = false }) {
    this.sdk.validateParams(
      { object, id, skipTriggers },
      {
        object: { type: 'string', required: true },
        id: { type: 'string', required: true },
        skipTriggers: { type: 'boolean', required: false },
      },
    );

    const params = {
      body: {
        where: {
          id,
        },
      },
    };
    if (skipTriggers) params.query = { skipTriggers: true };

    const result = await this.sdk._fetch(`/object/${object}`, 'DELETE', params);
    return result;
  }

  async botSchema() {
    const result = await this.sdk._fetch(
      '/object/manage/bot-schema',
      'GET',
    );
    return result;
  }

  async describe(object) {
    this.sdk.validateParams(
      { object },
      {
        object: { type: 'string', required: true },
      },
    );

    const params = {};

    const result = await this.sdk._fetch(
      `/object/describe/${object}`,
      'GET',
      params,
    );
    return result;
  }

  async list() {
    const params = {};

    const result = await this.sdk._fetch(`/object/`, 'GET', params);
    return result;
  }

  // ExpandDetails methods
  async createExpandDetail({
    objectName,
    fieldName,
    targetObject,
    lookupColumn,
    expandFields,
    keyField = null,
    isActive = true,
    isSystem = 0,
  }) {
    this.sdk.validateParams(
      {
        objectName,
        fieldName,
        targetObject,
        lookupColumn,
        expandFields,
        keyField,
        isActive,
        isSystem,
      },
      {
        objectName: { type: 'string', required: true },
        fieldName: { type: 'string', required: true },
        targetObject: { type: 'string', required: true },
        lookupColumn: { type: 'string', required: true },
        expandFields: { type: 'object', required: true }, // array
        keyField: { type: 'string', required: false },
        isActive: { type: 'boolean', required: false },
        isSystem: { type: 'number', required: false },
      },
    );

    const body = {
      objectName,
      fieldName,
      targetObject,
      lookupColumn,
      expandFields,
      keyField,
      isActive,
      isSystem,
    };
    const params = { body };

    const result = await this.sdk._fetch(
      `/object/expandDetails`,
      'POST',
      params,
    );
    return result;
  }

  async getExpandDetails({
    objectName = null,
    fieldName = null,
    targetObject = null,
    isActive = null,
    isSystem = null,
    limit = 100,
    offset = 0,
  } = {}) {
    this.sdk.validateParams(
      {
        objectName,
        fieldName,
        targetObject,
        isActive,
        isSystem,
        limit,
        offset,
      },
      {
        objectName: { type: 'string', required: false },
        fieldName: { type: 'string', required: false },
        targetObject: { type: 'string', required: false },
        isActive: { type: 'boolean', required: false },
        isSystem: { type: 'boolean', required: false },
        limit: { type: 'number', required: false },
        offset: { type: 'number', required: false },
      },
    );

    const query = {};
    if (objectName !== null) query.objectName = objectName;
    if (fieldName !== null) query.fieldName = fieldName;
    if (targetObject !== null) query.targetObject = targetObject;
    if (isActive !== null) query.isActive = isActive;
    if (isSystem !== null) query.isSystem = isSystem;
    if (limit !== 100) query.limit = limit;
    if (offset !== 0) query.offset = offset;

    const params = { query };

    const result = await this.sdk._fetch(
      `/object/expandDetails`,
      'GET',
      params,
    );
    return result;
  }

  async getExpandDetailById(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const result = await this.sdk._fetch(`/object/expandDetails/${id}`, 'GET');
    return result;
  }

  async updateExpandDetail({
    id,
    objectName = null,
    fieldName = null,
    targetObject = null,
    lookupColumn = null,
    expandFields = null,
    keyField = null,
    isActive = null,
  }) {
    this.sdk.validateParams(
      {
        id,
        objectName,
        fieldName,
        targetObject,
        lookupColumn,
        expandFields,
        keyField,
        isActive,
      },
      {
        id: { type: 'string', required: true },
        objectName: { type: 'string', required: false },
        fieldName: { type: 'string', required: false },
        targetObject: { type: 'string', required: false },
        lookupColumn: { type: 'string', required: false },
        expandFields: { type: 'object', required: false }, // array
        keyField: { type: 'string', required: false },
        isActive: { type: 'boolean', required: false },
      },
    );

    const body = {};
    if (objectName !== null) body.objectName = objectName;
    if (fieldName !== null) body.fieldName = fieldName;
    if (targetObject !== null) body.targetObject = targetObject;
    if (lookupColumn !== null) body.lookupColumn = lookupColumn;
    if (expandFields !== null) body.expandFields = expandFields;
    if (keyField !== null) body.keyField = keyField;
    if (isActive !== null) body.isActive = isActive;

    const params = { body };

    const result = await this.sdk._fetch(
      `/object/expandDetails/${id}`,
      'PUT',
      params,
    );
    return result;
  }

  async deleteExpandDetail(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const result = await this.sdk._fetch(
      `/object/expandDetails/${id}`,
      'DELETE',
    );
    return result;
  }

  // GeneratedColumns methods
  async createGeneratedColumn({
    objectName,
    columnName,
    value,
    type = 'string',
    columnType = 'varchar',
    length = '255',
    isActive = true,
    isSystem = 0,
  }) {
    this.sdk.validateParams(
      {
        objectName,
        columnName,
        value,
        type,
        columnType,
        length,
        isActive,
        isSystem,
      },
      {
        objectName: { type: 'string', required: true },
        columnName: { type: 'string', required: true },
        value: { type: 'string', required: true },
        type: { type: 'string', required: false },
        columnType: { type: 'string', required: false },
        length: { type: 'string', required: false },
        isActive: { type: 'boolean', required: false },
        isSystem: { type: 'number', required: false },
      },
    );

    const body = {
      objectName,
      columnName,
      value,
      type,
      columnType,
      length,
      isActive,
      isSystem,
    };
    const params = { body };

    const result = await this.sdk._fetch(
      `/object/generatedColumns`,
      'POST',
      params,
    );
    return result;
  }

  async getGeneratedColumns({
    objectName = null,
    columnName = null,
    isActive = null,
    isSystem = null,
    limit = 100,
    offset = 0,
  } = {}) {
    this.sdk.validateParams(
      { objectName, columnName, isActive, isSystem, limit, offset },
      {
        objectName: { type: 'string', required: false },
        columnName: { type: 'string', required: false },
        isActive: { type: 'boolean', required: false },
        isSystem: { type: 'boolean', required: false },
        limit: { type: 'number', required: false },
        offset: { type: 'number', required: false },
      },
    );

    const query = {};
    if (objectName !== null) query.objectName = objectName;
    if (columnName !== null) query.columnName = columnName;
    if (isActive !== null) query.isActive = isActive;
    if (isSystem !== null) query.isSystem = isSystem;
    if (limit !== 100) query.limit = limit;
    if (offset !== 0) query.offset = offset;

    const params = { query };

    const result = await this.sdk._fetch(
      `/object/generatedColumns`,
      'GET',
      params,
    );
    return result;
  }

  async getGeneratedColumnById(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const result = await this.sdk._fetch(
      `/object/generatedColumns/${id}`,
      'GET',
    );
    return result;
  }

  async updateGeneratedColumn({
    id,
    objectName = null,
    columnName = null,
    value = null,
    type = null,
    columnType = null,
    length = null,
    isActive = null,
  }) {
    this.sdk.validateParams(
      { id, objectName, columnName, value, type, columnType, length, isActive },
      {
        id: { type: 'string', required: true },
        objectName: { type: 'string', required: false },
        columnName: { type: 'string', required: false },
        value: { type: 'string', required: false },
        type: { type: 'string', required: false },
        columnType: { type: 'string', required: false },
        length: { type: 'string', required: false },
        isActive: { type: 'boolean', required: false },
      },
    );

    const body = {};
    if (objectName !== null) body.objectName = objectName;
    if (columnName !== null) body.columnName = columnName;
    if (value !== null) body.value = value;
    if (type !== null) body.type = type;
    if (columnType !== null) body.columnType = columnType;
    if (length !== null) body.length = length;
    if (isActive !== null) body.isActive = isActive;

    const params = { body };

    const result = await this.sdk._fetch(
      `/object/generatedColumns/${id}`,
      'PUT',
      params,
    );
    return result;
  }

  async deleteGeneratedColumn(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const result = await this.sdk._fetch(
      `/object/generatedColumns/${id}`,
      'DELETE',
    );
    return result;
  }

  // Object Management methods
  async createObject({ name }) {
    this.sdk.validateParams(
      { name },
      {
        name: { type: 'string', required: true },
      },
    );

    const body = { name };
    const params = { body };

    const result = await this.sdk._fetch(`/object/manage`, 'POST', params);
    return result;
  }

  async createColumn({
    objectName,
    columns = null,
    name = null,
    type = null,
    length = null,
    defaultValue = null,
    isEncrypted = false,
    isRequired = false,
  }) {
    this.sdk.validateParams(
      {
        objectName,
        columns,
        name,
        type,
        length,
        defaultValue,
        isEncrypted,
        isRequired,
      },
      {
        objectName: { type: 'string', required: true },
        columns: { type: 'object', required: false }, // array
        name: { type: 'string', required: false },
        type: { type: 'string', required: false },
        length: { type: 'number', required: false },
        defaultValue: { type: 'string', required: false },
        isEncrypted: { type: 'boolean', required: false },
        isRequired: { type: 'boolean', required: false },
      },
    );

    const body = {};
    if (columns !== null) {
      body.columns = columns;
    } else if (name && type) {
      body.name = name;
      body.type = type;
      if (length !== null) body.length = length;
      if (defaultValue !== null) body.defaultValue = defaultValue;
      body.isEncrypted = isEncrypted;
      body.isRequired = isRequired;
    } else {
      throw new Error(
        'Either columns array or individual column properties (name, type) must be provided',
      );
    }

    const params = { body };

    const result = await this.sdk._fetch(
      `/object/manage/${objectName}`,
      'POST',
      params,
    );
    return result;
  }

  async modifyObject({
    objectName,
    isBotAccessible = null,
    isPublicBot = null,
    description = null,
  }) {
    this.sdk.validateParams(
      { objectName, isBotAccessible, isPublicBot, description },
      {
        objectName: { type: 'string', required: true },
        isBotAccessible: { type: 'boolean', required: false },
        isPublicBot: { type: 'boolean', required: false },
        description: { type: 'string', required: false },
      },
    );

    const body = {};
    if (isBotAccessible !== null) body.isBotAccessible = isBotAccessible;
    if (isPublicBot !== null) body.isPublicBot = isPublicBot;
    if (description !== null) body.description = description;

    const params = { body };

    const result = await this.sdk._fetch(
      `/object/manage/${objectName}`,
      'PUT',
      params,
    );
    return result;
  }

  async modifyColumn({
    objectName,
    columnName,
    columnType = null,
    length = null,
    defaultValue = null,
    isEncrypted = null,
    isRequired = null,
    isBotAccessible = null,
    isPublicBot = null,
    isStandard = null,
    description = null,
  }) {
    this.sdk.validateParams(
      {
        objectName,
        columnName,
        columnType,
        length,
        defaultValue,
        isEncrypted,
        isRequired,
        isBotAccessible,
        isPublicBot,
        isStandard,
        description,
      },
      {
        objectName: { type: 'string', required: true },
        columnName: { type: 'string', required: true },
        columnType: { type: 'string', required: false },
        length: { type: 'number', required: false },
        defaultValue: { type: 'string', required: false },
        isEncrypted: { type: 'boolean', required: false },
        isRequired: { type: 'boolean', required: false },
        isBotAccessible: { type: 'boolean', required: false },
        isPublicBot: { type: 'boolean', required: false },
        isStandard: { type: 'boolean', required: false },
        description: { type: 'string', required: false },
      },
    );

    const body = {};
    if (columnType !== null) body.type = columnType;
    if (length !== null) body.length = length;
    if (defaultValue !== null) body.defaultValue = defaultValue;
    if (isEncrypted !== null) body.isEncrypted = isEncrypted;
    if (isRequired !== null) body.isRequired = isRequired;
    if (isBotAccessible !== null) body.isBotAccessible = isBotAccessible;
    if (isPublicBot !== null) body.isPublicBot = isPublicBot;
    if (isStandard !== null) body.isStandard = isStandard;
    if (description !== null) body.description = description;

    const params = { body };

    const result = await this.sdk._fetch(
      `/object/manage/${objectName}/${columnName}`,
      'PUT',
      params,
    );
    return result;
  }

  async deleteColumn({ objectName, columnName }) {
    this.sdk.validateParams(
      { objectName, columnName },
      {
        objectName: { type: 'string', required: true },
        columnName: { type: 'string', required: true },
      },
    );

    const result = await this.sdk._fetch(
      `/object/manage/${objectName}/${columnName}`,
      'DELETE',
    );
    return result;
  }

  /**
   * List Google Ads customer IDs for an OAuth connection.
   *
   * @param {object} args
   * @param {string} args.connectionId
   * @returns {Promise<{results: object[], warning?: string|null}>}
   */
  async listGoogleAdAccounts({ connectionId }) {
    this.sdk.validateParams(
      { connectionId },
      { connectionId: { type: 'string', required: true } },
    );
    return this.sdk._fetch('/object/ad-catalog/google/accounts', 'GET', {
      query: { connectionId },
    });
  }

  /**
   * List Google Ads campaigns for a customer.
   *
   * @param {object} args
   * @param {string} args.connectionId
   * @param {string} args.customerId
   * @param {string} [args.loginCustomerId]
   * @returns {Promise<{results: object[]}>}
   */
  async listGoogleAdCampaigns({ connectionId, customerId, loginCustomerId }) {
    this.sdk.validateParams(
      { connectionId, customerId },
      {
        connectionId: { type: 'string', required: true },
        customerId: { type: 'string', required: true },
      },
    );
    const query = { connectionId, customerId };
    if (loginCustomerId) query.loginCustomerId = loginCustomerId;
    return this.sdk._fetch('/object/ad-catalog/google/campaigns', 'GET', {
      query,
    });
  }

  /**
   * List Meta ad accounts for an OAuth connection.
   *
   * @param {object} args
   * @param {string} args.connectionId
   * @returns {Promise<{results: object[]}>}
   */
  async listMetaAdAccounts({ connectionId }) {
    this.sdk.validateParams(
      { connectionId },
      { connectionId: { type: 'string', required: true } },
    );
    return this.sdk._fetch('/object/ad-catalog/meta/accounts', 'GET', {
      query: { connectionId },
    });
  }

  /**
   * List Meta campaigns for an ad account.
   *
   * @param {object} args
   * @param {string} args.connectionId
   * @param {string} args.adAccountId
   * @returns {Promise<{results: object[]}>}
   */
  async listMetaAdCampaigns({ connectionId, adAccountId }) {
    this.sdk.validateParams(
      { connectionId, adAccountId },
      {
        connectionId: { type: 'string', required: true },
        adAccountId: { type: 'string', required: true },
      },
    );
    return this.sdk._fetch('/object/ad-catalog/meta/campaigns', 'GET', {
      query: { connectionId, adAccountId },
    });
  }
}
