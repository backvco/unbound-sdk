import { internalRequest } from '../base.js';
export class RecordTypesService {
  constructor(sdk) {
    this.sdk = sdk;
    this.user = new UserRecordTypeDefaultsService(sdk);
  }

  /**
   * Create a new recordType with permission rules
   * @param {Object} recordType - RecordType configuration
   * @param {string} recordType.name - RecordType name (required)
   * @param {string} recordType.description - RecordType description (required)
   * @param {Array|null} recordType.create - User IDs who can create (null = universal access)
   * @param {Array|null} recordType.read - User IDs who can read (null = universal access)
   * @param {Array|null} recordType.update - User IDs who can update (null = universal access)
   * @param {Array|null} recordType.delete - User IDs who can delete (null = universal access)
   * @returns {Promise<Object>} Created recordType information
   * @example
   * // Create a recordType with mixed permissions
   * await sdk.recordTypes.create({
   *   name: 'Sales - Private',
   *   description: 'Sensitive sales data',
   *   create: ['user1', 'user2'],  // Only specific users can create
   *   read: null,                  // Everyone can read
   *   update: ['admin1'],          // Only admin can update
   *   delete: ['admin1']           // Only admin can delete
   * });
   */
  async create({
    name,
    description,
    create,
    update,
    read,
    delete: deleteUsers,
  }) {
    this.sdk.validateParams(
      { name, description },
      {
        name: { type: 'string', required: true },
        description: { type: 'string', required: true },
        create: { type: 'array', required: false },
        update: { type: 'array', required: false },
        read: { type: 'array', required: false },
        delete: { type: 'array', required: false },
      },
    );

    const recordTypeData = { name, description };
    if (create) recordTypeData.create = create;
    if (update) recordTypeData.update = update;
    if (read) recordTypeData.read = read;
    if (deleteUsers) recordTypeData.delete = deleteUsers;

    const params = {
      body: recordTypeData,
    };

    const result = await internalRequest(this.sdk, '/recordTypes/', 'POST', params);
    return result;
  }

  /**
   * Update an existing recordType using add/remove pattern for permissions
   * @param {string} id - RecordType ID to update
   * @param {Object} updates - Update configuration
   * @param {string} updates.name - New name (optional)
   * @param {string} updates.description - New description (optional)
   * @param {Object} updates.add - Users to ADD to permissions
   * @param {Array} updates.add.create - Add these users to create permission
   * @param {Array} updates.add.read - Add these users to read permission
   * @param {Array} updates.add.update - Add these users to update permission
   * @param {Array} updates.add.delete - Add these users to delete permission
   * @param {Object} updates.remove - Users to REMOVE from permissions
   * @param {Array} updates.remove.create - Remove these users from create permission
   * @param {Array} updates.remove.read - Remove these users from read permission
   * @param {Array} updates.remove.update - Remove these users from update permission
   * @param {Array} updates.remove.delete - Remove these users from delete permission
   * @returns {Promise<Object>} Updated recordType information
   * @example
   * // Add new users to create permission, remove a user from update
   * await sdk.recordTypes.update('recordTypeId', {
   *   add: {
   *     create: ['newUser1', 'newUser2'],
   *     delete: ['manager1']
   *   },
   *   remove: {
   *     update: ['oldUser1']
   *   }
   * });
   */
  async update(id, { name, description, remove, add }) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
        name: { type: 'string', required: false },
        description: { type: 'string', required: false },
        remove: { type: 'object', required: false },
        add: { type: 'object', required: false },
      },
    );

    const updateData = {};
    if (name) updateData.name = name;
    if (description) updateData.description = description;
    if (remove) updateData.remove = remove;
    if (add) updateData.add = add;

    const params = {
      body: updateData,
    };

    const result = await internalRequest(this.sdk, `/recordTypes/${id}`, 'PUT', params);
    return result;
  }

  /**
   * Delete a recordType
   * @param {string} id - RecordType ID to delete
   * @returns {Promise<Object>} Deletion confirmation
   * @example
   * await sdk.recordTypes.delete('recordTypeId');
   */
  async delete(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, `/recordTypes/${id}`, 'DELETE');
    return result;
  }

  /**
   * Get detailed information about a specific recordType
   * @param {string} id - RecordType ID
   * @param {Object} options - Additional options
   * @param {boolean} options.includeUsers - Include user default assignments (default: false)
   * @returns {Promise<Object>} Detailed recordType with permissions and current user access
   * @example
   * // Get recordType with user assignments
   * const recordType = await sdk.recordTypes.get('recordTypeId', {
   *   includeUsers: true
   * });
   *
   * // Check current user's permissions
   * console.log(recordType.currentUserAccess.canCreate); // true/false
   * console.log(recordType.permissions.read.type); // 'universal' or 'restricted'
   */
  async get(id, options = {}) {
    const { includeUsers } = options;

    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    // Validate optional parameters
    if ('includeUsers' in options) {
      this.sdk.validateParams(
        { includeUsers },
        {
          includeUsers: { type: 'boolean' },
        },
      );
    }

    const params = {
      query: options,
    };

    const result = await internalRequest(this.sdk, `/recordTypes/${id}`, 'GET', params);
    return result;
  }

  /**
   * List recordTypes with optional filtering and pagination
   * @param {Object} options - Filter and pagination options
   * @param {string} options.search - Search in name or description
   * @param {boolean} options.isAccountDefault - Filter by account default status
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 50, max: 100)
   * @param {string} options.sortBy - Sort field: 'name', 'createdAt', 'updatedAt' (default: 'name')
   * @param {string} options.sortOrder - Sort order: 'asc', 'desc' (default: 'asc')
   * @returns {Promise<Object>} Object containing recordTypes, pagination, and summary
   * @example
   * // List with search and pagination
   * const result = await sdk.recordTypes.list({
   *   search: 'sales',
   *   isAccountDefault: false,
   *   page: 1,
   *   limit: 25,
   *   sortBy: 'name',
   *   sortOrder: 'asc'
   * });
   *
   * // Access results
   * console.log(result.recordTypes); // Array of recordTypes
   * console.log(result.pagination);  // Pagination info
   * console.log(result.summary);     // Statistics
   */
  async list(options = {}) {
    const { search, isAccountDefault, page, limit, sortBy, sortOrder } =
      options;

    // Validate optional parameters
    const validationSchema = {};
    if ('search' in options) validationSchema.search = { type: 'string' };
    if ('isAccountDefault' in options)
      validationSchema.isAccountDefault = { type: 'boolean' };
    if ('page' in options) validationSchema.page = { type: 'number' };
    if ('limit' in options) validationSchema.limit = { type: 'number' };
    if ('sortBy' in options) validationSchema.sortBy = { type: 'string' };
    if ('sortOrder' in options) validationSchema.sortOrder = { type: 'string' };

    if (Object.keys(validationSchema).length > 0) {
      this.sdk.validateParams(options, validationSchema);
    }

    const params = {
      query: options,
    };

    const result = await internalRequest(this.sdk, '/recordTypes/', 'GET', params);
    return result;
  }
}

export class UserRecordTypeDefaultsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async create({ recordTypeId, object, userId }) {
    this.sdk.validateParams(
      { recordTypeId, object },
      {
        recordTypeId: { type: 'string', required: true },
        object: { type: 'string', required: true },
        userId: { type: 'string', required: false },
      },
    );

    const defaultData = { recordTypeId, object };
    if (userId) defaultData.userId = userId;

    const params = {
      body: defaultData,
    };

    const result = await internalRequest(this.sdk, '/recordTypes/user/', 'POST', params);
    return result;
  }

  async update({ recordTypeId, object, userId }) {
    this.sdk.validateParams(
      { recordTypeId, object },
      {
        recordTypeId: { type: 'string', required: true },
        object: { type: 'string', required: true },
        userId: { type: 'string', required: false },
      },
    );

    const updateData = { recordTypeId, object };
    if (userId) updateData.userId = userId;

    const params = {
      body: updateData,
    };

    const result = await internalRequest(this.sdk, '/recordTypes/user/', 'PUT', params);
    return result;
  }

  async delete({ object, userId }) {
    this.sdk.validateParams(
      { object },
      {
        object: { type: 'string', required: true },
        userId: { type: 'string', required: false },
      },
    );

    const deleteData = { object };
    if (userId) deleteData.userId = userId;

    const params = {
      body: deleteData,
    };

    const result = await internalRequest(this.sdk, 
      '/recordTypes/user/',
      'DELETE',
      params,
    );
    return result;
  }

  async get({ object, userId }) {
    this.sdk.validateParams(
      { object },
      {
        object: { type: 'string', required: true },
        userId: { type: 'string', required: false },
      },
    );

    const params = {
      query: { object, userId },
    };

    const result = await internalRequest(this.sdk, '/recordTypes/user/', 'GET', params);
    return result;
  }

  /**
   * Get all recordType defaults for a specific user
   * Perfect for User Detail Page to show all user's recordType preferences
   * @param {string} userId - User ID (optional - defaults to current user)
   * @param {Object} options - Additional options
   * @param {boolean} options.includeRecordTypeDetails - Include recordType name/description
   * @returns {Promise<Object>} User's recordType defaults organized by object type
   */
  async getDefaults(userId, options = {}) {
    const { includeRecordTypeDetails } = options;

    // Validate optional parameters
    if (userId) {
      this.sdk.validateParams(
        { userId },
        {
          userId: { type: 'string' },
        },
      );
    }

    if ('includeRecordTypeDetails' in options) {
      this.sdk.validateParams(
        { includeRecordTypeDetails },
        {
          includeRecordTypeDetails: { type: 'boolean' },
        },
      );
    }

    const params = {
      query: options,
    };

    const url = userId
      ? `/recordTypes/user/defaults/${userId}`
      : '/recordTypes/user/defaults';

    const result = await internalRequest(this.sdk, url, 'GET', params);
    return result;
  }

  /**
   * List users who have a specific recordType as their default
   * Perfect for RecordType Detail Page to show who uses this recordType
   * @param {string} recordTypeId - RecordType ID
   * @param {Object} options - Filter and pagination options
   * @param {string} options.object - Filter by specific object type
   * @param {boolean} options.includeUserDetails - Include user name/email
   * @param {number} options.page - Page number (default: 1)
   * @param {number} options.limit - Items per page (default: 50, max: 100)
   * @returns {Promise<Object>} Users organized by object type with statistics
   */
  async listUsersWithDefault(recordTypeId, options = {}) {
    const { object, includeUserDetails, page, limit } = options;

    this.sdk.validateParams(
      { recordTypeId },
      {
        recordTypeId: { type: 'string', required: true },
      },
    );

    // Validate optional parameters
    const validationSchema = {};
    if ('object' in options) validationSchema.object = { type: 'string' };
    if ('includeUserDetails' in options)
      validationSchema.includeUserDetails = { type: 'boolean' };
    if ('page' in options) validationSchema.page = { type: 'number' };
    if ('limit' in options) validationSchema.limit = { type: 'number' };

    if (Object.keys(validationSchema).length > 0) {
      this.sdk.validateParams(options, validationSchema);
    }

    const params = {
      query: options,
    };

    const result = await internalRequest(this.sdk, 
      `/recordTypes/${recordTypeId}/users`,
      'GET',
      params,
    );
    return result;
  }
}
