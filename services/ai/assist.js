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
   * @returns {Promise<Object>} Evaluation result
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
        utterances: { type: 'array', required: true },
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
   * @returns {Promise<Object>} Last evaluation
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
}
