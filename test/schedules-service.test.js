import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { SchedulesService } from '../services/schedules/SchedulesService.js';

/**
 * Build a minimal SDK double that SchedulesService can call into. Captures
 * request calls for inspection. Mirrors test/brand-kits-service.test.js.
 */
function buildFakeSdk() {
  const calls = [];
  const fakeSdk = {
    validateParams: () => {}, // accept anything
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
  return { fakeSdk, calls };
}

function schedules(fakeSdk) {
  return new SchedulesService(fakeSdk);
}

describe('SchedulesService.list', () => {
  test('GETs /schedules', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await schedules(fakeSdk).list();

    assert.equal(calls.length, 1);
    assert.equal(calls[0].endpoint, '/schedules');
    assert.equal(calls[0].method, 'GET');
  });
});

describe('SchedulesService.get', () => {
  test('GETs /schedules/:id', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await schedules(fakeSdk).get('sch-1');

    assert.equal(calls[0].endpoint, '/schedules/sch-1');
    assert.equal(calls[0].method, 'GET');
  });
});

describe('SchedulesService.create', () => {
  test('POSTs /schedules with defined fields, including nested windows/closures', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const body = {
      name: 'Business hours',
      timezone: 'America/Denver',
      isAccountDefault: true,
      windows: [{ dayOfWeek: 1, startTime: '09:00', endTime: '17:00' }],
      closures: [{ name: 'New Year', kind: 'date', config: { date: '2027-01-01' } }],
    };

    await schedules(fakeSdk).create(body);

    assert.equal(calls[0].endpoint, '/schedules');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params, { body });
  });

  test('omits undefined fields from the body', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await schedules(fakeSdk).create({ name: 'Default', timezone: undefined });

    assert.deepEqual(calls[0].params.body, { name: 'Default' });
  });
});

describe('SchedulesService.update', () => {
  test('PATCHes /schedules/:id with defined fields', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await schedules(fakeSdk).update('sch-1', {
      name: 'Renamed',
      windows: undefined,
    });

    assert.equal(calls[0].endpoint, '/schedules/sch-1');
    assert.equal(calls[0].method, 'PATCH');
    assert.deepEqual(calls[0].params.body, { name: 'Renamed' });
  });
});

describe('SchedulesService.remove', () => {
  test('DELETEs /schedules/:id', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await schedules(fakeSdk).remove('sch-1');

    assert.equal(calls[0].endpoint, '/schedules/sch-1');
    assert.equal(calls[0].method, 'DELETE');
  });
});

describe('SchedulesService.setAssignment', () => {
  test('POSTs /schedules/:id/assignments with targetType/targetId', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await schedules(fakeSdk).setAssignment('sch-1', {
      targetType: 'user',
      targetId: 'usr-1',
    });

    assert.equal(calls[0].endpoint, '/schedules/sch-1/assignments');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, {
      targetType: 'user',
      targetId: 'usr-1',
    });
  });

  test('omits targetId for targetType account', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await schedules(fakeSdk).setAssignment('sch-1', { targetType: 'account' });

    assert.deepEqual(calls[0].params.body, { targetType: 'account' });
  });
});

describe('SchedulesService.clearAssignment', () => {
  test('DELETEs /schedules/:id/assignments/:assignmentId', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await schedules(fakeSdk).clearAssignment('sch-1', 'asn-1');

    assert.equal(calls[0].endpoint, '/schedules/sch-1/assignments/asn-1');
    assert.equal(calls[0].method, 'DELETE');
  });
});

describe('SchedulesService.usedBy', () => {
  test('GETs /schedules/:id/usedBy', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await schedules(fakeSdk).usedBy('sch-1');

    assert.equal(calls[0].endpoint, '/schedules/sch-1/usedBy');
    assert.equal(calls[0].method, 'GET');
  });
});

describe('SchedulesService.listHolidaySets', () => {
  test('GETs /schedules/holidaySets', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await schedules(fakeSdk).listHolidaySets();

    assert.equal(calls[0].endpoint, '/schedules/holidaySets');
    assert.equal(calls[0].method, 'GET');
  });
});

describe('SchedulesService.resolve', () => {
  test('GETs /schedules/resolve with only defined query params', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await schedules(fakeSdk).resolve({ userId: 'usr-1' });

    assert.equal(calls[0].endpoint, '/schedules/resolve');
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(calls[0].params.query, { userId: 'usr-1' });
  });

  test('supports scheduleId to resolve a specific schedule directly', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await schedules(fakeSdk).resolve({ scheduleId: 'sch-1' });

    assert.deepEqual(calls[0].params.query, { scheduleId: 'sch-1' });
  });

  test('defaults to an empty query', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await schedules(fakeSdk).resolve();

    assert.deepEqual(calls[0].params.query, {});
  });
});

describe('SchedulesService.isOpen', () => {
  test('GETs /schedules/isOpen with queueId/userId/scheduleId/at', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await schedules(fakeSdk).isOpen({
      queueId: 'q-1',
      at: '2026-11-02T19:00:00.000Z',
    });

    assert.equal(calls[0].endpoint, '/schedules/isOpen');
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(calls[0].params.query, {
      queueId: 'q-1',
      at: '2026-11-02T19:00:00.000Z',
    });
  });
});

describe('SchedulesService.nextOpen', () => {
  test('GETs /schedules/nextOpen with only defined query params', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await schedules(fakeSdk).nextOpen({ userId: 'usr-1' });

    assert.equal(calls[0].endpoint, '/schedules/nextOpen');
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(calls[0].params.query, { userId: 'usr-1' });
  });
});

describe('SchedulesService.simulate', () => {
  test('POSTs /schedules/simulate with defined fields', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const body = {
      scheduleId: 'sch-1',
      at: '2026-11-02T19:00:00.000Z',
      amount: 2,
      unit: 'hours',
    };

    await schedules(fakeSdk).simulate(body);

    assert.equal(calls[0].endpoint, '/schedules/simulate');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, body);
  });
});

describe('SchedulesService.timeOff.list', () => {
  test('GETs /schedules/timeOff with no query by default', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await schedules(fakeSdk).timeOff.list();

    assert.equal(calls[0].endpoint, '/schedules/timeOff');
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(calls[0].params.query, {});
  });

  test('GETs /schedules/timeOff?userId= for a direct report', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await schedules(fakeSdk).timeOff.list({ userId: 'usr-2' });

    assert.deepEqual(calls[0].params.query, { userId: 'usr-2' });
  });
});

describe('SchedulesService.timeOff.listTeam', () => {
  test('GETs /schedules/timeOff/team', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await schedules(fakeSdk).timeOff.listTeam();

    assert.equal(calls[0].endpoint, '/schedules/timeOff/team');
    assert.equal(calls[0].method, 'GET');
  });
});

describe('SchedulesService.timeOff.create', () => {
  test('POSTs /schedules/timeOff with defined fields', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const body = {
      startAt: '2026-11-10T00:00:00.000Z',
      endAt: '2026-11-12T00:00:00.000Z',
      kind: 'vacation',
    };

    await schedules(fakeSdk).timeOff.create(body);

    assert.equal(calls[0].endpoint, '/schedules/timeOff');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params.body, body);
  });
});

describe('SchedulesService.timeOff.update', () => {
  test('PATCHes /schedules/timeOff/:id with defined fields', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await schedules(fakeSdk).timeOff.update('to-1', {
      note: 'Rescheduled',
      kind: undefined,
    });

    assert.equal(calls[0].endpoint, '/schedules/timeOff/to-1');
    assert.equal(calls[0].method, 'PATCH');
    assert.deepEqual(calls[0].params.body, { note: 'Rescheduled' });
  });
});

describe('SchedulesService.timeOff.remove', () => {
  test('DELETEs /schedules/timeOff/:id', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await schedules(fakeSdk).timeOff.remove('to-1');

    assert.equal(calls[0].endpoint, '/schedules/timeOff/to-1');
    assert.equal(calls[0].method, 'DELETE');
  });
});

describe('SchedulesService.timeOff.isUserAway', () => {
  test('GETs /schedules/timeOff/isUserAway?userId=', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await schedules(fakeSdk).timeOff.isUserAway('usr-1');

    assert.equal(calls[0].endpoint, '/schedules/timeOff/isUserAway');
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(calls[0].params.query, { userId: 'usr-1' });
  });

  test('includes `at` when passed', async () => {
    const { fakeSdk, calls } = buildFakeSdk();

    await schedules(fakeSdk).timeOff.isUserAway(
      'usr-1',
      '2026-11-02T19:00:00.000Z',
    );

    assert.deepEqual(calls[0].params.query, {
      userId: 'usr-1',
      at: '2026-11-02T19:00:00.000Z',
    });
  });
});
