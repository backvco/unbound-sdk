import { internalRequest } from '../base.js';

// Q2-style local helper (same as reporting.js/reportingMissedCalls.js --
// no shared util module between these files today).
function queryString(params = {}) {
  const parts = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    const v = Array.isArray(value) ? value.join(',') : value;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

// #1b analytics-expansion A2 (per-report-detail.md #1b): account-wide IVR /
// voice-workflow-menu analytics (containment/handoff/abandon) + per-session
// step drill. Own file (same reason as ReportingMissedCallsService). Scope:
// workflows:workflow:read, family workflows_triggers, capability
// capability.workflows.
export class ReportingIvrMenusService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Account-wide voice-menu workflow summary.
   * @param {Object} params - { from, to }
   * @returns {Promise<Object>} { ivrMenus: [{ workflowId, workflowName,
   *   uniqueSessions, containedCount, handoffCount, abandonCount,
   *   containmentRate, handoffRate, abandonRate, avgAttempts,
   *   endReasonBreakdown: { <endReason>: count } }] }
   * @example
   * await sdk.reporting.ivrMenus.summary({ from, to });
   */
  async summary({ from, to } = {}) {
    this.sdk.validateParams(
      { from, to },
      {
        from: { type: 'string', required: true },
        to: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/reporting/ivrMenus${queryString({ from, to })}`,
      'GET',
    );
  }

  /**
   * Per-session step drill.
   * @param {Object} params - { sessionId, from, to }
   * @returns {Promise<Object>} { sessionId, steps: [{ workflowItemId,
   *   moduleType, exitPortId, entryPortId, stepCount, attemptCount,
   *   failureReason, duration, createdAt, completedAt, isHandoff }] }
   * @example
   * await sdk.reporting.ivrMenus.drill({ sessionId, from, to });
   */
  async drill({ sessionId, from, to } = {}) {
    this.sdk.validateParams(
      { sessionId },
      { sessionId: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/reporting/ivrMenus${queryString({ sessionId, from, to })}`,
      'GET',
    );
  }

  /**
   * Session picker for one workflow (review-fix A2 finding 6): recent
   * sessions in [from, to), with a human-readable label (caller name/
   * number + time) -- never a raw session id as the display text, use
   * `sessionId` only to then call drill().
   * @param {Object} params - { workflowId, from, to }
   * @returns {Promise<Object>} { workflowId, sessions: [{ sessionId, label,
   *   channel, createdAt, completedAt, endReason }] }
   * @example
   * await sdk.reporting.ivrMenus.sessions({ workflowId, from, to });
   */
  async sessions({ workflowId, from, to } = {}) {
    this.sdk.validateParams(
      { workflowId, from, to },
      {
        workflowId: { type: 'string', required: true },
        from: { type: 'string', required: true },
        to: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/reporting/ivrMenus${queryString({ workflowId, from, to })}`,
      'GET',
    );
  }
}
