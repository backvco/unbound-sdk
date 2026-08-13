/**
 * Vocabulary Service - Manage account-level custom transcription vocabulary
 */
export class VocabularyService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * List account custom vocabulary terms
   * @returns {Promise<Object>} { terms: [{id, term, createdBy, createdAt}] }
   */
  async list() {
    const result = await this.sdk._fetch('/ai/vocabulary', 'GET');
    return result;
  }

  /**
   * Add a custom vocabulary term (deduped case-insensitive, max 120 chars)
   * @param {string} term - The vocabulary term to add
   * @returns {Promise<Object>} { term: {id, term, createdBy, createdAt} }
   */
  async add(term) {
    this.sdk.validateParams(
      { term },
      {
        term: { type: 'string', required: true },
      },
    );

    const params = {
      body: { term },
    };

    const result = await this.sdk._fetch('/ai/vocabulary', 'POST', params);
    return result;
  }

  /**
   * Remove a custom vocabulary term
   * @param {string} id - The vocabulary term ID
   * @returns {Promise} 204-style response
   */
  async remove(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const result = await this.sdk._fetch(`/ai/vocabulary/${id}`, 'DELETE');
    return result;
  }
}
