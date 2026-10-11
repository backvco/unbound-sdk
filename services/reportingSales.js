import { internalRequest } from '../base.js';

// Q2-style local helper (same as reporting.js/reportingAiAdoption.js --
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

// Work Package C analytics-expansion (plan §4.5, §7 C row, per-report-
// detail.md #4/#5): Rep activity-to-revenue + Pipeline/deal-risk panel.
// Own file/class (same 400-line-limit reason as every other reporting.*
// sub-namespace -- see reporting.js's own comments). Scope:
// reporting:sales:read, family task_router. Every read on the API side
// goes through UOQL/recordType enforcement (security.md §B.2) -- a
// zero-recordType-grant user gets zero opportunity rows back, not an
// error, same shape as every other GET here.
export class ReportingSalesService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Per-rep activity (calls/SMS, CC data) joined with CRM pipeline
   * movement (opportunities, owner-scoped UOQL) -- NOT Journeys, which the
   * client calls directly via `sdk.journeys.funnel()`/`.repsMetrics()`
   * (per-report-detail.md #4, plan §4.7/§8 r2 fix).
   * @param {Object} params - { from, to, limit?, offset? } -- 'YYYY-MM-DD'/ISO.
   * @returns {Promise<Object>} { rows: [{userId, userName, callCount,
   *   answeredCount, outboundCount, smsCount, sentCount, pipelineOpenCount,
   *   pipelineOpenAmount, pipelineClosedWonCount, pipelineClosedWonAmount,
   *   pipelineClosedLostCount}], rollup, pagination: {total,limit,offset,hasMore} }
   *   -- CRM fields are `null` (render "-") for a rep with no CRM rows at
   *   all in range, never `0` (per-report-detail.md #4 edge case).
   * @example
   * await sdk.reporting.sales.repActivity({ from, to });
   */
  async repActivity({ from, to, limit, offset } = {}) {
    this.sdk.validateParams(
      { from, to },
      {
        from: { type: 'string', required: true },
        to: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/reporting/sales/repActivity${queryString({ from, to, limit, offset })}`,
      'GET',
    );
  }

  /**
   * Open pipeline by stage + win/loss by lostReasonId (live UOQL
   * aggregates) + funnel/stage-conversion % (opportunityStageHistory_acct).
   * @param {Object} params - { from, to } -- `to` bounds the win/loss
   *   `closedAt` window and the funnel's `enteredAt` window.
   * @returns {Promise<Object>} { stages: [{stageId,stageName,order,
   *   openCount,openAmount}], winLoss: [{isWon,lostReasonId,count,amount}],
   *   funnel: [{stageId,stageName,order,enteredCount,conversionFromPriorPct}] }
   * @example
   * await sdk.reporting.sales.pipeline({ from, to });
   */
  async pipeline({ from, to } = {}) {
    this.sdk.validateParams(
      { from, to },
      {
        from: { type: 'string', required: true },
        to: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/reporting/sales/pipeline${queryString({ from, to })}`,
      'GET',
    );
  }

  /**
   * Open-opportunity risk-pill list: daysInStage, daysSinceLastActivity,
   * stageSkipFlag blended into a 0-100 `riskScore`/`riskTier`
   * ('low'|'medium'|'high'). This list is intentionally UNWINDOWED --
   * `from`/`to` are required/validated for contract consistency with the
   * other /sales/* endpoints but are never applied as a filter (every open
   * deal is scored regardless of forecastedCloseDate; see dealRisk.js's
   * own "review fix (blocker)" comment for why).
   * @param {Object} params - { from, to }
   * @returns {Promise<Object>} { rows: [{opportunityId, name, ownerId,
   *   ownerName, stageId, stageName, amount, forecastedCloseDate,
   *   daysInStage, daysInStageEstimated, daysSinceLastActivity,
   *   stageSkipFlag, riskScore, riskTier}], summary: {high,medium,low} }
   * @example
   * await sdk.reporting.sales.dealRisk({ from, to });
   */
  async dealRisk({ from, to } = {}) {
    this.sdk.validateParams(
      { from, to },
      {
        from: { type: 'string', required: true },
        to: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/reporting/sales/dealRisk${queryString({ from, to })}`,
      'GET',
    );
  }
}
