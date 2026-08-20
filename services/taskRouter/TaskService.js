import { internalRequest } from '../../base.js';
export class TaskService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Create a new task in the task router system
   * Creates a task for routing to available workers based on skills and queue assignment.
   * Tasks can be phone calls, chats, emails, or other custom types.
   *
   * @param {Object} options - Parameters
   * @param {string} options.type - The type of task: 'chat', 'phoneCall', 'email', or 'other' (required)
   * @param {string} options.queueId - The queue ID to route the task to (required)
   * @param {string|string[]} [options.requiredSkills] - Required skill IDs that workers must have (single ID or array)
   * @param {string|string[]} [options.optionalSkills] - Optional skill IDs that are preferred but not required (single ID or array)
   * @param {string|string[]} [options.skills] - Alias for requiredSkills (single ID or array)
   * @param {number} [options.priority=0] - Task priority (higher values = higher priority)
   * @param {string} [options.subject] - Subject or title for the task (defaults to "New {type}" if not provided)
   * @param {string} [options.cdrId] - Call detail record ID to associate with this task (for voice tasks)
   * @param {string} [options.peopleId] - Person ID associated with this task
   * @param {string} [options.companyId] - Company ID associated with this task
   * @param {boolean} [options.createEngagement=false] - Whether to automatically create an engagement session for this task
   * @param {string} [options.relatedObject] - Related object type for metadata tracking (automatically set if createEngagement is true)
   * @param {string} [options.relatedId] - Related object ID for metadata tracking (automatically set if createEngagement is true)
   * @returns {Promise<Object>} Object containing the created task information
   * @returns {string} result.id - The unique identifier for the created task
   *
   * @example
   * // Create a basic phone call task
   * const task = await sdk.taskRouter.task.create({
   *   type: 'phoneCall',
   *   queueId: 'queue123'
   * });
   * console.log(task.id); // "task789"
   *
   * @example
   * // Create a chat task with required skills
   * const task = await sdk.taskRouter.task.create({
   *   type: 'chat',
   *   queueId: 'queue123',
   *   requiredSkills: ['skill456', 'skill789'],
   *   priority: 5,
   *   subject: 'Customer support inquiry'
   * });
   *
   * @example
   * // Create a voice task with CDR and auto-engagement
   * const task = await sdk.taskRouter.task.create({
   *   type: 'phoneCall',
   *   queueId: 'queue123',
   *   cdrId: 'cdr456',
   *   peopleId: 'person789',
   *   companyId: 'company123',
   *   createEngagement: true,
   *   subject: 'Inbound sales call'
   * });
   *
   * @example
   * // Create an email task with metadata
   * const task = await sdk.taskRouter.task.create({
   *   type: 'email',
   *   queueId: 'queue123',
   *   optionalSkills: 'skill999',
   *   relatedObject: 'supportTicket',
   *   relatedId: 'ticket123'
   * });
   */
  async create(options = {}) {
    const {
      type,
      queueId,
      requiredSkills,
      optionalSkills,
      skills,
      priority,
      subject,
      peopleId,
      companyId,
      createEngagement,
      relatedObject,
      relatedId,
      cdrId,
      sipCallId,
      aiChatSessionId,
    } = options;

    this.sdk.validateParams(
      {
        type,
        queueId,
        requiredSkills,
        optionalSkills,
        skills,
        priority,
        subject,
        cdrId,
        peopleId,
        companyId,
        createEngagement,
        relatedObject,
        relatedId,
        sipCallId,
        aiChatSessionId,
      },
      {
        type: { type: 'string', required: true },
        queueId: { type: 'string', required: true },
        // requiredSkills: { type: ['string', 'array'], required: false },
        // optionalSkills: { type: ['string', 'array'], required: false },
        // skills: { type: ['string', 'array'], required: false },
        priority: { type: 'number', required: false },
        subject: { type: 'string', required: false },
        cdrId: { type: 'string', required: false },
        peopleId: { type: 'string', required: false },
        companyId: { type: 'string', required: false },
        createEngagement: { type: 'boolean', required: false },
        relatedObject: { type: 'string', required: false },
        relatedId: { type: 'string', required: false },
        sipCallId: { type: 'string', required: false },
        aiChatSessionId: { type: 'string', required: false },
      },
    );

    const params = {
      body: {
        type,
        queueId,
      },
    };

    if (requiredSkills !== undefined) {
      params.body.requiredSkills = requiredSkills;
    }

    if (optionalSkills !== undefined) {
      params.body.optionalSkills = optionalSkills;
    }

    if (skills !== undefined) {
      params.body.skills = skills;
    }

    if (priority !== undefined) {
      params.body.priority = priority;
    }

    if (subject !== undefined) {
      params.body.subject = subject;
    }

    if (cdrId !== undefined) {
      params.body.cdrId = cdrId;
    }

    if (peopleId !== undefined) {
      params.body.peopleId = peopleId;
    }

    if (companyId !== undefined) {
      params.body.companyId = companyId;
    }

    if (createEngagement !== undefined) {
      params.body.createEngagement = createEngagement;
    }

    if (relatedObject !== undefined) {
      params.body.relatedObject = relatedObject;
    }

    if (relatedId !== undefined) {
      params.body.relatedId = relatedId;
    }

    if (sipCallId !== undefined) {
      params.body.sipCallId = sipCallId;
    }

    if (aiChatSessionId !== undefined) {
      params.body.aiChatSessionId = aiChatSessionId;
    }

    const result = await internalRequest(this.sdk, '/taskRouter/tasks', 'POST', params);
    return result;
  }

  /**
   * Create a call to connect a user to a task
   * Creates an outbound call to a user's extension to connect them with an active task.
   * The task must have an associated CDR (call detail record) with a bridge ID.
   * The task cannot be in 'completed' or 'wrapUp' status.
   *
   * @param {Object} options - Parameters
   * @param {string} options.taskId - The task ID to create a call for (required)
   * @param {string} [options.userId] - The user ID to call. If not provided, uses the authenticated user's ID
   * @returns {Promise<Object>} Object containing the task, user, and bridge information
   * @returns {string} result.taskId - The task ID that was connected
   * @returns {string} result.userId - The user ID that was called
   * @returns {string} result.bridgeId - The bridge ID used to connect the call
   *
   * @example
   * // Create a call to connect authenticated user to a task
   * const result = await sdk.taskRouter.task.createCall({
   *   taskId: 'task123'
   * });
   * console.log(result.taskId); // "task123"
   * console.log(result.bridgeId); // "bridge456"
   *
   * @example
   * // Create a call to connect specific user to a task
   * const result = await sdk.taskRouter.task.createCall({
   *   taskId: 'task123',
   *   userId: 'user789'
   * });
   * console.log(result.userId); // "user789"
   */
  async createCall(options = {}) {
    const { taskId, userId } = options;

    this.sdk.validateParams(
      { taskId, userId },
      {
        taskId: { type: 'string', required: true },
        userId: { type: 'string', required: false },
      },
    );

    const params = {
      body: {
        taskId,
      },
    };

    if (userId !== undefined) {
      params.body.userId = userId;
    }

    const result = await internalRequest(this.sdk, 
      '/taskRouter/tasks/callWorker',
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Accept an assigned task
   * When a worker accepts a task that has been assigned to them, this changes the task status to 'connected'.
   * The worker must match the task assignment. If userId is not provided, uses the authenticated user's ID.
   *
   * @param {Object} options - Parameters
   * @param {string} options.taskId - The task ID to accept (required)
   * @param {string} [options.userId] - The user ID accepting the task. If not provided, uses the authenticated user's ID
   * @returns {Promise<Object>} Object containing the task and worker information
   * @returns {string} result.taskId - The task ID that was accepted
   * @returns {string} result.workerId - The worker ID that accepted the task
   * @returns {string} result.userId - The user ID that accepted the task
   * @returns {string} result.workerSipCallId - The sipCallId of the worker who accepted the task
   *
   * @example
   * // Accept a task as authenticated user
   * const result = await sdk.taskRouter.task.accept({ taskId: 'task123' });
   * console.log(result.taskId); // "task123"
   * console.log(result.workerId); // "worker456"
   *
   * @example
   * // Accept a task for specific user
   * const result = await sdk.taskRouter.task.accept({
   *   taskId: 'task123',
   *   userId: 'user789'
   * });
   * @example
   * // Accept a task for specific user with a sipCallId
   * const result = await sdk.taskRouter.task.accept({
   *   taskId: 'task123',
   *   userId: 'user789'
   *   workerSipCallId: "a19ka-ada9a-adkadi198"
   * });
   */
  async accept(options = {}) {
    const { taskId, userId, workerId, workerSipCallId } = options;

    this.sdk.validateParams(
      { taskId, userId, workerSipCallId, workerId },
      {
        taskId: { type: 'string', required: true },
        userId: { type: 'string', required: false },
        workerSipCallId: { type: 'string', required: false },
        workerId: { type: 'string', required: false },
      },
    );

    const params = {
      body: {
        taskId,
      },
    };

    if (userId) {
      params.body.userId = userId;
    }
    if (workerId) {
      params.body.workerId = workerId;
    }
    if (workerSipCallId) {
      params.body.workerSipCallId = workerSipCallId;
    }

    const result = await internalRequest(this.sdk, 
      '/taskRouter/tasks/accept',
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Reject an assigned task
   * When a worker rejects a task that has been assigned to them, the task is returned to the queue for reassignment.
   * The worker must match the task assignment. If userId is not provided, uses the authenticated user's ID.
   *
   * @param {Object} options - Parameters
   * @param {string} options.taskId - The task ID to reject (required)
   * @param {string} [options.userId] - The user ID rejecting the task. If not provided, uses the authenticated user's ID
   * @returns {Promise<Object>} Object containing the task and worker information
   * @returns {string} result.taskId - The task ID that was rejected
   * @returns {string} result.workerId - The worker ID that rejected the task
   * @returns {string} result.userId - The user ID that rejected the task
   *
   * @example
   * // Reject a task as authenticated user
   * const result = await sdk.taskRouter.task.reject({ taskId: 'task123' });
   * console.log(result.taskId); // "task123"
   *
   * @example
   * // Reject a task for specific user
   * const result = await sdk.taskRouter.task.reject({
   *   taskId: 'task123',
   *   userId: 'user789'
   * });
   */
  async reject(options = {}) {
    const { taskId, userId } = options;

    this.sdk.validateParams(
      { taskId, userId },
      {
        taskId: { type: 'string', required: true },
        userId: { type: 'string', required: false },
      },
    );

    const params = {
      body: {
        taskId,
      },
    };

    if (userId) {
      params.body.userId = userId;
    }

    const result = await internalRequest(this.sdk, 
      '/taskRouter/tasks/reject',
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Change task priority
   * Modify the priority of a task to increase or decrease its routing priority.
   * Priority can be set to a specific value, increased, or decreased.
   *
   * @param {Object} options - Parameters
   * @param {string} options.taskId - The task ID to modify (required)
   * @param {string} [options.action='set'] - The action to perform: 'set', 'increase', or 'decrease' (default: 'set')
   * @param {number} [options.value=0] - The priority value to set, increase by, or decrease by (default: 0)
   * @returns {Promise<Object>} Object containing the task ID and new priority
   * @returns {string} result.taskId - The task ID that was modified
   * @returns {number} result.priority - The new priority value (cannot be less than 0)
   *
   * @example
   * // Set task priority to 10
   * const result = await sdk.taskRouter.task.changePriority({
   *   taskId: 'task123',
   *   action: 'set',
   *   value: 10
   * });
   * console.log(result.priority); // 10
   *
   * @example
   * // Increase task priority by 5
   * const result = await sdk.taskRouter.task.changePriority({
   *   taskId: 'task123',
   *   action: 'increase',
   *   value: 5
   * });
   *
   * @example
   * // Decrease task priority by 3
   * const result = await sdk.taskRouter.task.changePriority({
   *   taskId: 'task123',
   *   action: 'decrease',
   *   value: 3
   * });
   */
  async changePriority(options = {}) {
    const { taskId, action = 'set', value = 0 } = options;

    this.sdk.validateParams(
      { taskId, action, value },
      {
        taskId: { type: 'string', required: true },
        action: { type: 'string', required: false },
        value: { type: 'number', required: false },
      },
    );

    const params = {
      body: {
        taskId,
        action,
        value,
      },
    };

    const result = await internalRequest(this.sdk, 
      '/taskRouter/tasks/priority',
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Toggle task hold status
   * Place a connected task on hold or resume a held task.
   * If the task is currently 'connected', it will be set to 'hold'.
   * If the task is currently 'hold', it will be set back to 'connected'.
   *
   * @param {Object} options - Parameters
   * @param {string} options.taskId - The task ID to hold/resume (required)
   * @returns {Promise<Object>} Object containing the task ID and new status
   * @returns {string} result.taskId - The task ID that was modified
   * @returns {string} result.status - The new status ('hold' or 'connected')
   *
   * @example
   * // Put a connected task on hold
   * const result = await sdk.taskRouter.task.hold({ taskId: 'task123' });
   * console.log(result.status); // "hold"
   *
   * @example
   * // Resume a held task
   * const result = await sdk.taskRouter.task.hold({ taskId: 'task123' });
   * console.log(result.status); // "connected"
   */
  async hold(options = {}) {
    const { taskId } = options;

    this.sdk.validateParams(
      { taskId },
      {
        taskId: { type: 'string', required: true },
      },
    );

    const params = {
      body: {
        taskId,
      },
    };

    const result = await internalRequest(this.sdk, 
      '/taskRouter/tasks/hold',
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Update task skill requirements
   * Add or remove required or optional skills from a task while it's pending, assigned, connected, or on hold.
   * This allows dynamic modification of routing requirements based on task progression.
   *
   * @param {Object} options - Parameters
   * @param {string} options.taskId - The task ID to modify (required)
   * @param {string|string[]} options.skills - Skill ID or array of skill IDs to add/remove (required)
   * @param {string} options.action - The action to perform: 'add' or 'remove' (required)
   * @param {boolean} [options.required=false] - Whether to modify required skills (true) or optional skills (false). Default: false
   * @returns {Promise<Object>} Object containing the task ID and update parameters
   * @returns {string} result.taskId - The task ID that was modified
   * @returns {Object} result.params - The update parameters that were applied
   *
   * @example
   * // Add required skills to a task
   * const result = await sdk.taskRouter.task.updateSkills({
   *   taskId: 'task123',
   *   skills: ['skill456', 'skill789'],
   *   action: 'add',
   *   required: true
   * });
   *
   * @example
   * // Remove optional skills from a task
   * const result = await sdk.taskRouter.task.updateSkills({
   *   taskId: 'task123',
   *   skills: 'skill999',
   *   action: 'remove',
   *   required: false
   * });
   *
   * @example
   * // Add optional skills (default behavior)
   * const result = await sdk.taskRouter.task.updateSkills({
   *   taskId: 'task123',
   *   skills: ['skill111'],
   *   action: 'add'
   * });
   */
  async updateSkills(options = {}) {
    const { taskId, skills, action, required = false } = options;

    this.sdk.validateParams(
      { taskId, skills, action, required },
      {
        taskId: { type: 'string', required: true },
        skills: { type: ['string', 'array'], required: true },
        action: { type: 'string', required: true },
        required: { type: 'boolean', required: false },
      },
    );

    const params = {
      body: {
        taskId,
        skills,
        action,
        required,
      },
    };

    const result = await internalRequest(this.sdk, 
      '/taskRouter/tasks/skills',
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Move task to wrap-up status
   * Transitions a connected or held task to 'wrapUp' status, indicating the worker is completing post-task activities.
   * This status allows workers to complete notes, dispositions, or other follow-up work before completing the task.
   *
   * @param {Object} options - Parameters
   * @param {string} options.taskId - The task ID to move to wrap-up (required)
   * @returns {Promise<Object>} Object containing the task ID and new status
   * @returns {string} result.taskId - The task ID that was modified
   * @returns {string} result.status - The new status ('wrapUp')
   *
   * @example
   * // Move a connected task to wrap-up
   * const result = await sdk.taskRouter.task.wrapUp({ taskId: 'task123' });
   * console.log(result.status); // "wrapUp"
   *
   * @example
   * // Move a held task to wrap-up
   * const result = await sdk.taskRouter.task.wrapUp({ taskId: 'task456' });
   * console.log(result.taskId); // "task456"
   */
  async wrapUp(options = {}) {
    const { taskId } = options;

    this.sdk.validateParams(
      { taskId },
      {
        taskId: { type: 'string', required: true },
      },
    );

    const params = {
      body: {
        taskId,
      },
    };

    const result = await internalRequest(this.sdk, 
      '/taskRouter/tasks/wrapUp',
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Extend wrap-up time for a task
   * Extends the wrap-up timer for a task that is currently in 'wrapUp' status.
   * This gives the worker additional time to complete post-task activities before the task is automatically completed.
   * If extend time is not provided, the queue's default wrapUpExtend value is used (typically 30 seconds).
   *
   * @param {Object} options - Parameters
   * @param {string} options.taskId - The task ID to extend wrap-up time for (required)
   * @param {number} [options.extend] - Number of seconds to extend the wrap-up timer. If not provided, uses the queue's default wrapUpExtend value (typically 30 seconds)
   * @returns {Promise<Object>} Object containing the task ID and extend duration
   * @returns {string} result.taskId - The task ID that was extended
   * @returns {number} result.extend - The number of seconds the wrap-up was extended by
   *
   * @example
   * // Extend wrap-up time by queue default (typically 30 seconds)
   * const result = await sdk.taskRouter.task.wrapUpExtend({ taskId: 'task123' });
   * console.log(result.extend); // 30
   *
   * @example
   * // Extend wrap-up time by 60 seconds
   * const result = await sdk.taskRouter.task.wrapUpExtend({
   *   taskId: 'task123',
   *   extend: 60
   * });
   * console.log(result.extend); // 60
   *
   * @example
   * // Give worker more time to complete notes
   * const result = await sdk.taskRouter.task.wrapUpExtend({
   *   taskId: 'task456',
   *   extend: 120
   * });
   * console.log(result.taskId); // "task456"
   */
  async wrapUpExtend(options = {}) {
    const { taskId, extend } = options;

    this.sdk.validateParams(
      { taskId, extend },
      {
        taskId: { type: 'string', required: true },
        extend: { type: 'number', required: false },
      },
    );

    const params = {
      body: {
        taskId,
      },
    };

    if (extend !== undefined) {
      params.body.extend = extend;
    }

    const result = await internalRequest(this.sdk, 
      '/taskRouter/tasks/wrapUp/extend',
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Complete a task
   * Marks a task as completed, ending its lifecycle in the task router.
   * Can be called from any status except 'completed'.
   *
   * @param {Object} options - Parameters
   * @param {string} options.taskId - The task ID to complete (required)
   * @returns {Promise<Object>} Object containing the task ID and new status
   * @returns {string} result.taskId - The task ID that was completed
   * @returns {string} result.status - The new status ('completed')
   *
   * @example
   * // Complete a task in wrap-up status
   * const result = await sdk.taskRouter.task.complete({ taskId: 'task123' });
   * console.log(result.status); // "completed"
   *
   * @example
   * // Complete a task directly from connected status
   * const result = await sdk.taskRouter.task.complete({ taskId: 'task456' });
   * console.log(result.taskId); // "task456"
   */
  async complete(options = {}) {
    const { taskId } = options;

    this.sdk.validateParams(
      { taskId },
      {
        taskId: { type: 'string', required: true },
      },
    );

    const params = {
      body: {
        taskId,
      },
    };

    const result = await internalRequest(this.sdk, 
      '/taskRouter/tasks/complete',
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Status Change task event
   * Automated event anytime the status of a task is changed.
   *
   * @param {Object} options - Parameters
   * @param {string} options.taskId - The task ID to complete (required)
   * @param {string} options.status - The new status (required)
   * @param {string} options.previousStatus - The previous status (required)
   * @returns {Promise<Object>} Object containing the task ID and new status
   * @returns {string} result.taskId - The task ID that was completed
   *
   * @example
   * const result = await sdk.taskRouter.task.statusEvent({ taskId: 'task123', status: 'completed', previousStatus: 'wrapUp' });
   * console.log(result.taskId); // "085000202601400010000345713108739"
   *
   */
  async statusEvent(options = {}) {
    const { taskId, status, previousStatus } = options;

    this.sdk.validateParams(
      { taskId, status, previousStatus },
      {
        taskId: { type: 'string', required: true },
        status: { type: 'string', required: true },
        previousStatus: { type: 'string', required: true },
      },
    );

    const params = {
      body: {
        taskId,
        status,
        previousStatus,
      },
    };

    const result = await internalRequest(this.sdk, 
      '/taskRouter/tasks/statusEvent',
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Update task details
   * Updates the subject, disposition, or other metadata of an existing task.
   * This allows you to modify task information while it's in progress.
   * At least one of subject or disposition must be provided.
   *
   * @param {Object} options - Parameters
   * @param {string} options.taskId - The task ID to update (required)
   * @param {string} [options.subject] - The new subject/title for the task
   * @param {string} [options.summary] - The overall summary for the task
   * @param {string} [options.disposition] - The disposition code or outcome for the task (e.g., 'resolved', 'escalated', 'callback-scheduled')
   * @returns {Promise<Object>} Object containing the task ID
   * @returns {string} result.taskId - The task ID that was updated
   *
   * @example
   * // Update task subject
   * const result = await sdk.taskRouter.task.update({
   *   taskId: 'task123',
   *   subject: 'Updated customer inquiry about billing'
   * });
   * console.log(result.taskId); // "task123"
   *
   * @example
   * // Update task disposition
   * const result = await sdk.taskRouter.task.update({
   *   taskId: 'task456',
   *   disposition: 'resolved'
   * });
   * console.log(result.taskId); // "task456"
   *
   * @example
   * // Update both subject and disposition
   * const result = await sdk.taskRouter.task.update({
   *   taskId: 'task789',
   *   subject: 'Technical support - printer issue',
   *   disposition: 'escalated'
   * });
   * console.log(result.taskId); // "task789"
   */
  async update(options = {}) {
    const {
      taskId,
      subject,
      disposition,
      sipCallId,
      cdrId,
      summary,
      sentiment,
    } = options;

    this.sdk.validateParams(
      { taskId, subject, disposition, sipCallId, cdrId, summary, sentiment },
      {
        taskId: { type: 'string', required: true },
        subject: { type: 'string', required: false },
        disposition: { type: 'string', required: false },
        cdrId: { type: 'string', required: false },
        sipCallId: { type: 'string', required: false },
        summary: { type: 'string', required: false },
        sentiment: { type: 'object', required: false },
      },
    );

    const params = {
      body: {
        taskId,
      },
    };

    if (subject !== undefined) {
      params.body.subject = subject;
    }

    if (summary !== undefined) {
      params.body.summary = summary;
    }

    if (disposition !== undefined) {
      params.body.disposition = disposition;
    }

    if (cdrId !== undefined) {
      params.body.cdrId = cdrId;
    }

    if (sipCallId !== undefined) {
      params.body.sipCallId = sipCallId;
    }

    if (sentiment !== undefined) {
      params.body.sentiment = sentiment;
    }

    const result = await internalRequest(this.sdk, '/taskRouter/tasks/', 'PUT', params);
    return result;
  }
}
