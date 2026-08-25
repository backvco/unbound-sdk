import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { StorageService } from '../services/storage.js';
import { DriveService } from '../services/drive.js';

/**
 * Build a minimal SDK double that services can call into. Captures
 * request calls for inspection. Mirrors test/layouts-service.test.js.
 */
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
    return { ok: true };
  };
  return { fakeSdk, calls };
}

describe('StorageService.listFiles', () => {
  test('GETs /storage/files with relatedId/folderId/search/page/sortBy in query', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new StorageService(fakeSdk);

    const options = {
      relatedId: 'rec-1',
      folderId: 'fold-1',
      search: 'invoice',
      page: 2,
      sortBy: 'fileName',
    };
    await svc.listFiles(options);

    assert.equal(calls.length, 1);
    assert.equal(calls[0].endpoint, '/storage/files');
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(calls[0].params, { query: options });
    assert.equal(calls[0].params.query.relatedId, 'rec-1');
    assert.equal(calls[0].params.query.folderId, 'fold-1');
    assert.equal(calls[0].params.query.search, 'invoice');
    assert.equal(calls[0].params.query.page, 2);
    assert.equal(calls[0].params.query.sortBy, 'fileName');
  });
});

describe('StorageService.listFolders', () => {
  test('GETs /storage/folders with relatedId, parentId, search query', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new StorageService(fakeSdk);

    await svc.listFolders({
      relatedId: 'rec-1',
      parentId: 'fold-1',
      search: 'docs',
    });

    assert.equal(calls.length, 1);
    assert.equal(calls[0].endpoint, '/storage/folders');
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(calls[0].params, {
      query: { relatedId: 'rec-1', parentId: 'fold-1', search: 'docs' },
    });
  });
});

describe('StorageService.createFolder', () => {
  test('POSTs /storage/folders with relatedId, parentId, name', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new StorageService(fakeSdk);

    await svc.createFolder({
      relatedId: 'rec-1',
      parentId: 'fold-1',
      name: 'Invoices',
    });

    assert.equal(calls[0].endpoint, '/storage/folders');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params, {
      body: { relatedId: 'rec-1', parentId: 'fold-1', name: 'Invoices' },
    });
  });
});

describe('StorageService.updateFolder', () => {
  test('PATCHes /storage/folders/:id with relatedId, name, parentId', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new StorageService(fakeSdk);

    await svc.updateFolder('fold-2', {
      relatedId: 'rec-1',
      name: 'Archive',
      parentId: 'fold-1',
    });

    assert.equal(calls[0].endpoint, '/storage/folders/fold-2');
    assert.equal(calls[0].method, 'PATCH');
    assert.deepEqual(calls[0].params, {
      body: { relatedId: 'rec-1', name: 'Archive', parentId: 'fold-1' },
    });
  });
});

describe('StorageService.deleteFolder', () => {
  test('DELETEs /storage/folders/:id with relatedId query', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new StorageService(fakeSdk);

    await svc.deleteFolder('fold-2', { relatedId: 'rec-1' });

    assert.equal(calls[0].endpoint, '/storage/folders/fold-2');
    assert.equal(calls[0].method, 'DELETE');
    assert.deepEqual(calls[0].params, { query: { relatedId: 'rec-1' } });
  });
});

describe('StorageService.moveFiles', () => {
  test('PATCHes /storage/files/move with ids, folderId, relatedId', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new StorageService(fakeSdk);

    await svc.moveFiles({
      ids: ['file-1', 'file-2'],
      folderId: 'fold-1',
      relatedId: 'rec-1',
    });

    assert.equal(calls[0].endpoint, '/storage/files/move');
    assert.equal(calls[0].method, 'PATCH');
    assert.deepEqual(calls[0].params, {
      body: {
        ids: ['file-1', 'file-2'],
        folderId: 'fold-1',
        relatedId: 'rec-1',
      },
    });
  });
});

describe('StorageService.updateFileMetadata', () => {
  test('PATCHes /storage/files/:id with fileName, folderId, relatedId', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new StorageService(fakeSdk);

    await svc.updateFileMetadata('file-1', {
      fileName: 'renamed.pdf',
      folderId: 'fold-1',
      relatedId: 'rec-1',
    });

    assert.equal(calls[0].endpoint, '/storage/files/file-1');
    assert.equal(calls[0].method, 'PATCH');
    assert.deepEqual(calls[0].params, {
      body: {
        fileName: 'renamed.pdf',
        folderId: 'fold-1',
        relatedId: 'rec-1',
      },
    });
  });
});

describe('DriveService.status', () => {
  test('GETs /drive/status', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new DriveService(fakeSdk);

    await svc.status();

    assert.equal(calls.length, 1);
    assert.equal(calls[0].endpoint, '/drive/status');
    assert.equal(calls[0].method, 'GET');
  });
});

describe('DriveService.listFiles', () => {
  test('GETs /drive/files with folderId, search, page, pageSize query', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new DriveService(fakeSdk);

    await svc.listFiles({
      folderId: 'gfold-1',
      search: 'notes',
      page: 1,
      pageSize: 50,
    });

    assert.equal(calls[0].endpoint, '/drive/files');
    assert.equal(calls[0].method, 'GET');
    assert.deepEqual(calls[0].params, {
      query: {
        folderId: 'gfold-1',
        search: 'notes',
        page: 1,
        pageSize: 50,
      },
    });
  });
});

describe('DriveService.createFolder', () => {
  test('POSTs /drive/folders with name and parentId', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new DriveService(fakeSdk);

    await svc.createFolder({ name: 'Meetings', parentId: 'gfold-1' });

    assert.equal(calls[0].endpoint, '/drive/folders');
    assert.equal(calls[0].method, 'POST');
    assert.deepEqual(calls[0].params, {
      body: { name: 'Meetings', parentId: 'gfold-1' },
    });
  });
});

describe('DriveService.browserToken', () => {
  test('POSTs /drive/browserToken', async () => {
    const { fakeSdk, calls } = buildFakeSdk();
    const svc = new DriveService(fakeSdk);

    await svc.browserToken();

    assert.equal(calls[0].endpoint, '/drive/browserToken');
    assert.equal(calls[0].method, 'POST');
  });
});
