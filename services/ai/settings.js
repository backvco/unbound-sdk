import { internalRequest } from '../../base.js';

/**
 * AI Settings helpers - Manage account-level AI feature settings
 * Exposed directly on AIService as getSettings()/updateSettings()
 */

/**
 * Get account AI settings
 * @param {Object} sdk
 * @returns {Promise<Object>} { settings: { shareOcrEnabled } }
 */
export async function getSettings(sdk) {
  const result = await internalRequest(sdk, '/ai/settings', 'GET');
  return result;
}

/**
 * Update account AI settings
 * @param {Object} sdk
 * @param {Object} options
 * @param {boolean} options.shareOcrEnabled - Whether shared-content OCR is enabled
 * @returns {Promise<Object>} { settings }
 */
export async function updateSettings(sdk, { shareOcrEnabled }) {
  sdk.validateParams(
    { shareOcrEnabled },
    {
      shareOcrEnabled: { type: 'boolean', required: true },
    },
  );

  const params = {
    body: { shareOcrEnabled },
  };

  const result = await internalRequest(sdk, '/ai/settings', 'PUT', params);
  return result;
}
