import { internalRequest } from '../../base.js';
/**
 * Playbooks Service - Manage AI-driven playbook sessions for guided workflows
 */
export class PlaybooksService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  // ========================================
  // Playbook CRUD Methods
  // ========================================

  /**
   * Create a new playbook
   *
   * @param {Object} options - Playbook creation options
   * @param {string} options.name - Name of the playbook
   * @param {string} [options.recordTypeId] - Record type ID for tracking
   * @returns {Promise<Object>} Created playbook with id
   *
   * @example
   * const playbook = await sdk.ai.playbooks.createPlaybook({
   *   name: 'Sales Discovery Call'
   * });
   */
  async createPlaybook({ name, recordTypeId }) {
    this.sdk.validateParams(
      { name },
      {
        name: { type: 'string', required: true },
        recordTypeId: { type: 'string', required: false },
      },
    );

    const params = {
      body: { name, recordTypeId },
    };

    const result = await internalRequest(this.sdk, '/ai/playbooks', 'POST', params);
    return result;
  }

  /**
   * Get a playbook by ID
   *
   * @param {Object} options - Options
   * @param {string} options.playbookId - The ID of the playbook
   * @returns {Promise<Object>} Playbook object with goals
   *
   * @example
   * const playbook = await sdk.ai.playbooks.getPlaybook({
   *   playbookId: 'pb_123456'
   * });
   */
  async getPlaybook({ playbookId }) {
    this.sdk.validateParams(
      { playbookId },
      {
        playbookId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, `/ai/playbooks/${playbookId}`, 'GET');
    return result;
  }

  /**
   * List playbooks
   *
   * @param {Object} [options={}] - Query options
   * @param {number} [options.limit=100] - Maximum number of results
   * @param {string} [options.orderBy='createdAt'] - Field to order by
   * @param {string} [options.orderDirection='DESC'] - Order direction
   * @param {boolean} [options.isPublished] - Filter by published status
   * @param {string} [options.recordTypeId] - Filter by record type
   * @returns {Promise<Object>} Object with results array
   *
   * @example
   * const playbooks = await sdk.ai.playbooks.listPlaybooks({
   *   isPublished: true,
   *   limit: 50
   * });
   */
  async listPlaybooks({
    limit,
    orderBy,
    orderDirection,
    isPublished,
    recordTypeId,
  } = {}) {
    const params = {
      query: { limit, orderBy, orderDirection, isPublished, recordTypeId },
    };

    const result = await internalRequest(this.sdk, '/ai/playbooks', 'GET', params);
    return result;
  }

  /**
   * Update a playbook
   *
   * @param {Object} options - Update options
   * @param {string} options.playbookId - The ID of the playbook
   * @param {string} [options.name] - New name
   * @param {boolean} [options.isPublished] - Published status
   * @param {string} [options.recordTypeId] - Record type ID
   * @returns {Promise<Object>} Updated playbook object
   *
   * @example
   * const updated = await sdk.ai.playbooks.updatePlaybook({
   *   playbookId: 'pb_123456',
   *   name: 'Updated Sales Call',
   *   isPublished: true
   * });
   */
  async updatePlaybook({
    playbookId,
    name,
    isPublished,
    recordTypeId,
    passScore,
  }) {
    this.sdk.validateParams(
      { playbookId },
      {
        playbookId: { type: 'string', required: true },
        name: { type: 'string', required: false },
        isPublished: { type: 'boolean', required: false },
        recordTypeId: { type: 'string', required: false },
        passScore: { type: 'number', required: false },
      },
    );

    const params = {
      body: { name, isPublished, recordTypeId, passScore },
    };

    const result = await internalRequest(this.sdk, 
      `/ai/playbooks/${playbookId}`,
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Delete a playbook (soft delete)
   *
   * @param {Object} options - Delete options
   * @param {string} options.playbookId - The ID of the playbook
   * @returns {Promise<Object>} Success response
   *
   * @example
   * await sdk.ai.playbooks.deletePlaybook({
   *   playbookId: 'pb_123456'
   * });
   */
  async deletePlaybook({ playbookId }) {
    this.sdk.validateParams(
      { playbookId },
      {
        playbookId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/ai/playbooks/${playbookId}`,
      'DELETE',
    );
    return result;
  }

  // ========================================
  // Playbook Goal CRUD Methods
  // ========================================

  /**
   * Create a playbook goal
   *
   * @param {Object} options - Goal creation options
   * @param {string} options.playbookId - The ID of the playbook
   * @param {string} options.goal - Goal description
   * @param {string} [options.description] - Detailed description
   * @param {Object} [options.criteria] - Goal criteria as JSON
   * @param {string} [options.scoreType='boolean'] - Score type ('boolean' or 'scale')
   * @param {number} [options.weight=0] - Goal weight (0-100)
   * @param {boolean} [options.requiredForPass=false] - Whether required for pass
   * @param {string} [options.recordTypeId] - Record type ID
   * @returns {Promise<Object>} Created goal with id
   *
   * @example
   * const goal = await sdk.ai.playbooks.createPlaybookGoal({
   *   playbookId: 'pb_123456',
   *   goal: 'Identify customer pain points',
   *   description: 'Agent should discover at least 2 pain points',
   *   scoreType: 'scale',
   *   weight: 25
   * });
   */
  async createPlaybookGoal({
    playbookId,
    playbookGoalTypeId,
    goal,
    description,
    criteria,
    scoreType,
    weight,
    requiredForPass,
    role,
    signal,
    window,
    windowTurns,
    recordTypeId,
  }) {
    this.sdk.validateParams(
      {
        playbookId,
        playbookGoalTypeId,
        goal,
        description,
        criteria,
        scoreType,
        weight,
        requiredForPass,
        role,
        signal,
        recordTypeId,
      },
      {
        playbookId: { type: 'string', required: true },
        playbookGoalTypeId: { type: 'string', required: true },
        goal: { type: 'string', required: true },
        description: { type: 'string', required: false },
        criteria: { type: 'object', required: false },
        scoreType: { type: 'string', required: false },
        weight: { type: 'number', required: false },
        requiredForPass: { type: 'boolean', required: false },
        role: { type: 'string', required: false },
        signal: { type: 'string', required: false },
        window: { type: 'string', required: false },
        windowTurns: { type: 'number', required: false },
        recordTypeId: { type: 'string', required: false },
      },
    );

    const params = {
      body: {
        playbookGoalTypeId,
        goal,
        description,
        criteria,
        scoreType,
        weight,
        requiredForPass,
        role,
        signal,
        window,
        windowTurns,
        recordTypeId,
      },
    };

    const result = await internalRequest(this.sdk, 
      `/ai/playbooks/${playbookId}/goals`,
      'POST',
      params,
    );
    return result;
  }

  /**
   * Get a playbook goal by ID
   *
   * @param {Object} options - Options
   * @param {string} options.playbookId - The ID of the playbook
   * @param {string} options.goalId - The ID of the goal
   * @returns {Promise<Object>} Goal object
   *
   * @example
   * const goal = await sdk.ai.playbooks.getPlaybookGoal({
   *   playbookId: 'pb_123456',
   *   goalId: 'goal_789'
   * });
   */
  async getPlaybookGoal({ playbookId, goalId }) {
    this.sdk.validateParams(
      { playbookId, goalId },
      {
        playbookId: { type: 'string', required: true },
        goalId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/ai/playbooks/${playbookId}/goals/${goalId}`,
      'GET',
    );
    return result;
  }

  /**
   * List playbook goals
   *
   * @param {Object} options - Options
   * @param {string} options.playbookId - The ID of the playbook
   * @returns {Promise<Object>} Object with results array
   *
   * @example
   * const goals = await sdk.ai.playbooks.listPlaybookGoals({
   *   playbookId: 'pb_123456'
   * });
   */
  async listPlaybookGoals({ playbookId }) {
    this.sdk.validateParams(
      { playbookId },
      {
        playbookId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/ai/playbooks/${playbookId}/goals`,
      'GET',
    );
    return result;
  }

  /**
   * Update a playbook goal
   *
   * @param {Object} options - Update options
   * @param {string} options.goalId - The ID of the goal
   * @param {string} [options.goal] - Goal description
   * @param {string} [options.description] - Detailed description
   * @param {Object} [options.criteria] - Goal criteria as JSON
   * @param {string} [options.scoreType] - Score type ('boolean' or 'scale')
   * @param {number} [options.weight] - Goal weight (0-100)
   * @param {boolean} [options.requiredForPass] - Whether required for pass
   * @param {string} [options.recordTypeId] - Record type ID
   * @returns {Promise<Object>} Updated goal object
   *
   * @example
   * const updated = await sdk.ai.playbooks.updatePlaybookGoal({
   *   goalId: 'goal_789',
   *   weight: 30,
   *   description: 'Updated description'
   * });
   */
  async updatePlaybookGoal({
    goalId,
    playbookGoalTypeId,
    goal,
    description,
    criteria,
    scoreType,
    weight,
    requiredForPass,
    role,
    signal,
    window,
    windowTurns,
    recordTypeId,
  }) {
    this.sdk.validateParams(
      {
        goalId,
        playbookGoalTypeId,
        goal,
        description,
        criteria,
        scoreType,
        weight,
        requiredForPass,
        role,
        signal,
        recordTypeId,
      },
      {
        goalId: { type: 'string', required: true },
        playbookGoalTypeId: { type: 'string', required: true },
        goal: { type: 'string', required: false },
        description: { type: 'string', required: false },
        criteria: { type: 'object', required: false },
        scoreType: { type: 'string', required: false },
        weight: { type: 'number', required: false },
        requiredForPass: { type: 'boolean', required: false },
        role: { type: 'string', required: false },
        signal: { type: 'string', required: false },
        window: { type: 'string', required: false },
        windowTurns: { type: 'number', required: false },
        recordTypeId: { type: 'string', required: false },
      },
    );

    const params = {
      body: {
        playbookGoalTypeId,
        goal,
        description,
        criteria,
        scoreType,
        weight,
        requiredForPass,
        role,
        signal,
        window,
        windowTurns,
        recordTypeId,
      },
    };

    const result = await internalRequest(this.sdk, 
      `/ai/playbooks/goals/${goalId}`,
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Delete a playbook goal (soft delete)
   *
   * @param {Object} options - Delete options
   * @param {string} options.goalId - The ID of the goal
   * @returns {Promise<Object>} Success response
   *
   * @example
   * await sdk.ai.playbooks.deletePlaybookGoal({
   *   goalId: 'goal_789'
   * });
   */
  async deletePlaybookGoal({ goalId }) {
    this.sdk.validateParams(
      { goalId },
      {
        goalId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/ai/playbooks/goals/${goalId}`,
      'DELETE',
    );
    return result;
  }

  /**
   * Reorder playbook goals
   *
   * @param {Object} options - Reorder options
   * @param {string} options.playbookId - The ID of the playbook
   * @param {string[]} options.goalOrder - Array of goal IDs in desired order
   * @returns {Promise<Object>} Success response
   *
   * @example
   * await sdk.ai.playbooks.reorderPlaybookGoals({
   *   playbookId: 'pb_123',
   *   goalOrder: ['goal_3', 'goal_1', 'goal_2']
   * });
   */
  async reorderPlaybookGoals({ playbookId, goalOrder }) {
    this.sdk.validateParams(
      { playbookId, goalOrder },
      {
        playbookId: { type: 'string', required: true },
        goalOrder: { type: 'array', required: true },
      },
    );

    const params = {
      body: {
        goalOrder,
      },
    };

    const result = await internalRequest(this.sdk, 
      `/ai/playbooks/${playbookId}/goals/reorder`,
      'PUT',
      params,
    );
    return result;
  }

  // ========================================
  // Playbook Goal Type CRUD Methods
  // ========================================

  /**
   * Create a playbook goal type
   *
   * @param {Object} options - Goal type creation options
   * @param {string} options.name - Name of the goal type
   * @param {string} [options.description] - Description
   * @param {Array} [options.keywords] - Keywords array for matching
   * @param {string} [options.recommendedPhase] - Recommended phase ('early', 'middle', 'late', 'any')
   * @param {string} [options.recordTypeId] - Record type ID
   * @returns {Promise<Object>} Created goal type with id
   *
   * @example
   * const goalType = await sdk.ai.playbooks.createPlaybookGoalType({
   *   name: 'Opening/Greeting',
   *   description: 'Initial greeting and rapport building',
   *   keywords: ['hello', 'hi', 'good morning', 'thanks for taking the call'],
   *   recommendedPhase: 'early'
   * });
   */
  async createPlaybookGoalType({
    name,
    description,
    keywords,
    recommendedPhase,
    window,
    windowTurns,
    role,
    signal,
    recordTypeId,
  }) {
    this.sdk.validateParams(
      { name },
      {
        name: { type: 'string', required: true },
        description: { type: 'string', required: false },
        keywords: { type: 'array', required: false },
        recommendedPhase: { type: 'string', required: false },
        window: { type: 'string', required: false },
        windowTurns: { type: 'number', required: false },
        role: { type: 'string', required: false },
        signal: { type: 'string', required: false },
        recordTypeId: { type: 'string', required: false },
      },
    );

    const params = {
      body: {
        name,
        description,
        keywords,
        recommendedPhase,
        window,
        windowTurns,
        role,
        signal,
        recordTypeId,
      },
    };

    const result = await internalRequest(this.sdk, 
      '/ai/playbooks/goalTypes',
      'POST',
      params,
    );
    return result;
  }

  /**
   * Get a playbook goal type by ID
   *
   * @param {Object} options - Options
   * @param {string} options.goalTypeId - The ID of the goal type
   * @returns {Promise<Object>} Goal type object
   *
   * @example
   * const goalType = await sdk.ai.playbooks.getPlaybookGoalType({
   *   goalTypeId: 'gt_123456'
   * });
   */
  async getPlaybookGoalType({ goalTypeId }) {
    this.sdk.validateParams(
      { goalTypeId },
      {
        goalTypeId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/ai/playbooks/goalTypes/${goalTypeId}`,
      'GET',
    );
    return result;
  }

  /**
   * List playbook goal types
   *
   * @param {Object} [options={}] - Query options
   * @param {number} [options.limit=100] - Maximum number of results
   * @param {string} [options.orderBy='createdAt'] - Field to order by
   * @param {string} [options.orderDirection='DESC'] - Order direction
   * @param {string} [options.recommendedPhase] - Filter by recommended phase
   * @param {string} [options.recordTypeId] - Filter by record type
   * @returns {Promise<Object>} Object with results array
   *
   * @example
   * const goalTypes = await sdk.ai.playbooks.listPlaybookGoalTypes({
   *   recommendedPhase: 'early',
   *   limit: 50
   * });
   */
  async listPlaybookGoalTypes({
    limit,
    orderBy,
    orderDirection,
    recommendedPhase,
    recordTypeId,
  } = {}) {
    const params = {
      query: { limit, orderBy, orderDirection, recommendedPhase, recordTypeId },
    };

    const result = await internalRequest(this.sdk, 
      '/ai/playbooks/goalTypes',
      'GET',
      params,
    );
    return result;
  }

  /**
   * Update a playbook goal type
   *
   * @param {Object} options - Update options
   * @param {string} options.goalTypeId - The ID of the goal type
   * @param {string} [options.name] - Name of the goal type
   * @param {string} [options.description] - Description
   * @param {Array} [options.keywords] - Keywords array
   * @param {string} [options.recommendedPhase] - Recommended phase
   * @param {string} [options.recordTypeId] - Record type ID
   * @returns {Promise<Object>} Updated goal type object
   *
   * @example
   * const updated = await sdk.ai.playbooks.updatePlaybookGoalType({
   *   goalTypeId: 'gt_123456',
   *   description: 'Updated description',
   *   keywords: ['hello', 'hi', 'greetings']
   * });
   */
  async updatePlaybookGoalType({
    goalTypeId,
    playbookGoalTypeId,
    name,
    description,
    keywords,
    recommendedPhase,
    window,
    windowTurns,
    role,
    signal,
    recordTypeId,
  }) {
    const id = goalTypeId || playbookGoalTypeId;
    this.sdk.validateParams(
      { goalTypeId: id },
      {
        goalTypeId: { type: 'string', required: true },
        name: { type: 'string', required: false },
        description: { type: 'string', required: false },
        keywords: { type: 'array', required: false },
        recommendedPhase: { type: 'string', required: false },
        window: { type: 'string', required: false },
        windowTurns: { type: 'number', required: false },
        role: { type: 'string', required: false },
        signal: { type: 'string', required: false },
        recordTypeId: { type: 'string', required: false },
      },
    );

    const params = {
      body: {
        name,
        description,
        keywords,
        recommendedPhase,
        window,
        windowTurns,
        role,
        signal,
        recordTypeId,
      },
    };

    const result = await internalRequest(this.sdk, 
      `/ai/playbooks/goalTypes/${id}`,
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Delete a playbook goal type (soft delete)
   *
   * @param {Object} options - Delete options
   * @param {string} options.goalTypeId - The ID of the goal type
   * @returns {Promise<Object>} Success response
   *
   * @example
   * await sdk.ai.playbooks.deletePlaybookGoalType({
   *   goalTypeId: 'gt_123456'
   * });
   */
  async deletePlaybookGoalType({ goalTypeId }) {
    this.sdk.validateParams(
      { goalTypeId },
      {
        goalTypeId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/ai/playbooks/goalTypes/${goalTypeId}`,
      'DELETE',
    );
    return result;
  }

  // ========================================
  // Playbook Session Methods
  // ========================================

  /**
   * Create a new playbook session
   *
   * Initializes a new session for a published playbook, returning the session ID and
   * associated goals that need to be achieved.
   *
   * @param {Object} options - Session creation options
   * @param {string} options.playbookId - The ID of the playbook to create a session for
   * @param {string} [options.transcriptionSessionId] - Optional transcription session ID to associate
   * @param {string} [options.method='ai'] - Method used for the session ('ai' or other custom methods)
   * @param {string} [options.userId] - User ID for the session (defaults to authenticated user)
   * @param {string} [options.recordTypeId] - Record type ID for tracking
   * @returns {Promise<Object>} Session object with id, playbookId, method, and goals array
   *
   * @example
   * // Create a new playbook session
   * const session = await sdk.ai.playbooks.createSession({
   *   playbookId: 'pb_123456',
   *   method: 'ai',
   *   userId: 'user_789'
   * });
   * console.log(session.id); // 'pbs_abc123'
   * console.log(session.goals); // Array of goals for this playbook
   *
   * @example
   * // Create session with transcription
   * const session = await sdk.ai.playbooks.createSession({
   *   playbookId: 'pb_sales_call',
   *   transcriptionSessionId: 'trans_xyz',
   *   method: 'ai'
   * });
   */
  async createSession({
    playbookId,
    transcriptionSessionId,
    method,
    userId,
    recordTypeId,
    sipCallId,
    taskId,
    workerId,
  }) {
    this.sdk.validateParams(
      { playbookId, sipCallId, taskId, workerId },
      {
        playbookId: { type: 'string', required: true },
        transcriptionSessionId: { type: 'string', required: false },
        method: { type: 'string', required: false },
        userId: { type: 'string', required: false },
        recordTypeId: { type: 'string', required: false },
        sipCallId: { type: 'string', required: false },
        taskId: { type: 'string', required: false },
        workerId: { type: 'string', required: false },
      },
    );

    const params = {
      body: {
        transcriptionSessionId,
        method,
        userId,
        recordTypeId,
        sipCallId,
        taskId,
        workerId,
      },
    };

    const result = await internalRequest(this.sdk, 
      `/ai/playbooks/sessions/${playbookId}`,
      'POST',
      params,
    );
    return result;
  }

  /**
   * Get a playbook session
   *
   * Returns the session data including the playbook name and all goals
   * (ordered by playbook goal order), each merged with any logged session
   * goal data (achieved, score, reason, confidence, evidence).
   *
   * Supports lookup by sessionId, or by taskId + workerId, or by taskId + userId.
   *
   * @param {Object} options - Get session options
   * @param {string} [options.sessionId] - The ID of the session
   * @param {string} [options.taskId] - The task ID (used with workerId or userId)
   * @param {string} [options.workerId] - The worker ID (used with taskId)
   * @param {string} [options.userId] - The user ID (used with taskId)
   * @returns {Promise<Object>} Session object with playbookName and goals array
   *
   * @example
   * // Lookup by session ID
   * const session = await sdk.ai.playbooks.getSession({
   *   sessionId: 'pbs_abc123'
   * });
   *
   * @example
   * // Lookup by taskId + workerId
   * const session = await sdk.ai.playbooks.getSession({
   *   taskId: 'task_123',
   *   workerId: 'worker_456'
   * });
   *
   * @example
   * // Lookup by taskId + userId
   * const session = await sdk.ai.playbooks.getSession({
   *   taskId: 'task_123',
   *   userId: 'user_789'
   * });
   */
  async getSession({ sessionId, taskId, workerId, userId }) {
    this.sdk.validateParams(
      { sessionId, taskId, workerId, userId },
      {
        sessionId: { type: 'string', required: false },
        taskId: { type: 'string', required: false },
        workerId: { type: 'string', required: false },
        userId: { type: 'string', required: false },
      },
    );

    if (sessionId) {
      const result = await internalRequest(this.sdk, 
        `/ai/playbooks/sessions/${sessionId}`,
        'GET',
      );
      return result;
    }

    const query = {};
    if (taskId) query.taskId = taskId;
    if (workerId) query.workerId = workerId;
    if (userId) query.userId = userId;

    const result = await internalRequest(this.sdk, 
      `/ai/playbooks/sessions`,
      'GET',
      { query },
    );
    return result;
  }

  /**
   * Complete a playbook session
   *
   * Marks a playbook session as complete with final scores and metrics.
   *
   * @param {Object} options - Session completion options
   * @param {string} options.sessionId - The ID of the session to complete
   * @param {boolean} options.passed - Whether the session passed overall criteria
   * @param {number} options.totalScore - Total score achieved in the session
   * @param {number} options.achievedGoals - Number of goals achieved
   * @param {number} options.totalGoals - Total number of goals in the playbook
   * @returns {Promise<Object>} Completion result with playbookSessionId
   *
   * @example
   * // Complete a playbook session
   * const result = await sdk.ai.playbooks.completeSession({
   *   sessionId: 'pbs_abc123',
   *   passed: true,
   *   totalScore: 85,
   *   achievedGoals: 4,
   *   totalGoals: 5
   * });
   * console.log(result.playbookSessionId); // 'pbs_abc123'
   *
   * @example
   * // Mark session as failed
   * await sdk.ai.playbooks.completeSession({
   *   sessionId: 'pbs_xyz789',
   *   passed: false,
   *   totalScore: 45,
   *   achievedGoals: 2,
   *   totalGoals: 5
   * });
   */
  async completeSession({
    sessionId,
    passed,
    totalScore,
    achievedGoals,
    totalGoals,
    customerTotalScore,
    customerAchievedGoals,
    customerTotalGoals,
  }) {
    this.sdk.validateParams(
      { sessionId },
      {
        sessionId: { type: 'string', required: true },
        passed: { type: 'boolean', required: false },
        totalScore: { type: 'number', required: false },
        achievedGoals: { type: 'number', required: false },
        totalGoals: { type: 'number', required: false },
        customerTotalScore: { type: 'number', required: false },
        customerAchievedGoals: { type: 'number', required: false },
        customerTotalGoals: { type: 'number', required: false },
      },
    );

    const params = {
      body: {
        passed,
        totalScore,
        achievedGoals,
        totalGoals,
        customerTotalScore,
        customerAchievedGoals,
        customerTotalGoals,
      },
    };

    const result = await internalRequest(this.sdk, 
      `/ai/playbooks/sessions/${sessionId}/complete`,
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Log a goal achievement or failure for a playbook session
   *
   * Records whether a specific goal within a playbook session was achieved,
   * along with supporting evidence and scoring information.
   *
   * @param {Object} options - Goal logging options
   * @param {string} options.sessionId - The ID of the session
   * @param {string} options.goalId - The ID of the goal to log
   * @param {boolean} options.achieved - Whether the goal was achieved
   * @param {number} [options.score=0] - Score for this goal
   * @param {string} [options.reason] - Explanation for why goal was/wasn't achieved
   * @param {number} [options.confidence] - Confidence level (0-1) in the assessment
   * @param {Array} [options.evidence] - Array of evidence items supporting the assessment
   * @returns {Promise<Object>} Result with playbookSessionId
   *
   * @example
   * // Log a successful goal achievement
   * await sdk.ai.playbooks.logGoal({
   *   sessionId: 'pbs_abc123',
   *   goalId: 'goal_456',
   *   achieved: true,
   *   score: 10,
   *   reason: 'Customer clearly expressed interest in the product',
   *   confidence: 0.95,
   *   evidence: [
   *     { type: 'transcript', text: 'I would love to learn more about this' },
   *     { type: 'transcript', text: 'When can we schedule a demo?' }
   *   ]
   * });
   *
   * @example
   * // Log a failed goal
   * await sdk.ai.playbooks.logGoal({
   *   sessionId: 'pbs_abc123',
   *   goalId: 'goal_789',
   *   achieved: false,
   *   score: 0,
   *   reason: 'Product pricing was not discussed during the call',
   *   confidence: 0.88
   * });
   *
   * @example
   * // Log goal with partial achievement
   * await sdk.ai.playbooks.logGoal({
   *   sessionId: 'pbs_abc123',
   *   goalId: 'goal_discovery',
   *   achieved: true,
   *   score: 7,
   *   reason: 'Identified 2 out of 3 key pain points',
   *   confidence: 0.85,
   *   evidence: [
   *     { painPoint: 'cost_reduction', mentioned: true },
   *     { painPoint: 'efficiency', mentioned: true },
   *     { painPoint: 'scalability', mentioned: false }
   *   ]
   * });
   */
  async logGoal({
    sessionId,
    goalId,
    achieved,
    score,
    reason,
    confidence,
    evidence,
    role,
  }) {
    this.sdk.validateParams(
      { sessionId, goalId },
      {
        sessionId: { type: 'string', required: true },
        goalId: { type: 'string', required: true },
        achieved: { type: 'boolean', required: false },
        score: { type: 'number', required: false },
        reason: { type: 'string', required: false },
        confidence: { type: 'number', required: false },
        evidence: { type: 'array', required: false },
        role: { type: 'string', required: false },
      },
    );

    const params = {
      body: {
        goalId,
        achieved,
        score,
        reason,
        confidence,
        evidence,
        role,
      },
    };

    const result = await internalRequest(this.sdk, 
      `/ai/playbooks/sessions/${sessionId}/goal`,
      'POST',
      params,
    );
    return result;
  }
}
