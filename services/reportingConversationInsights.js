import { internalRequest } from '../base.js';

// Q2-style local helper (same as reporting.js/reportingCallQuality.js -- no
// shared util module between these files today).
function queryString(params = {}) {
  const parts = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    const v = Array.isArray(value) ? value.join(',') : value;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

// #13 analytics-expansion B1 (per-report-detail.md #13, atlas §C.2): tracked
// phrases + talk ratio, one endpoint gated by `view`. Own file (not
// reporting.js) same as ReportingCallQualityService -- keeps reporting.js
// under the repo's 400-line limit. Scope: reporting:conversationInsights:read
// (summary) / admin:conversationInsights:manage (tracker + topic CRUD),
// family task_router. Report-card visibility is gated client-side on the
// `managerOnly` flag, NOT on the read scope alone (every Standard User has
// it by default) -- see reportsNav.js.
export class ReportingConversationInsightsService {
  constructor(sdk) {
    this.sdk = sdk;
    this.trackers = {
      list: () => this._listTrackers(),
      create: (params) => this._createTracker(params),
      update: (id, params) => this._updateTracker(id, params),
      remove: (id) => this._removeTracker(id),
    };
    this.topics = {
      list: () => this._listTopics(),
      create: (params) => this._createTopic(params),
    };
  }

  /**
   * @param {Object} params - { from, to, view?, groupBy?, queueIds?, userIds? }
   *   view: 'phrases' (default) | 'talkRatio'; groupBy ('queue'|'agent',
   *   default 'queue') only applies to view='talkRatio'. For the phrase
   *   detail "matching calls" click-through, use `.hits()` below instead.
   * @returns {Promise<Object>} view='phrases': { view, phrases: [{
   *   trackerId, phraseText, topicId, agentHits, customerHits, otherHits,
   *   totalHits, trend: [{ bucketStart, hits }] }] } (sorted by totalHits
   *   desc). view='talkRatio': { view, groupBy, rows: [{ queueId?, userId?,
   *   coverageTotal, coverageWithTranscript, talkRatioAgent, talkRatioCustomer,
   *   monologueMaxSec, questionCount }] }
   * @example
   * await sdk.reporting.conversationInsights.summary({ from, to, view: 'talkRatio', groupBy: 'agent' });
   */
  async summary({ from, to, view, groupBy, queueIds, userIds } = {}) {
    this.sdk.validateParams(
      { from, to },
      {
        from: { type: 'string', required: true },
        to: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/reporting/conversationInsights${queryString({
        from,
        to,
        view,
        groupBy,
        queueIds,
        userIds,
      })}`,
      'GET',
    );
  }

  /**
   * Individual phrase-hit rows for one tracker -- PhraseDetailPanel's
   * "matching calls" transcript click-through (plan §7 B1 / atlas-
   * additions.md §C.2): each hit carries the taskId/occurredAt/
   * transcriptionMessageId/snippet a transcript-viewer deep link needs to
   * seek to the moment, instead of only the 15-min rollup `.summary()`
   * returns.
   * @param {Object} params - { trackerId (required), from (required),
   *   to (required), queueIds?, userIds?, limit? (default 50, max 200) }
   * @returns {Promise<Object>} { view: 'hits', trackerId, hits: [{
   *   taskId, queueId, userId, speakerSide, occurredAt,
   *   transcriptionMessageId, snippet }] } (newest first)
   * @example
   * await sdk.reporting.conversationInsights.hits({ trackerId, from, to });
   */
  async hits({ trackerId, from, to, queueIds, userIds, limit } = {}) {
    this.sdk.validateParams(
      { trackerId, from, to },
      {
        trackerId: { type: 'string', required: true },
        from: { type: 'string', required: true },
        to: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/reporting/conversationInsights${queryString({
        from,
        to,
        view: 'hits',
        trackerId,
        queueIds,
        userIds,
        limit,
      })}`,
      'GET',
    );
  }

  /** Admin CRUD (Contact Center Admin only): tracked phrases.
   * @returns {Promise<Object>} { trackers: [{ id, phraseText, isRegex,
   *   topicId, isActive, isDeleted, createdAt, createdBy, updatedAt,
   *   updatedBy }] }
   * @example await sdk.reporting.conversationInsights.trackers.list();
   */
  async _listTrackers() {
    return internalRequest(
      this.sdk,
      '/reporting/conversationInsights/trackers',
      'GET',
    );
  }

  /**
   * @param {Object} params - { phraseText (required), isRegex?, topicId?, isActive? }
   * @returns {Promise<Object>} { tracker }
   * @example
   * await sdk.reporting.conversationInsights.trackers.create({ phraseText: 'cancel my subscription' });
   */
  async _createTracker({ phraseText, isRegex, topicId, isActive } = {}) {
    this.sdk.validateParams(
      { phraseText },
      { phraseText: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      '/reporting/conversationInsights/trackers',
      'POST',
      { body: { phraseText, isRegex, topicId, isActive } },
    );
  }

  /**
   * @param {string} id
   * @param {Object} params - partial, any of { phraseText, isRegex, topicId, isActive }
   * @returns {Promise<Object>} { tracker }
   * @example
   * await sdk.reporting.conversationInsights.trackers.update(id, { isActive: false });
   */
  async _updateTracker(id, params = {}) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(
      this.sdk,
      `/reporting/conversationInsights/trackers/${encodeURIComponent(id)}`,
      'PUT',
      { body: params },
    );
  }

  /**
   * Soft delete -- isDeleted:1, isActive:0; historical hit rows untouched.
   * @param {string} id
   * @returns {Promise<Object>} { message }
   * @example await sdk.reporting.conversationInsights.trackers.remove(id);
   */
  async _removeTracker(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(
      this.sdk,
      `/reporting/conversationInsights/trackers/${encodeURIComponent(id)}`,
      'DELETE',
    );
  }

  /** @returns {Promise<Object>} { topics: [{ id, name, isActive, isDeleted, createdAt, ... }] }
   * @example await sdk.reporting.conversationInsights.topics.list();
   */
  async _listTopics() {
    return internalRequest(
      this.sdk,
      '/reporting/conversationInsights/topics',
      'GET',
    );
  }

  /**
   * @param {Object} params - { name (required) }
   * @returns {Promise<Object>} { topic }
   * @example await sdk.reporting.conversationInsights.topics.create({ name: 'Pricing' });
   */
  async _createTopic({ name } = {}) {
    this.sdk.validateParams({ name }, { name: { type: 'string', required: true } });
    return internalRequest(
      this.sdk,
      '/reporting/conversationInsights/topics',
      'POST',
      { body: { name } },
    );
  }
}
