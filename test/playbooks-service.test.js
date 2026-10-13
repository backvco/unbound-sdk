import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { PlaybooksService } from '../services/ai/playbooks.js';

function buildFakeSdk(response = {}) {
  const calls = [];
  const fakeSdk = {
    validateParams: () => {},
  };
  fakeSdk[Symbol.for('unbound.sdk.request')] = async (endpoint, method, params) => {
    calls.push({ endpoint, method, params });
    return response;
  };
  return { fakeSdk, calls };
}

describe('PlaybooksService.getSessionByTask', () => {
  test('delegates to getSession({taskId, includeQa}) -> GET /ai/playbooks/sessions?taskId=', async () => {
    const { fakeSdk, calls } = buildFakeSdk({ id: 'pbs_1', goals: [] });
    const result = await new PlaybooksService(fakeSdk).getSessionByTask({
      taskId: 'task_123',
      includeQa: true,
    });
    assert.equal(calls[0].endpoint, '/ai/playbooks/sessions');
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(calls[0].params.query, { taskId: 'task_123', includeQa: 1 });
    assert.deepEqual(result, { id: 'pbs_1', goals: [] });
  });

  test('omits includeQa from the query when not given', async () => {
    const { fakeSdk, calls } = buildFakeSdk({});
    await new PlaybooksService(fakeSdk).getSessionByTask({ taskId: 'task_123' });
    assert.deepEqual(calls[0].params.query, { taskId: 'task_123' });
  });
});

describe('PlaybooksService.logGoals', () => {
  test('POSTs /ai/playbooks/sessions/:id/goals with {goals}', async () => {
    const { fakeSdk, calls } = buildFakeSdk({ playbookSessionId: 'pbs_1' });
    const goals = [{ goalId: 'goal_1', achieved: true, score: 10 }];
    const result = await new PlaybooksService(fakeSdk).logGoals({
      sessionId: 'pbs_1',
      goals,
    });
    assert.equal(calls[0].endpoint, '/ai/playbooks/sessions/pbs_1/goals');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, { goals });
    assert.deepEqual(result, { playbookSessionId: 'pbs_1' });
  });
});

describe('PlaybooksService.setOwner', () => {
  test('PUTs /ai/playbooks/sessions/:id/owner with {workerId, userId}', async () => {
    const { fakeSdk, calls } = buildFakeSdk({ playbookSessionId: 'pbs_1' });
    await new PlaybooksService(fakeSdk).setOwner({
      sessionId: 'pbs_1',
      workerId: 'worker_1',
      userId: 'user_1',
    });
    assert.equal(calls[0].endpoint, '/ai/playbooks/sessions/pbs_1/owner');
    assert.equal(calls[0].method, 'PUT');
    assert.deepEqual(calls[0].params.body, { workerId: 'worker_1', userId: 'user_1' });
  });
});

describe('PlaybooksService.upsertParticipant', () => {
  test('no participantId -> POSTs .../participants (join)', async () => {
    const { fakeSdk, calls } = buildFakeSdk({ id: 'pbp_1' });
    const joinedAt = new Date().toISOString();
    const result = await new PlaybooksService(fakeSdk).upsertParticipant({
      sessionId: 'pbs_1',
      workerId: 'worker_1',
      userId: 'user_1',
      kind: 'human',
      joinedAt,
    });
    assert.equal(calls[0].endpoint, '/ai/playbooks/sessions/pbs_1/participants');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, {
      workerId: 'worker_1',
      userId: 'user_1',
      kind: 'human',
      joinedAt,
    });
    assert.deepEqual(result, { id: 'pbp_1' });
  });

  test('with participantId -> PUTs .../participants/:pid (leave + segment)', async () => {
    const { fakeSdk, calls } = buildFakeSdk({ id: 'pbp_1', leftAt: 'x' });
    const leftAt = new Date().toISOString();
    await new PlaybooksService(fakeSdk).upsertParticipant({
      sessionId: 'pbs_1',
      participantId: 'pbp_1',
      leftAt,
      endReason: 'transferred',
      segmentTotalScore: 30,
      segmentAchievedGoals: 3,
      segmentTotalGoals: 5,
    });
    assert.equal(calls[0].endpoint, '/ai/playbooks/sessions/pbs_1/participants/pbp_1');
    assert.equal(calls[0].method, 'PUT');
    assert.deepEqual(calls[0].params.body, {
      leftAt,
      endReason: 'transferred',
      segmentTotalScore: 30,
      segmentAchievedGoals: 3,
      segmentTotalGoals: 5,
      segmentGoals: undefined,
    });
  });
});

describe('PlaybooksService.addParticipant', () => {
  test('POSTs /ai/playbooks/sessions/:id/participants with {workerId, userId, kind, joinedAt}', async () => {
    const { fakeSdk, calls } = buildFakeSdk({ id: 'pbp_1' });
    const joinedAt = new Date().toISOString();
    const result = await new PlaybooksService(fakeSdk).addParticipant({
      sessionId: 'pbs_1',
      workerId: 'worker_1',
      userId: 'user_1',
      kind: 'human',
      joinedAt,
    });
    assert.equal(calls[0].endpoint, '/ai/playbooks/sessions/pbs_1/participants');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, {
      workerId: 'worker_1',
      userId: 'user_1',
      kind: 'human',
      joinedAt,
    });
    assert.deepEqual(result, { id: 'pbp_1' });
  });
});

describe('PlaybooksService.closeParticipant', () => {
  test('PUTs /ai/playbooks/sessions/:id/participants/:pid with the segment result', async () => {
    const { fakeSdk, calls } = buildFakeSdk({ id: 'pbp_1', leftAt: 'x' });
    const leftAt = new Date().toISOString();
    await new PlaybooksService(fakeSdk).closeParticipant({
      sessionId: 'pbs_1',
      participantId: 'pbp_1',
      leftAt,
      endReason: 'transferred',
      segmentTotalScore: 30,
      segmentAchievedGoals: 3,
      segmentTotalGoals: 5,
      segmentGoals: [{ goalId: 'goal_1', achieved: true }],
    });
    assert.equal(calls[0].endpoint, '/ai/playbooks/sessions/pbs_1/participants/pbp_1');
    assert.equal(calls[0].method, 'PUT');
    assert.deepEqual(calls[0].params.body, {
      leftAt,
      endReason: 'transferred',
      segmentTotalScore: 30,
      segmentAchievedGoals: 3,
      segmentTotalGoals: 5,
      segmentGoals: [{ goalId: 'goal_1', achieved: true }],
    });
  });
});
