import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { JourneysService } from '../services/journeys/JourneysService.js';
import { JourneyMembersService } from '../services/journeys/JourneyMembersService.js';

/**
 * Build a minimal SDK double. `calls` captures internalRequest (custom
 * routes); `objectCalls` captures sdk.objects.* calls (generic-object
 * CRUD wrapper methods). Mirrors test/schedules-service.test.js.
 */
function buildFakeSdk() {
  const calls = [];
  const objectCalls = [];
  const fakeSdk = {
    validateParams: () => {}, // accept anything
    objects: {
      query: async (args) => {
        objectCalls.push({ method: 'query', args });
        return { results: [], pagination: {} };
      },
      byId: async (args) => {
        objectCalls.push({ method: 'byId', args });
        return { ok: true };
      },
      create: async (args) => {
        objectCalls.push({ method: 'create', args });
        return { ok: true };
      },
      updateById: async (args) => {
        objectCalls.push({ method: 'updateById', args });
        return { ok: true };
      },
      deleteById: async (args) => {
        objectCalls.push({ method: 'deleteById', args });
        return { deleted: [args.id] };
      },
    },
  };
  fakeSdk[Symbol.for('unbound.sdk.request')] = async (
    endpoint,
    method,
    params,
    forceFetch,
  ) => {
    calls.push({ endpoint, method, params, forceFetch });
    return { ok: true };
  };
  return { fakeSdk, calls, objectCalls };
}

function journeys(fakeSdk) {
  return new JourneysService(fakeSdk);
}

function members(fakeSdk) {
  return new JourneyMembersService(fakeSdk);
}

describe('JourneysService.list', () => {
  test('queries the journeys object', async () => {
    const { fakeSdk, objectCalls } = buildFakeSdk();

    await journeys(fakeSdk).list({ where: { status: 'active' } });

    assert.equal(objectCalls[0].method, 'query');
    assert.equal(objectCalls[0].args.object, 'journeys');
    assert.deepEqual(objectCalls[0].args.where, { status: 'active' });
  });
});

describe('JourneysService.get', () => {
  test('fetches the journey by id', async () => {
    const { fakeSdk, objectCalls } = buildFakeSdk();

    await journeys(fakeSdk).get('jny-1');

    assert.equal(objectCalls[0].method, 'byId');
    assert.equal(objectCalls[0].args.id, 'jny-1');
  });
});

describe('JourneysService.create', () => {
  test('creates a journeys record', async () => {
    const { fakeSdk, objectCalls } = buildFakeSdk();
    const body = { name: 'Welcome series', journeyTypeId: 'jnt-1' };

    await journeys(fakeSdk).create(body);

    assert.equal(objectCalls[0].method, 'create');
    assert.equal(objectCalls[0].args.object, 'journeys');
    assert.deepEqual(objectCalls[0].args.body, body);
  });
});

describe('JourneysService.update', () => {
  test('updates the journey by id', async () => {
    const { fakeSdk, objectCalls } = buildFakeSdk();

    await journeys(fakeSdk).update('jny-1', { status: 'paused' });

    assert.equal(objectCalls[0].method, 'updateById');
    assert.equal(objectCalls[0].args.object, 'journeys');
    assert.equal(objectCalls[0].args.id, 'jny-1');
    assert.deepEqual(objectCalls[0].args.update, { status: 'paused' });
  });
});

describe('JourneysService.archive', () => {
  test('deletes (archives) the journey by id', async () => {
    const { fakeSdk, objectCalls } = buildFakeSdk();

    await journeys(fakeSdk).archive('jny-1');

    assert.equal(objectCalls[0].method, 'deleteById');
    assert.equal(objectCalls[0].args.object, 'journeys');
    assert.equal(objectCalls[0].args.id, 'jny-1');
  });
});

describe('JourneysService.stats', () => {
  test('GETs /journeys/:id/stats', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await journeys(fakeSdk).stats('jny-1');

    assert.equal(calls[0].endpoint, '/journeys/jny-1/stats');
    assert.equal(calls[0].method, 'GET');
  });
});

describe('JourneysService.types', () => {
  test('list queries the journeyTypes object', async () => {
    const { fakeSdk, objectCalls } = buildFakeSdk();

    await journeys(fakeSdk).types.list();

    assert.equal(objectCalls[0].method, 'query');
    assert.equal(objectCalls[0].args.object, 'journeyTypes');
  });

  test('get fetches a journeyType by id', async () => {
    const { fakeSdk, objectCalls } = buildFakeSdk();

    await journeys(fakeSdk).types.get('jnt-1');

    assert.equal(objectCalls[0].method, 'byId');
    assert.equal(objectCalls[0].args.id, 'jnt-1');
  });

  test('create creates a journeyTypes record', async () => {
    const { fakeSdk, objectCalls } = buildFakeSdk();

    await journeys(fakeSdk).types.create({ name: 'Onboarding' });

    assert.equal(objectCalls[0].method, 'create');
    assert.equal(objectCalls[0].args.object, 'journeyTypes');
    assert.deepEqual(objectCalls[0].args.body, { name: 'Onboarding' });
  });

  test('update updates a journeyTypes record by id', async () => {
    const { fakeSdk, objectCalls } = buildFakeSdk();

    await journeys(fakeSdk).types.update('jnt-1', { name: 'Renamed' });

    assert.equal(objectCalls[0].method, 'updateById');
    assert.equal(objectCalls[0].args.object, 'journeyTypes');
  });

  test('remove deletes a journeyTypes record by id', async () => {
    const { fakeSdk, objectCalls } = buildFakeSdk();

    await journeys(fakeSdk).types.remove('jnt-1');

    assert.equal(objectCalls[0].method, 'deleteById');
    assert.equal(objectCalls[0].args.object, 'journeyTypes');
  });
});

describe('JourneysService.goals', () => {
  test('list queries the journeyGoals object', async () => {
    const { fakeSdk, objectCalls } = buildFakeSdk();

    await journeys(fakeSdk).goals.list({ where: { journeyId: 'jny-1' } });

    assert.equal(objectCalls[0].method, 'query');
    assert.equal(objectCalls[0].args.object, 'journeyGoals');
    assert.deepEqual(objectCalls[0].args.where, { journeyId: 'jny-1' });
  });

  test('create creates a journeyGoals record', async () => {
    const { fakeSdk, objectCalls } = buildFakeSdk();
    const body = { journeyId: 'jny-1', goalType: 'conversion' };

    await journeys(fakeSdk).goals.create(body);

    assert.equal(objectCalls[0].method, 'create');
    assert.equal(objectCalls[0].args.object, 'journeyGoals');
    assert.deepEqual(objectCalls[0].args.body, body);
  });

  test('update updates a journeyGoals record by id', async () => {
    const { fakeSdk, objectCalls } = buildFakeSdk();

    await journeys(fakeSdk).goals.update('jng-1', { config: { x: 1 } });

    assert.equal(objectCalls[0].method, 'updateById');
    assert.equal(objectCalls[0].args.object, 'journeyGoals');
  });

  test('remove deletes a journeyGoals record by id', async () => {
    const { fakeSdk, objectCalls } = buildFakeSdk();

    await journeys(fakeSdk).goals.remove('jng-1');

    assert.equal(objectCalls[0].method, 'deleteById');
    assert.equal(objectCalls[0].args.object, 'journeyGoals');
  });
});

describe('JourneyMembersService.list', () => {
  test('GETs /journeys/:id/members with filter array joined', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await members(fakeSdk).list('jny-1', {
      page: 2,
      status: ['active', 'paused'],
    });

    assert.equal(calls[0].endpoint, '/journeys/jny-1/members');
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(calls[0].params.query, {
      page: 2,
      status: 'active,paused',
    });
  });
});

describe('JourneyMembersService.get', () => {
  test('GETs /journeys/:id/members/:memberId', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await members(fakeSdk).get('jny-1', 'jnm-1');

    assert.equal(calls[0].endpoint, '/journeys/jny-1/members/jnm-1');
    assert.equal(calls[0].method, 'GET');
  });
});

describe('JourneyMembersService.enroll', () => {
  test('POSTs /journeys/:id/members/enroll', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const body = { peopleIds: ['p-1'], source: 'manual', dryRun: true };

    await members(fakeSdk).enroll('jny-1', body);

    assert.equal(calls[0].endpoint, '/journeys/jny-1/members/enroll');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, body);
  });
});

describe('JourneyMembersService.actions', () => {
  test('POSTs /journeys/:id/members/actions', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const body = { action: 'pause', ids: ['jnm-1'] };

    await members(fakeSdk).actions('jny-1', body);

    assert.equal(calls[0].endpoint, '/journeys/jny-1/members/actions');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, body);
  });

  test('supports a filter-based bulk action', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await members(fakeSdk).actions('jny-1', {
      action: 'resume',
      filter: { status: ['paused'] },
    });

    assert.deepEqual(calls[0].params.body, {
      action: 'resume',
      filter: { status: ['paused'] },
    });
  });
});

describe('JourneyMembersService.fix', () => {
  test('POSTs /journeys/:id/members/:memberId/fix', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const body = { emailAddress: 'new@example.com', then: 'resume' };

    await members(fakeSdk).fix('jny-1', 'jnm-1', body);

    assert.equal(calls[0].endpoint, '/journeys/jny-1/members/jnm-1/fix');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, body);
  });
});

describe('JourneyMembersService.events', () => {
  test('GETs /journeys/:id/members/:memberId/events', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await members(fakeSdk).events('jny-1', 'jnm-1');

    assert.equal(calls[0].endpoint, '/journeys/jny-1/members/jnm-1/events');
    assert.equal(calls[0].method, 'GET');
  });
});
