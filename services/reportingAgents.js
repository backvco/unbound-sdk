import { internalRequest } from '../base.js';

function queryString(params = {}) {
  const parts = [];
  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === '') continue;
    const v = Array.isArray(value) ? value.join(',') : value;
    parts.push(`${encodeURIComponent(key)}=${encodeURIComponent(v)}`);
  }
  return parts.length ? `?${parts.join('&')}` : '';
}

// P3 (agent-reporting-plan.md §7 + §8.1) -- /reporting/agents/* thin
// presets over the Foundation registry. sdk.reporting.agents.*
export class ReportingAgentsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Agent summary rows (§6 metrics), grouped by agent, queue, or team.
   * @param {Object} params - { from, to, userIds, queueIds, teamIds, groupBy, agentKind }
   * @returns {Promise<Object>} { columns, rows, definitions, meta }
   * @example
   * await sdk.reporting.agents.summary({ from, to, groupBy: 'team' });
   */
  async summary({ from, to, userIds, queueIds, teamIds, groupBy, agentKind } = {}) {
    this.sdk.validateParams(
      { from, to },
      { from: { type: 'string', required: true }, to: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/reporting/agents/summary${queryString({ from, to, userIds, queueIds, teamIds, groupBy, agentKind })}`,
      'GET',
    );
  }

  /**
   * Collapsed presence timeline for one agent. userId 'me' resolves to the
   * caller.
   * @param {string} userId
   * @param {Object} params - { from, to }
   * @returns {Promise<Object>} { rows }
   * @example
   * await sdk.reporting.agents.states('me', { from, to });
   */
  async states(userId, { from, to } = {}) {
    userId = String(userId);
    this.sdk.validateParams(
      { userId, from, to },
      {
        userId: { type: 'string', required: true },
        from: { type: 'string', required: true },
        to: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/reporting/agents/${userId}/states${queryString({ from, to })}`,
      'GET',
    );
  }

  /**
   * Per-task interaction rows for one agent, paginated.
   * @param {string} userId
   * @param {Object} params - { from, to, cursor, limit }
   * @returns {Promise<Object>} { rows, cursor, hasMore }
   * @example
   * await sdk.reporting.agents.interactions('me', { from, to });
   */
  async interactions(userId, { from, to, cursor, limit } = {}) {
    userId = String(userId);
    this.sdk.validateParams(
      { userId, from, to },
      {
        userId: { type: 'string', required: true },
        from: { type: 'string', required: true },
        to: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/reporting/agents/${userId}/interactions${queryString({ from, to, cursor, limit })}`,
      'GET',
    );
  }

  /**
   * Per-agent per-local-day timesheet rows (net paid hours), plus one
   * additive-sum row per agent (`agents`) for grouped totals.
   * @param {Object} params - { from, to, userIds, teamIds, agentKind }
   * @returns {Promise<Object>} { columns, rows, agents }
   * @example
   * await sdk.reporting.agents.timesheet({ from, to, userIds: ['u1'] });
   */
  async timesheet({ from, to, userIds, teamIds, agentKind } = {}) {
    this.sdk.validateParams(
      { from, to },
      { from: { type: 'string', required: true }, to: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/reporting/agents/timesheet${queryString({ from, to, userIds, teamIds, agentKind })}`,
      'GET',
    );
  }

  /**
   * CSV export of any of the four views above. For view: 'timesheet', pass
   * `totals: true` to get one additive-sum row per agent instead of the
   * flat per-agent-per-day rows.
   * @param {Object} params - { view: 'summary'|'states'|'interactions'|'timesheet', from, to, userId, userIds, queueIds, teamIds, groupBy, agentKind, totals }
   * @returns {Promise<Object>} raw CSV response (transport-dependent)
   * @example
   * await sdk.reporting.agents.export({ view: 'timesheet', from, to });
   * await sdk.reporting.agents.export({ view: 'timesheet', from, to, totals: true });
   */
  async export({
    view,
    from,
    to,
    userId,
    userIds,
    queueIds,
    teamIds,
    groupBy,
    agentKind,
    totals,
  } = {}) {
    this.sdk.validateParams(
      { from, to },
      { from: { type: 'string', required: true }, to: { type: 'string', required: true } },
    );
    const qs = queryString({
      view,
      from,
      to,
      userId,
      userIds,
      queueIds,
      teamIds,
      groupBy,
      agentKind,
      totals: totals ? '1' : undefined,
      format: 'csv',
    });
    return internalRequest(this.sdk, `/reporting/agents/export${qs}`, 'GET', { httpOnly: true });
  }

  /**
   * §8.1 quality trend: aiScoreAvg/humanScoreAvg + n/N counts, per day.
   * @param {string} userId
   * @param {Object} params - { from, to, grain }
   * @returns {Promise<Object>} { columns, rows, definitions, meta }
   * @example
   * await sdk.reporting.agents.qualityTrend('me', { from, to, grain: 'day' });
   */
  async qualityTrend(userId, { from, to, grain } = {}) {
    userId = String(userId);
    this.sdk.validateParams(
      { userId, from, to },
      {
        userId: { type: 'string', required: true },
        from: { type: 'string', required: true },
        to: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/reporting/agents/${userId}/qualityTrend${queryString({ from, to, grain })}`,
      'GET',
    );
  }

  /**
   * §8.1 best/lowest playbook-scored tasks for one agent.
   * @param {string} userId
   * @param {Object} params - { from, to, order: 'best'|'lowest', limit }
   * @returns {Promise<Object>} { rows }
   * @example
   * await sdk.reporting.agents.topTasks('me', { from, to, order: 'lowest', limit: 10 });
   */
  async topTasks(userId, { from, to, order, limit } = {}) {
    userId = String(userId);
    this.sdk.validateParams(
      { userId, from, to },
      {
        userId: { type: 'string', required: true },
        from: { type: 'string', required: true },
        to: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/reporting/agents/${userId}/topTasks${queryString({ from, to, order, limit })}`,
      'GET',
    );
  }

  /**
   * analytics-expansion Phase D: QA/coaching rollup-grain scorecard, one
   * row per agent (or queue/team) across the whole team in range --
   * unlike qualityTrend/topTasks, no single userId is required.
   * @param {Object} params - { from, to, userIds, queueIds, teamIds, groupBy, agentKind }
   * @returns {Promise<Object>} { columns, rows, definitions, meta }
   * @example
   * await sdk.reporting.agents.qualityScorecards({ from, to, groupBy: 'agent' });
   */
  async qualityScorecards({ from, to, userIds, queueIds, teamIds, groupBy, agentKind } = {}) {
    this.sdk.validateParams(
      { from, to },
      { from: { type: 'string', required: true }, to: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/reporting/agents/qualityScorecards${queryString({ from, to, userIds, queueIds, teamIds, groupBy, agentKind })}`,
      'GET',
    );
  }

  /**
   * analytics-expansion Phase D: coaching-suggestion panel rows for one
   * agent -- not-achieved/missed goals in range, each with a
   * `coachingSuggestion` (nullable until generated). userId 'me' resolves
   * to the caller.
   * @param {string} userId
   * @param {Object} params - { from, to, limit }
   * @returns {Promise<Object>} { rows }
   * @example
   * await sdk.reporting.agents.coachingSuggestions('me', { from, to });
   */
  async coachingSuggestions(userId, { from, to, limit } = {}) {
    userId = String(userId);
    this.sdk.validateParams(
      { userId, from, to },
      {
        userId: { type: 'string', required: true },
        from: { type: 'string', required: true },
        to: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/reporting/agents/${userId}/coachingSuggestions${queryString({ from, to, limit })}`,
      'GET',
    );
  }

  /**
   * analytics-expansion Phase D fix: per-goal pass-rate rubric breakdown,
   * aggregated across the current filter set (agent-role goals only) --
   * same multi-agent shape as qualityScorecards, no single userId required.
   * @param {Object} params - { from, to, userIds, queueIds, teamIds, agentKind }
   * @returns {Promise<Object>} { rows: [{ playbookGoalId, goalName, achievedCount, totalCount, passRate }] }
   * @example
   * await sdk.reporting.agents.qualityRubricBreakdown({ from, to });
   */
  async qualityRubricBreakdown({ from, to, userIds, queueIds, teamIds, agentKind } = {}) {
    this.sdk.validateParams(
      { from, to },
      { from: { type: 'string', required: true }, to: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/reporting/agents/qualityRubricBreakdown${queryString({ from, to, userIds, queueIds, teamIds, agentKind })}`,
      'GET',
    );
  }

  /**
   * analytics-expansion Phase D fix: AI+human score trend (two series,
   * never averaged) aggregated across the current filter set -- unlike
   * qualityTrend, no single userId is required, for the report-level
   * trend chart alongside the team/queue-wide scorecard.
   * @param {Object} params - { from, to, grain, userIds, queueIds, teamIds, agentKind }
   * @returns {Promise<Object>} { columns, rows, definitions, meta }
   * @example
   * await sdk.reporting.agents.qualityTrendRollup({ from, to, grain: 'day' });
   */
  async qualityTrendRollup({ from, to, grain, userIds, queueIds, teamIds, agentKind } = {}) {
    this.sdk.validateParams(
      { from, to },
      { from: { type: 'string', required: true }, to: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/reporting/agents/qualityTrendRollup${queryString({ from, to, grain, userIds, queueIds, teamIds, agentKind })}`,
      'GET',
    );
  }
}
