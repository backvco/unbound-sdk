import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  DataImportService,
  DataExportService,
} from '../services/dataImport.js';

function buildFakeSdk() {
  const calls = [];
  const fakeSdk = {
    _fetch: async (endpoint, method, params, forceFetch) => {
      calls.push({ endpoint, method, params, forceFetch });
      return { ok: true };
    },
    validateParams: (params, schema) => {
      for (const key in schema) {
        if (params[key] === undefined && schema[key].required) {
          throw new Error(`Missing required parameter ${key}`);
        }
        if (params[key] !== undefined && params[key] !== null) {
          const expectedType = schema[key].type;
          const actualValue = params[key];
          const isValidType =
            expectedType === 'array'
              ? Array.isArray(actualValue)
              : typeof actualValue === expectedType;
          if (!isValidType) {
            throw new Error(
              `Invalid type for parameter ${key}: expected ${expectedType}`,
            );
          }
        }
      }
    },
  };
  return { fakeSdk, calls };
}

describe('DataImportService', () => {
  test('createJob POSTs /dataImport/jobs with body', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new DataImportService(fakeSdk);
    const body = { mappingId: 'map-1' };

    await svc.createJob(body);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].endpoint, '/dataImport/jobs');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params, { body });
  });

  test('getJob GETs /dataImport/jobs/:id', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new DataImportService(fakeSdk);

    await svc.getJob('job-1');

    assert.equal(calls[0].endpoint, '/dataImport/jobs/job-1');
    assert.equal(calls[0].method, 'GET');
  });

  test('getJob requires id', async () => {
    const { fakeSdk } = buildFakeSdk();
    const svc = new DataImportService(fakeSdk);
    await assert.rejects(() => svc.getJob(), /Missing required parameter id/);
  });

  test('listJobs GETs /dataImport/jobs with optional query', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new DataImportService(fakeSdk);

    await svc.listJobs();
    assert.equal(calls[0].endpoint, '/dataImport/jobs');
    assert.equal(calls[0].method, 'GET');
    assert.equal(calls[0].params, undefined);

    await svc.listJobs({ status: 'draft' });
    assert.deepEqual(calls[1].params, { query: { status: 'draft' } });
  });

  test('attachSource POSTs /dataImport/jobs/:id/sources', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new DataImportService(fakeSdk);
    const body = { storageId: 'st-1' };

    await svc.attachSource('job-1', body);

    assert.equal(calls[0].endpoint, '/dataImport/jobs/job-1/sources');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params, { body });
  });

  test('preview POSTs /dataImport/jobs/:id/preview', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new DataImportService(fakeSdk);
    const body = { limit: 10 };

    await svc.preview('job-1', body);

    assert.equal(calls[0].endpoint, '/dataImport/jobs/job-1/preview');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params, { body });
  });

  test('start POSTs /dataImport/jobs/:id/start with optional body', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new DataImportService(fakeSdk);

    await svc.start('job-1');
    assert.equal(calls[0].endpoint, '/dataImport/jobs/job-1/start');
    assert.equal(calls[0].method, 'POST');
    assert.equal(calls[0].params, undefined);

    await svc.start('job-1', { errorMode: 'stop' });
    assert.deepEqual(calls[1].params, { body: { errorMode: 'stop' } });
  });

  test('pause/resume/cancel POST the matching job action', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new DataImportService(fakeSdk);

    await svc.pause('job-1');
    await svc.resume('job-1');
    await svc.cancel('job-1');

    assert.equal(calls[0].endpoint, '/dataImport/jobs/job-1/pause');
    assert.equal(calls[0].method, 'POST');
    assert.equal(calls[1].endpoint, '/dataImport/jobs/job-1/resume');
    assert.equal(calls[1].method, 'POST');
    assert.equal(calls[2].endpoint, '/dataImport/jobs/job-1/cancel');
    assert.equal(calls[2].method, 'POST');
  });

  test('listRows GETs /dataImport/jobs/:id/rows with optional query', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new DataImportService(fakeSdk);

    await svc.listRows('job-1');
    assert.equal(calls[0].endpoint, '/dataImport/jobs/job-1/rows');
    assert.equal(calls[0].method, 'GET');

    await svc.listRows('job-1', { status: 'error' });
    assert.deepEqual(calls[1].params, { query: { status: 'error' } });
  });

  test('resolveRow POSTs /dataImport/jobs/:id/rows/:rowId/resolve', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new DataImportService(fakeSdk);
    const body = { action: 'skip' };

    await svc.resolveRow('job-1', 'row-9', body);

    assert.equal(
      calls[0].endpoint,
      '/dataImport/jobs/job-1/rows/row-9/resolve',
    );
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params, { body });
  });

  test('resolveRow requires jobId and rowId', async () => {
    const { fakeSdk } = buildFakeSdk();
    const svc = new DataImportService(fakeSdk);
    await assert.rejects(
      () => svc.resolveRow(undefined, 'row-9', {}),
      /Missing required parameter jobId/,
    );
    await assert.rejects(
      () => svc.resolveRow('job-1', undefined, {}),
      /Missing required parameter rowId/,
    );
  });

  test('download GETs /dataImport/jobs/:id/download', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new DataImportService(fakeSdk);

    await svc.download('job-1');

    assert.equal(calls[0].endpoint, '/dataImport/jobs/job-1/download');
    assert.equal(calls[0].method, 'GET');
  });

  test('mapping CRUD uses /dataImport/mappings', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new DataImportService(fakeSdk);
    const body = { name: 'People' };

    await svc.createMapping(body);
    await svc.listMappings();
    await svc.getMapping('map-1');
    await svc.updateMapping('map-1', { name: 'People v2' });

    assert.equal(calls[0].endpoint, '/dataImport/mappings');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params, { body });
    assert.equal(calls[1].endpoint, '/dataImport/mappings');
    assert.equal(calls[1].method, 'GET');
    assert.equal(calls[2].endpoint, '/dataImport/mappings/map-1');
    assert.equal(calls[2].method, 'GET');
    assert.equal(calls[3].endpoint, '/dataImport/mappings/map-1');
    assert.equal(calls[3].method, 'PUT');
    assert.deepEqual(calls[3].params, { body: { name: 'People v2' } });
  });

  test('does not expose worker control methods', () => {
    const { fakeSdk } = buildFakeSdk();
    const svc = new DataImportService(fakeSdk);
    for (const name of [
      'claim',
      'heartbeat',
      'checkpoint',
      'finish',
      'token',
    ]) {
      assert.equal(typeof svc[name], 'undefined', name);
    }
  });
});

describe('DataExportService', () => {
  test('createJob POSTs /dataImport/jobs with mode=export merged', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new DataExportService(fakeSdk);

    await svc.createJob({ object: 'people', format: 'csv' });

    assert.equal(calls[0].endpoint, '/dataImport/jobs');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params, {
      body: { object: 'people', format: 'csv', mode: 'export' },
    });
  });

  test('download GETs /dataImport/jobs/:id/download', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new DataExportService(fakeSdk);

    await svc.download('job-1');

    assert.equal(calls[0].endpoint, '/dataImport/jobs/job-1/download');
    assert.equal(calls[0].method, 'GET');
  });

  test('createJob forces mode=export over a caller value', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new DataExportService(fakeSdk);

    await svc.createJob({ mode: 'import' });

    assert.equal(calls[0].params.body.mode, 'export');
  });
});
