import { internalRequest } from '../../base.js';
export class WorkerService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Create a worker in the task router system
   * Creates a new worker for handling tasks such as phone calls, chat, or email.
   * If userId is not provided, it will use the authenticated user's ID from the session.
   *
   * @param {Object} [options] - Optional parameters
   * @param {string} [options.userId] - The user ID to create a worker for. If not provided, uses the authenticated user's ID
   * @returns {Promise<Object>} Object containing the created worker ID
   * @returns {string} result.workerId - The unique identifier for the created worker
   *
   * @example
   * // Create worker for authenticated user
   * const result = await sdk.taskRouter.worker.create();
   * console.log(result.workerId); // "0860002026012400000006665842155429980"
   *
   * @example
   * // Create worker for specific user
   * const result = await sdk.taskRouter.worker.create({ userId: '123456' });
   * console.log(result.workerId); // "0860002026012400000006665842155429980"
   */
  async create(options = {}) {
    const { userId } = options;

    this.sdk.validateParams(
      { userId },
      {
        userId: { type: 'string', required: false },
      },
    );

    const params = {
      body: {},
    };

    if (userId) {
      params.body.userId = userId;
    }

    const result = await internalRequest(this.sdk, '/taskRouter/worker', 'POST', params);
    return result;
  }

  /**
   * Get worker information from the task router system
   * Retrieves the worker details for a specific user.
   * If userId is not provided, it will use the authenticated user's ID from the session.
   *
   * @param {Object} [options] - Optional parameters
   * @param {string} [options.userId] - The user ID to get worker information for. If not provided, uses the authenticated user's ID
   * @returns {Promise<Object>} Object containing the worker information
   *
   * @example
   * // Get worker for authenticated user
   * const worker = await sdk.taskRouter.worker.get();
   * console.log(worker);
   *
   * @example
   * // Get worker for specific user
   * const worker = await sdk.taskRouter.worker.get({ userId: '123456' });
   * console.log(worker);
   */
  async get(options = {}) {
    const { userId } = options;

    this.sdk.validateParams(
      { userId },
      {
        userId: { type: 'string', required: false },
      },
    );

    const params = {};

    if (userId) {
      params.query = { userId };
    }

    const result = await internalRequest(this.sdk, '/taskRouter/worker', 'GET', params);
    return result;
  }

  /**
   * Set worker status to available in the task router system
   * Makes a worker available to receive tasks such as phone calls, chat, or email.
   * You can specify either workerId or userId. If neither is provided, it will use the authenticated user's ID.
   *
   * @param {Object} [options] - Optional parameters
   * @param {string} [options.workerId] - The worker ID to set as available
   * @param {string} [options.userId] - The user ID to set as available. If not provided, uses the authenticated user's ID
   * @returns {Promise<Object>} Object containing the worker ID
   * @returns {string} result.workerId - The unique identifier for the worker
   *
   * @example
   * // Set authenticated user's worker to available
   * const result = await sdk.taskRouter.worker.setAvailable();
   * console.log(result.workerId);
   *
   * @example
   * // Set specific worker to available by workerId
   * const result = await sdk.taskRouter.worker.setAvailable({ workerId: '0860002026012400000006665842155429980' });
   *
   * @example
   * // Set specific user's worker to available by userId
   * const result = await sdk.taskRouter.worker.setAvailable({ userId: '123456' });
   */
  async setAvailable(options = {}) {
    const { workerId, userId } = options;

    this.sdk.validateParams(
      { workerId, userId },
      {
        workerId: { type: 'string', required: false },
        userId: { type: 'string', required: false },
      },
    );

    const params = {
      body: {},
    };

    if (workerId) {
      params.body.workerId = workerId;
    }

    if (userId) {
      params.body.userId = userId;
    }

    const result = await internalRequest(this.sdk, 
      '/taskRouter/worker/avaliable',
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Set worker status to offline in the task router system
   * Makes a worker offline and unavailable to receive tasks.
   * You can specify either workerId or userId. If neither is provided, it will use the authenticated user's ID.
   *
   * @param {Object} [options] - Optional parameters
   * @param {string} [options.workerId] - The worker ID to set as offline
   * @param {string} [options.userId] - The user ID to set as offline. If not provided, uses the authenticated user's ID
   * @returns {Promise<Object>} Object containing the worker ID
   * @returns {string} result.workerId - The unique identifier for the worker
   *
   * @example
   * // Set authenticated user's worker to offline
   * const result = await sdk.taskRouter.worker.setOffline();
   * console.log(result.workerId);
   *
   * @example
   * // Set specific worker to offline by workerId
   * const result = await sdk.taskRouter.worker.setOffline({ workerId: '0860002026012400000006665842155429980' });
   *
   * @example
   * // Set specific user's worker to offline by userId
   * const result = await sdk.taskRouter.worker.setOffline({ userId: '123456' });
   */
  async setOffline(options = {}) {
    const { workerId, userId } = options;

    this.sdk.validateParams(
      { workerId, userId },
      {
        workerId: { type: 'string', required: false },
        userId: { type: 'string', required: false },
      },
    );

    const params = {
      body: {},
    };

    if (workerId) {
      params.body.workerId = workerId;
    }

    if (userId) {
      params.body.userId = userId;
    }

    const result = await internalRequest(this.sdk, 
      '/taskRouter/worker/offline',
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Automatically login all auto-login queues for a worker
   * When a worker goes available, this logs them into all queues marked with autoLogin = true.
   * If userId is not provided, it will use the authenticated user's ID from the session.
   *
   * @param {Object} [options] - Optional parameters
   * @param {string} [options.userId] - The user ID to auto-login queues for. If not provided, uses the authenticated user's ID
   * @returns {Promise<Object>} Object containing the userId that was processed
   * @returns {string} result.userId - The user ID that had auto-login queues processed
   *
   * @example
   * // Auto-login queues for authenticated user
   * const result = await sdk.taskRouter.worker.queueAutoLogin();
   * console.log(result.userId);
   *
   * @example
   * // Auto-login queues for specific user
   * const result = await sdk.taskRouter.worker.queueAutoLogin({ userId: '123456' });
   * console.log(result.userId);
   */
  async queueAutoLogin(options = {}) {
    const { userId } = options;

    this.sdk.validateParams(
      { userId },
      {
        userId: { type: 'string', required: false },
      },
    );

    const params = {
      body: {},
    };

    if (userId) {
      params.body.userId = userId;
    }

    const result = await internalRequest(this.sdk, 
      '/taskRouter/worker/queueAutoLogin',
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Logout from all queues for a worker
   * Logs the worker out of all queues they are currently logged into.
   * If userId is not provided, it will use the authenticated user's ID from the session.
   *
   * @param {Object} [options] - Optional parameters
   * @param {string} [options.userId] - The user ID to logout from all queues. If not provided, uses the authenticated user's ID
   * @returns {Promise<Object>} Object containing the userId that was processed
   * @returns {string} result.userId - The user ID that had all queues logged out
   *
   * @example
   * // Logout from all queues for authenticated user
   * const result = await sdk.taskRouter.worker.queueLogoutAll();
   * console.log(result.userId);
   *
   * @example
   * // Logout from all queues for specific user
   * const result = await sdk.taskRouter.worker.queueLogoutAll({ userId: '123456' });
   * console.log(result.userId);
   */
  async queueLogoutAll(options = {}) {
    const { userId } = options;

    this.sdk.validateParams(
      { userId },
      {
        userId: { type: 'string', required: false },
      },
    );

    const params = {
      body: {},
    };

    if (userId) {
      params.body.userId = userId;
    }

    const result = await internalRequest(this.sdk, 
      '/taskRouter/worker/queueLogoutAll',
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Login to a specific queue
   * Logs the worker into a specific queue by queueId.
   * If userId is not provided, it will use the authenticated user's ID from the session.
   *
   * @param {Object} options - Parameters
   * @param {string} options.queueId - The queue ID to login to (required)
   * @param {string} [options.userId] - The user ID to login. If not provided, uses the authenticated user's ID
   * @returns {Promise<Object>} Object containing the userId that was processed
   * @returns {string} result.userId - The user ID that logged into the queue
   *
   * @example
   * // Login to a queue for authenticated user
   * const result = await sdk.taskRouter.worker.queueLogin({ queueId: 'queue123' });
   * console.log(result.userId);
   *
   * @example
   * // Login to a queue for specific user
   * const result = await sdk.taskRouter.worker.queueLogin({
   *   queueId: 'queue123',
   *   userId: '123456'
   * });
   * console.log(result.userId);
   */
  async queueLogin(options = {}) {
    const { queueId, userId } = options;

    this.sdk.validateParams(
      { queueId, userId },
      {
        queueId: { type: 'string', required: true },
        userId: { type: 'string', required: false },
      },
    );

    const params = {
      body: {
        queueId,
      },
    };

    if (userId) {
      params.body.userId = userId;
    }

    const result = await internalRequest(this.sdk, 
      '/taskRouter/worker/queueLogin',
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Logout from a specific queue
   * Logs the worker out of a specific queue by queueId.
   * If userId is not provided, it will use the authenticated user's ID from the session.
   *
   * @param {Object} options - Parameters
   * @param {string} options.queueId - The queue ID to logout from (required)
   * @param {string} [options.userId] - The user ID to logout. If not provided, uses the authenticated user's ID
   * @returns {Promise<Object>} Object containing the userId that was processed
   * @returns {string} result.userId - The user ID that logged out of the queue
   *
   * @example
   * // Logout from a queue for authenticated user
   * const result = await sdk.taskRouter.worker.queueLogout({ queueId: 'queue123' });
   * console.log(result.userId);
   *
   * @example
   * // Logout from a queue for specific user
   * const result = await sdk.taskRouter.worker.queueLogout({
   *   queueId: 'queue123',
   *   userId: '123456'
   * });
   * console.log(result.userId);
   */
  async queueLogout(options = {}) {
    const { queueId, userId } = options;

    this.sdk.validateParams(
      { queueId, userId },
      {
        queueId: { type: 'string', required: true },
        userId: { type: 'string', required: false },
      },
    );

    const params = {
      body: {
        queueId,
      },
    };

    if (userId) {
      params.body.userId = userId;
    }

    const result = await internalRequest(this.sdk,
      '/taskRouter/worker/queueLogout',
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Search for workers within a queue's scope
   * Finds workers a caller can act on (transfer/invite/DM) for a given queue, with optional
   * name/email/extension text search and skill-match flagging.
   *
   * @param {Object} options - Parameters
   * @param {string} options.queueId - The queue ID to scope the search to (required)
   * @param {string} [options.q] - Free-text filter matching name, email, or extension
   * @param {string[]} [options.skills] - Skill IDs to flag matches for (joined as a comma-separated list)
   * @param {number} [options.limit] - Max rows to return (default 50, max 200)
   * @returns {Promise<Object>} Object containing the matching worker rows
   * @returns {Array<Object>} result.rows - Worker rows with status/capacity/skills info
   * @returns {number} result.total - Total matching rows
   *
   * @example
   * const { rows, total } = await sdk.taskRouter.worker.search({ queueId: 'queue123', q: 'sam' });
   * console.log(rows.length, total);
   */
  async search(options = {}) {
    const { queueId, q, skills, limit } = options;

    this.sdk.validateParams(
      { queueId, q, skills, limit },
      {
        queueId: { type: 'string', required: true },
        q: { type: 'string', required: false },
        skills: { type: 'array', required: false },
        limit: { type: 'number', required: false },
      },
    );

    const query = { queueId };

    if (q) {
      query.q = q;
    }

    if (skills && skills.length) {
      query.skills = skills.join(',');
    }

    if (limit) {
      query.limit = limit;
    }

    const result = await internalRequest(this.sdk, '/taskRouter/workers/search', 'GET', { query });
    return result;
  }
}
