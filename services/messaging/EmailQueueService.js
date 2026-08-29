import { internalRequest } from '../../base.js';
export class EmailQueueService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Get email queue items with pagination and status filtering
   * @param {Object} [params] - Queue query parameters
   * @param {number} [params.page=1] - Page number (1-based)
   * @param {number} [params.limit=50] - Number of items per page (max 100)
   * @param {string} [params.status='queued'] - Filter by status: 'queued', 'sent', 'delivered', 'failed'
   * @returns {Promise<Object>} Paginated queue items with metadata
   * @example
   * // Get first page of queued emails
   * const queue = await sdk.messaging.email.queue.list({ page: 1, limit: 25, status: 'queued' });
   * // Returns: {
   * //   items: [{
   * //     id, status, to, from, subject, carrier, carrierId,
   * //     createdAt, lastStatusUpdatedAt, processingTimeSeconds
   * //   }],
   * //   pagination: {
   * //     page, limit, totalItems, totalPages, hasNextPage, hasPreviousPage
   * //   },
   * //   filter: { status }
   * // }
   */
  async list({ page, limit, status } = {}) {
    const options = { query: {} };
    if (page !== undefined) options.query.page = page;
    if (limit !== undefined) options.query.limit = limit;
    if (status) options.query.status = status;

    const result = await internalRequest(this.sdk, 
      '/messaging/email/queue',
      'GET',
      options,
    );
    return result;
  }

  /**
   * Get queued emails only (convenience method)
   * @param {Object} [params] - Query parameters
   * @param {number} [params.page=1] - Page number (1-based)
   * @param {number} [params.limit=50] - Number of items per page (max 100)
   * @returns {Promise<Object>} Paginated queued emails
   * @example
   * // Get pending emails waiting to be sent
   * const pending = await sdk.messaging.email.queue.getQueued({ page: 1, limit: 50 });
   */
  async getQueued({ page, limit } = {}) {
    return this.list({ page, limit, status: 'queued' });
  }

  /**
   * Get failed emails only (convenience method)
   * @param {Object} [params] - Query parameters
   * @param {number} [params.page=1] - Page number (1-based)
   * @param {number} [params.limit=50] - Number of items per page (max 100)
   * @returns {Promise<Object>} Paginated failed emails
   * @example
   * // Get emails that failed to send
   * const failed = await sdk.messaging.email.queue.getFailed({ page: 1, limit: 50 });
   */
  async getFailed({ page, limit } = {}) {
    return this.list({ page, limit, status: 'failed' });
  }

  /**
   * Get sent emails only (convenience method)
   * @param {Object} [params] - Query parameters
   * @param {number} [params.page=1] - Page number (1-based)
   * @param {number} [params.limit=50] - Number of items per page (max 100)
   * @returns {Promise<Object>} Paginated sent emails
   * @example
   * // Get emails that have been sent successfully
   * const sent = await sdk.messaging.email.queue.getSent({ page: 1, limit: 50 });
   */
  async getSent({ page, limit } = {}) {
    return this.list({ page, limit, status: 'sent' });
  }

  /**
   * Get delivered emails only (convenience method)
   * @param {Object} [params] - Query parameters
   * @param {number} [params.page=1] - Page number (1-based)
   * @param {number} [params.limit=50] - Number of items per page (max 100)
   * @returns {Promise<Object>} Paginated delivered emails
   * @example
   * // Get emails that have been delivered to recipients
   * const delivered = await sdk.messaging.email.queue.getDelivered({ page: 1, limit: 50 });
   */
  async getDelivered({ page, limit } = {}) {
    return this.list({ page, limit, status: 'delivered' });
  }
}
