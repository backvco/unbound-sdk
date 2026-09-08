import { internalRequest } from '../../base.js';

/**
 * Assist Service - Live AI Assist evaluation for a task
 */
export class AssistService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Evaluate utterances against assigned battle cards for a task
   *
   * @param {Object} options - Evaluate options
   * @param {string} options.taskId - Task ID
   * @param {Array} options.utterances - Utterances to evaluate
   * @returns {Promise<Object>} Evaluation result. Beyond the existing fields, now includes:
   *   @returns {string} result.coach - Agent-only guidance (may draw on internal + public KB, cards, playbook)
   *   @returns {Array<{sourceId:string,title:string,visibility:'internal'|'public',knowledgeBaseId:string}>} result.citations
   *   @returns {'ok'|'legacy'|'blocked:citation'|'blocked:overlap'|'blocked:dontSay'} result.guardResult
   *   @returns {'legacy'|'split'} result.visibilityMode
   *   @returns {string} result.reply - Insertable customer-facing text; empty when guardResult is blocked:*
   *
   * @example
   * const result = await sdk.ai.assist.evaluate({
   *   taskId: 'task_123',
   *   utterances: [{ speaker: 'customer', text: 'That is too expensive' }]
   * });
   */
  async evaluate({ taskId, utterances }) {
    this.sdk.validateParams(
      { taskId, utterances },
      {
        taskId: { type: 'string', required: true },
        utterances: { type: 'array', required: false },
      },
    );

    const params = {
      body: { taskId, utterances },
    };

    const result = await internalRequest(this.sdk, '/ai/assist/evaluate', 'POST', params);
    return result;
  }

  /**
   * Get the last AI Assist evaluation for a task
   *
   * @param {Object} options - Options
   * @param {string} options.taskId - Task ID
   * @returns {Promise<Object>} Last evaluation. Same shape as evaluate()'s result, including
   *   coach, citations, guardResult, visibilityMode, reply (see evaluate() for field docs).
   *
   * @example
   * const last = await sdk.ai.assist.getLast({
   *   taskId: 'task_123'
   * });
   */
  async getLast({ taskId }) {
    this.sdk.validateParams(
      { taskId },
      {
        taskId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, `/ai/assist/last/${taskId}`, 'GET');
    return result;
  }

  /**
   * List persisted AI Assist suggestions (assistSuggestions table), optionally scoped to a queue.
   *
   * @param {Object} [options] - Options
   * @param {string} [options.queueId] - Filter by queue
   * @param {number} [options.limit] - Max rows to return
   * @returns {Promise<Object>} List of suggestion rows
   *
   * @example
   * const { suggestions } = await sdk.ai.assist.listSuggestions({ queueId: 'queue_123', limit: 50 });
   */
  async listSuggestions({ queueId, limit } = {}) {
    const result = await internalRequest(this.sdk, '/ai/assist/suggestions', 'GET', {
      query: { queueId, limit },
    });
    return result;
  }

  /**
   * Get aggregate stats for AI Assist suggestions (counts by guardResult, top blocked citations).
   *
   * @param {Object} [options] - Options
   * @param {string} [options.queueId] - Filter by queue
   * @returns {Promise<Object>} Stats { byGuardResult, topBlockedCitations, ... }
   *
   * @example
   * const stats = await sdk.ai.assist.suggestionStats({ queueId: 'queue_123' });
   */
  async suggestionStats({ queueId } = {}) {
    const result = await internalRequest(this.sdk, '/ai/assist/suggestions/stats', 'GET', {
      query: { queueId },
    });
    return result;
  }

  async listQueueKnowledgeBases({ queueId }) {
    this.sdk.validateParams(
      { queueId },
      { queueId: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/ai/assist/queues/${queueId}/knowledgeBases`,
      'GET',
    );
  }

  async setQueueKnowledgeBases({ queueId, knowledgeBaseIds }) {
    this.sdk.validateParams(
      { queueId, knowledgeBaseIds },
      {
        queueId: { type: 'string', required: true },
        knowledgeBaseIds: { type: 'array', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/ai/assist/queues/${queueId}/knowledgeBases`,
      'PUT',
      { body: { knowledgeBaseIds } },
    );
  }

  async listQueueObjects({ queueId }) {
    this.sdk.validateParams(
      { queueId },
      { queueId: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/ai/assist/queues/${queueId}/objects`,
      'GET',
    );
  }

  async setQueueObjects({ queueId, objectNames }) {
    this.sdk.validateParams(
      { queueId, objectNames },
      {
        queueId: { type: 'string', required: true },
        objectNames: { type: 'array', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/ai/assist/queues/${queueId}/objects`,
      'PUT',
      { body: { objectNames } },
    );
  }
}
