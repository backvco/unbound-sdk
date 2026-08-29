import { internalRequest } from '../base.js';
export class KnowledgeBaseService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Hybrid search across knowledge base content
   * Combines keyword (FULLTEXT) and semantic (vector) search with optional LLM reranking
   *
   * @param {Object} params
   * @param {string} params.query - Search query text
   * @param {string} [params.knowledgeBaseId] - Specific KB to search (omit to search all)
   * @param {number} [params.limit] - Max results to return
   * @param {Object} [params.filters] - Optional filters
   * @param {string} [params.filters.categoryId] - Filter by category
   * @param {string} [params.filters.sourceType] - Filter by source type (article, document, source)
   * @param {Array} [params.filters.tags] - Filter by tags
   * @param {boolean} [params.rerank] - Whether to apply LLM reranking (default: true)
   * @returns {Promise<Object>} Search results with source attribution
   */
  async search({ query, knowledgeBaseId, limit, filters, rerank }) {
    this.sdk.validateParams(
      { query },
      {
        query: { type: 'string', required: true },
      },
    );

    const params = {
      body: { query, knowledgeBaseId, limit, filters, rerank },
    };

    const result = await internalRequest(this.sdk, 
      '/knowledgeBase/search',
      'POST',
      params,
    );
    return result;
  }

  /**
   * Discover pages available at a URL
   * Checks for sitemaps (auto-discovery + direct sitemap URLs) and returns
   * a list of pages the user can select from before ingesting.
   *
   * @param {Object} params
   * @param {string} params.url - URL to discover (base URL or sitemap URL)
   * @returns {Promise<Object>} { url, type, sitemapUrl, pages[], pageCount }
   */
  async discoverUrl({ url }) {
    this.sdk.validateParams(
      { url },
      {
        url: { type: 'string', required: true },
      },
    );

    const params = {
      body: { url },
    };

    const result = await internalRequest(this.sdk, 
      '/knowledgeBase/discover-url',
      'POST',
      params,
    );
    return result;
  }

  /**
   * Ingest a URL into a knowledge base
   * Creates a kbSources record and triggers async crawl + processing
   *
   * @param {Object} params
   * @param {string} params.knowledgeBaseId - Target knowledge base
   * @param {string} params.url - URL to crawl and ingest
   * @param {string} [params.categoryId] - Category to assign
   * @param {string} [params.title] - Display title (auto-detected from page if omitted)
   * @param {string} [params.refreshInterval] - Recrawl interval: manual, daily, weekly, monthly
   * @returns {Promise<Object>} Created kbSources record
   */
  async ingestUrl({ knowledgeBaseId, url, categoryId, title, refreshInterval }) {
    this.sdk.validateParams(
      { knowledgeBaseId, url },
      {
        knowledgeBaseId: { type: 'string', required: true },
        url: { type: 'string', required: true },
      },
    );

    const params = {
      body: { knowledgeBaseId, url, categoryId, title, refreshInterval },
    };

    const result = await internalRequest(this.sdk, 
      '/knowledgeBase/ingest/url',
      'POST',
      params,
    );
    return result;
  }

  /**
   * Trigger (re)processing of a knowledge base source
   * Sets processingStatus to pending and publishes NATS event
   *
   * @param {Object} params
   * @param {string} params.sourceType - Type: article, document, or source
   * @param {string} params.id - Source record ID
   * @returns {Promise<Object>} Updated source record
   */
  async processSource({ sourceType, id }) {
    this.sdk.validateParams(
      { sourceType, id },
      {
        sourceType: { type: 'string', required: true },
        id: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/knowledgeBase/process/${sourceType}/${id}`,
      'POST',
    );
    return result;
  }

  /**
   * Check the processing status of a source
   *
   * @param {Object} params
   * @param {string} params.id - Source record ID
   * @returns {Promise<Object>} Processing status { id, processingStatus, processingError }
   */
  async checkProcessingStatus({ id }) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/knowledgeBase/process/${id}/status`,
      'GET',
    );
    return result;
  }

  /**
   * Publish a draft article
   * Changes status to published, creates version snapshot, triggers processing
   *
   * @param {Object} params
   * @param {string} params.id - Article ID
   * @returns {Promise<Object>} Updated article record
   */
  async publishArticle({ id }) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/knowledgeBase/articles/${id}/publish`,
      'POST',
    );
    return result;
  }

  /**
   * Get analytics for a knowledge base
   *
   * @param {Object} params
   * @param {string} params.knowledgeBaseId - Knowledge base ID
   * @param {Object} [params.filters] - Optional date range, source type filters
   * @returns {Promise<Object>} Analytics data
   */
  async getAnalytics({ knowledgeBaseId, ...filters }) {
    this.sdk.validateParams(
      { knowledgeBaseId },
      {
        knowledgeBaseId: { type: 'string', required: true },
      },
    );

    const params = {
      query: filters,
    };

    const result = await internalRequest(this.sdk, 
      `/knowledgeBase/${knowledgeBaseId}/analytics`,
      'GET',
      params,
    );
    return result;
  }

  /**
   * Get content gap analysis for a knowledge base
   * Identifies failed/low-result searches that indicate missing content
   *
   * @param {Object} params
   * @param {string} params.knowledgeBaseId - Knowledge base ID
   * @param {Object} [params.filters] - Optional date range filters
   * @returns {Promise<Object>} Gap analysis data
   */
  async getGaps({ knowledgeBaseId, ...filters }) {
    this.sdk.validateParams(
      { knowledgeBaseId },
      {
        knowledgeBaseId: { type: 'string', required: true },
      },
    );

    const params = {
      query: filters,
    };

    const result = await internalRequest(this.sdk, 
      `/knowledgeBase/${knowledgeBaseId}/analytics/gaps`,
      'GET',
      params,
    );
    return result;
  }
}
