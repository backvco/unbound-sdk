import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { JourneysService } from '../services/journeys/JourneysService.js';
import { JourneyMembersService } from '../services/journeys/JourneyMembersService.js';
import { JourneyWorklistService } from '../services/journeys/JourneyWorklistService.js';

// P5 (journeys-plan.md §9, area sdk): sales work list + AI draft. Fake-SDK
// double mirrors test/journeys-service.test.js's buildFakeSdk.
function buildFakeSdk() {
  const calls = [];
  const fakeSdk = {
    validateParams: () => {},
  };
  fakeSdk[Symbol.for('unbound.sdk.request')] = async (
    endpoint,
    method,
    params,
    forceFetch,
  ) => {
    calls.push({ endpoint, method, params, forceFetch });
    return { data: null };
  };
  return { fakeSdk, calls };
}

describe('JourneysService.worklist (wired)', () => {
  test('constructor exposes worklist as a JourneyWorklistService', () => {
    const { fakeSdk } = buildFakeSdk();
    const svc = new JourneysService(fakeSdk);
    assert.ok(svc.worklist instanceof JourneyWorklistService);
  });
});

describe('JourneyWorklistService.list', () => {
  test('GETs /journeys/worklist with only defined params', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await new JourneyWorklistService(fakeSdk).list({
      bucket: 'due',
      page: 2,
    });

    assert.equal(calls[0].endpoint, '/journeys/worklist');
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(calls[0].params.query, { bucket: 'due', page: 2 });
  });

  test('defaults to an empty query', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await new JourneyWorklistService(fakeSdk).list();

    assert.deepEqual(calls[0].params.query, {});
  });
});

describe('JourneyWorklistService.takeNext', () => {
  test('POSTs /journeys/worklist/take-next with the filter as the body', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await new JourneyWorklistService(fakeSdk).takeNext({
      journeyId: 'jny-1',
      stepType: 'journeyCall',
    });

    assert.equal(calls[0].endpoint, '/journeys/worklist/take-next');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, {
      journeyId: 'jny-1',
      stepType: 'journeyCall',
    });
  });

  test('works with no filter', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await new JourneyWorklistService(fakeSdk).takeNext();

    assert.deepEqual(calls[0].params.body, {});
  });
});

describe('JourneyMembersService.draft', () => {
  test('POSTs /journeys/members/:memberId/draft', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await new JourneyMembersService(fakeSdk).draft('jnm-1', {
      stepKey: 'followup1',
      channel: 'email',
    });

    assert.equal(calls[0].endpoint, '/journeys/members/jnm-1/draft');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, {
      stepKey: 'followup1',
      channel: 'email',
    });
  });

  test('requires channel', async () => {
    // Minimal stand-in that mimics base.js's required-field check, since
    // buildFakeSdk's validateParams accepts anything.
    const strictSdk = {
      validateParams(values, schema) {
        for (const [key, rule] of Object.entries(schema)) {
          if (rule.required && (values[key] === undefined || values[key] === null)) {
            throw new Error(`${key} is required`);
          }
        }
      },
    };
    strictSdk[Symbol.for('unbound.sdk.request')] = async () => ({ data: null });

    await assert.rejects(
      () => new JourneyMembersService(strictSdk).draft('jnm-1', {}),
      /channel is required/,
    );
  });
});
