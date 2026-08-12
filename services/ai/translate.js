/**
 * AI Translate helper - Batch-translate arbitrary text items
 * Exposed directly on AIService as translate()
 */

/**
 * Translate a batch of text items
 * @param {Object} sdk
 * @param {Object} options
 * @param {Array<{id: string, text: string}>} options.items - Items to translate
 * @param {string} options.targetLanguage - Target language code
 * @param {string} [options.sourceLanguage] - Source language code (auto-detect if omitted)
 * @param {string} [options.domain] - Optional domain hint for translation quality
 * @param {string} [options.context] - Optional additional context
 * @returns {Promise<Object>} { items: [{id, text}] }
 */
export async function translate(
  sdk,
  { items, targetLanguage, sourceLanguage, domain, context },
) {
  sdk.validateParams(
    { items, targetLanguage, sourceLanguage, domain, context },
    {
      items: { type: 'array', required: true },
      targetLanguage: { type: 'string', required: true },
      sourceLanguage: { type: 'string', required: false },
      domain: { type: 'string', required: false },
      context: { type: 'string', required: false },
    },
  );

  const params = {
    body: { items, targetLanguage, sourceLanguage, domain, context },
  };

  const result = await sdk._fetch('/ai/translate', 'POST', params);
  return result;
}
