import { internalRequest } from '../../base.js';

/**
 * Participant Service - multi-party task participation: invite a user onto a
 * task, request help from a queue, hold/drop/leave, and owner<->helper
 * control swaps. Voice participants always dial the main bridge (P4);
 * sidebar bridge, mute, and per-member bridgeRole changes arrive with the
 * media update (P5).
 */
export class ParticipantService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * List a task's participants and any pending help requests.
   *
   * @param {Object} options - Options
   * @param {string} options.taskId - Task ID
   * @returns {Promise<Object>} { participants, helpRequests }
   *
   * @example
   * const { participants, helpRequests } = await sdk.taskRouter.participants.list({ taskId: 'task_123' });
   */
  async list({ taskId }) {
    this.sdk.validateParams(
      { taskId },
      { taskId: { type: 'string', required: true } },
    );

    return await internalRequest(
      this.sdk,
      `/taskRouter/tasks/${taskId}/participants`,
      'GET',
    );
  }

  /**
   * Add a participant to a task: invite a specific user to join, request
   * help from a queue, or dial an external caller onto the live voice bridge.
   *
   * @param {Object} options - Options
   * @param {string} options.taskId - Task ID
   * @param {string} options.kind - 'user' | 'queue' | 'external'
   * @param {string} [options.userId] - Required when kind is 'user'
   * @param {string} [options.queueId] - Required when kind is 'queue'
   * @param {string} [options.phoneNumber] - External caller's phone number (kind 'external'; alternative to peopleId/companyId)
   * @param {string} [options.peopleId] - External caller resolved from a person record (kind 'external'; alternative to phoneNumber/companyId)
   * @param {string} [options.companyId] - External caller resolved from a company record (kind 'external'; alternative to phoneNumber/peopleId)
   * @param {string} [options.displayName] - Optional display name shown for the external caller (kind 'external')
   * @param {string} [options.note] - Optional note shown to the invitee
   * @param {string} [options.bridgeRole='main'] - Voice bridge role (only 'main' is supported until the media update)
   * @returns {Promise<Object>} { participant, offerId } for kind 'user'; { helpTaskId } for kind 'queue'; { participant } for kind 'external'
   *
   * @example
   * await sdk.taskRouter.participants.add({ taskId: 'task_123', kind: 'user', userId: 'user_456', note: 'Need a hand' });
   * @example
   * await sdk.taskRouter.participants.add({ taskId: 'task_123', kind: 'queue', queueId: 'queue_789' });
   * @example
   * await sdk.taskRouter.participants.add({ taskId: 'task_123', kind: 'external', phoneNumber: '+15551234567', displayName: 'Jane Doe' });
   */
  async add({
    taskId,
    kind,
    userId,
    queueId,
    phoneNumber,
    peopleId,
    companyId,
    displayName,
    note,
    bridgeRole,
  } = {}) {
    this.sdk.validateParams(
      {
        taskId,
        kind,
        userId,
        queueId,
        phoneNumber,
        peopleId,
        companyId,
        displayName,
        note,
        bridgeRole,
      },
      {
        taskId: { type: 'string', required: true },
        kind: { type: 'string', required: true },
        userId: { type: 'string', required: false },
        queueId: { type: 'string', required: false },
        phoneNumber: { type: 'string', required: false },
        peopleId: { type: 'string', required: false },
        companyId: { type: 'string', required: false },
        displayName: { type: 'string', required: false },
        note: { type: 'string', required: false },
        bridgeRole: { type: 'string', required: false },
      },
    );

    const params = { body: { kind } };
    if (userId !== undefined) params.body.userId = userId;
    if (queueId !== undefined) params.body.queueId = queueId;
    if (phoneNumber !== undefined) params.body.phoneNumber = phoneNumber;
    if (peopleId !== undefined) params.body.peopleId = peopleId;
    if (companyId !== undefined) params.body.companyId = companyId;
    if (displayName !== undefined) params.body.displayName = displayName;
    if (note !== undefined) params.body.note = note;
    if (bridgeRole !== undefined) params.body.bridgeRole = bridgeRole;

    return await internalRequest(
      this.sdk,
      `/taskRouter/tasks/${taskId}/participants`,
      'POST',
      params,
    );
  }

  /**
   * Cancel a pending/assigned help request before it is joined.
   *
   * @param {Object} options - Options
   * @param {string} options.taskId - Task ID
   * @param {string} options.helpTaskId - The help shell task id returned by `add({ kind: 'queue' })`
   * @returns {Promise<Object>}
   *
   * @example
   * await sdk.taskRouter.participants.cancelHelp({ taskId: 'task_123', helpTaskId: 'task_999' });
   */
  async cancelHelp({ taskId, helpTaskId } = {}) {
    this.sdk.validateParams(
      { taskId, helpTaskId },
      {
        taskId: { type: 'string', required: true },
        helpTaskId: { type: 'string', required: true },
      },
    );

    return await internalRequest(
      this.sdk,
      `/taskRouter/tasks/${taskId}/help/${helpTaskId}`,
      'DELETE',
    );
  }

  /**
   * Update a participant. Only `held` is supported until the media update —
   * `muted` and `bridgeRole` are reserved for P5 and will error server-side.
   *
   * @param {Object} options - Options
   * @param {string} options.taskId - Task ID
   * @param {string} options.participantId - Participant ID
   * @param {boolean} [options.held] - Put the participant's leg on/off hold
   * @param {boolean} [options.muted] - Reserved (media update)
   * @param {string} [options.bridgeRole] - Reserved (media update)
   * @returns {Promise<Object>}
   *
   * @example
   * await sdk.taskRouter.participants.update({ taskId: 'task_123', participantId: 'tp_456', held: true });
   */
  async update({ taskId, participantId, held, muted, bridgeRole } = {}) {
    this.sdk.validateParams(
      { taskId, participantId, held, muted, bridgeRole },
      {
        taskId: { type: 'string', required: true },
        participantId: { type: 'string', required: true },
        held: { type: 'boolean', required: false },
        muted: { type: 'boolean', required: false },
        bridgeRole: { type: 'string', required: false },
      },
    );

    const params = { body: {} };
    if (held !== undefined) params.body.held = held;
    if (muted !== undefined) params.body.muted = muted;
    if (bridgeRole !== undefined) params.body.bridgeRole = bridgeRole;

    return await internalRequest(
      this.sdk,
      `/taskRouter/tasks/${taskId}/participants/${participantId}`,
      'PATCH',
      params,
    );
  }

  /**
   * Remove a participant: drop them (owner/manager) or leave (self).
   *
   * @param {Object} options - Options
   * @param {string} options.taskId - Task ID
   * @param {string} options.participantId - Participant ID
   * @returns {Promise<Object>}
   *
   * @example
   * await sdk.taskRouter.participants.remove({ taskId: 'task_123', participantId: 'tp_456' });
   */
  async remove({ taskId, participantId }) {
    this.sdk.validateParams(
      { taskId, participantId },
      {
        taskId: { type: 'string', required: true },
        participantId: { type: 'string', required: true },
      },
    );

    return await internalRequest(
      this.sdk,
      `/taskRouter/tasks/${taskId}/participants/${participantId}`,
      'DELETE',
    );
  }

  /**
   * Swap task ownership between the current owner and a joined helper. When
   * the helper has no access to the task's queue, this chains: it creates a
   * new task in the helper's queue and makes them its owner. If `queueId` is
   * omitted and the helper has access to more than one queue, the server
   * responds 409 with `{ needsQueue: true, queues }` — retry with a chosen
   * `queueId`.
   *
   * @param {Object} options - Options
   * @param {string} options.taskId - Task ID
   * @param {string} options.participantId - The helper participant taking/giving control
   * @param {string} options.action - 'give' | 'take'
   * @param {string} [options.queueId] - Target queue for a cross-queue control chain (only relevant when the helper lacks access to the task's own queue)
   * @returns {Promise<Object>} { taskId, workerId } for a same-queue swap; { taskId, newTaskId, workerId } for a cross-queue chain
   *
   * @example
   * await sdk.taskRouter.participants.control({ taskId: 'task_123', participantId: 'tp_456', action: 'give' });
   * @example
   * await sdk.taskRouter.participants.control({ taskId: 'task_123', participantId: 'tp_456', action: 'take', queueId: 'queue_789' });
   */
  async control({ taskId, participantId, action, queueId }) {
    this.sdk.validateParams(
      { taskId, participantId, action, queueId },
      {
        taskId: { type: 'string', required: true },
        participantId: { type: 'string', required: true },
        action: { type: 'string', required: true },
        queueId: { type: 'string', required: false },
      },
    );

    const params = { body: { action } };
    if (queueId !== undefined) params.body.queueId = queueId;

    return await internalRequest(
      this.sdk,
      `/taskRouter/tasks/${taskId}/participants/${participantId}/control`,
      'POST',
      params,
    );
  }

  /**
   * Connect-all / sidebar-all. Reserved for the media update (P5) — currently
   * always errors server-side.
   *
   * @param {Object} options - Options
   * @param {string} options.taskId - Task ID
   * @param {string} [options.bridgeRole] - Reserved (media update)
   * @returns {Promise<Object>}
   */
  async all({ taskId, bridgeRole } = {}) {
    this.sdk.validateParams(
      { taskId, bridgeRole },
      {
        taskId: { type: 'string', required: true },
        bridgeRole: { type: 'string', required: false },
      },
    );

    const params = { body: {} };
    if (bridgeRole !== undefined) params.body.bridgeRole = bridgeRole;

    return await internalRequest(
      this.sdk,
      `/taskRouter/tasks/${taskId}/participants/all`,
      'POST',
      params,
    );
  }

  /**
   * List tasks the caller is currently helping on (joined as a helper),
   * for the mini-card strip.
   *
   * @returns {Promise<Array>} [{ task, participantId, role, joinedAt }]
   *
   * @example
   * const helping = await sdk.taskRouter.participants.participating();
   */
  async participating() {
    return await internalRequest(
      this.sdk,
      '/taskRouter/tasks/participating',
      'GET',
    );
  }
}
