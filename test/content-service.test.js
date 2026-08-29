import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { ContentService } from '../services/content.js';

/**
 * Build a minimal SDK double that ContentService can call into. Captures
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

function content(fakeSdk) {
	return new ContentService(fakeSdk);
}

describe('ContentBlocksService.list', () => {
	test('GETs /content/blocks with no query when unfiltered', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await content(fakeSdk).blocks.list();

		assert.equal(calls[0].endpoint, '/content/blocks');
		assert.equal(calls[0].method, 'GET');
		assert.equal(calls[0].params.query, undefined);
	});

	test('GETs with channel / category / isSynced query', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await content(fakeSdk).blocks.list({
			channel: 'email',
			category: 'header',
			isSynced: true,
		});

		assert.equal(calls[0].method, 'GET');
		assert.deepEqual(calls[0].params.query, {
			channel: 'email',
			category: 'header',
			isSynced: true,
		});
	});
});

describe('ContentBlocksService.create', () => {
	test('POSTs /content/blocks with defined fields', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const design = { type: 'column', children: [] };

		await content(fakeSdk).blocks.create({
			name: 'Header',
			channel: 'email',
			isSynced: true,
			design,
			category: undefined,
		});

		assert.equal(calls[0].endpoint, '/content/blocks');
		assert.equal(calls[0].method, 'POST');
		assert.deepEqual(calls[0].params.body, {
			name: 'Header',
			channel: 'email',
			isSynced: true,
			design,
		});
	});
});

describe('ContentBlocksService.get', () => {
	test('GETs /content/blocks/:id', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await content(fakeSdk).blocks.get('blk-1');

		assert.equal(calls[0].endpoint, '/content/blocks/blk-1');
		assert.equal(calls[0].method, 'GET');
	});
});

describe('ContentBlocksService.update', () => {
	test('PUTs /content/blocks/:id with defined fields', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await content(fakeSdk).blocks.update('blk-1', {
			name: 'Renamed',
			isSynced: false,
			design: undefined,
		});

		assert.equal(calls[0].endpoint, '/content/blocks/blk-1');
		assert.equal(calls[0].method, 'PUT');
		assert.deepEqual(calls[0].params.body, {
			name: 'Renamed',
			isSynced: false,
		});
	});
});

describe('ContentBlocksService.delete', () => {
	test('DELETEs /content/blocks/:id', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await content(fakeSdk).blocks.delete('blk-1');

		assert.equal(calls[0].endpoint, '/content/blocks/blk-1');
		assert.equal(calls[0].method, 'DELETE');
	});
});

describe('ContentLibraryService.list', () => {
	test('GETs /content/library with appearance / usage filters', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await content(fakeSdk).library.list({
			appearance: 'marketing',
			isPublished: true,
			category: 'welcome',
		});

		assert.equal(calls[0].endpoint, '/content/library');
		assert.equal(calls[0].method, 'GET');
		assert.deepEqual(calls[0].params.query, {
			category: 'welcome',
			appearance: 'marketing',
			isPublished: true,
		});
	});
});

describe('ContentLibraryService.get', () => {
	test('GETs /content/library/:id', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await content(fakeSdk).library.get('lib-1');

		assert.equal(calls[0].endpoint, '/content/library/lib-1');
		assert.equal(calls[0].method, 'GET');
	});
});

describe('ContentLibraryService.create', () => {
	test('POSTs /content/library with defined fields', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await content(fakeSdk).library.create({
			name: 'Welcome',
			appearance: 'client',
			allowOneOff: true,
		});

		assert.equal(calls[0].endpoint, '/content/library');
		assert.equal(calls[0].method, 'POST');
		assert.deepEqual(calls[0].params.body, {
			name: 'Welcome',
			appearance: 'client',
			allowOneOff: true,
		});
	});
});

describe('ContentStockService.search', () => {
	test('searchUnsplash GETs /content/stock/unsplash?q&page', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await content(fakeSdk).stock.searchUnsplash({ q: 'cat', page: 2 });

		assert.equal(calls[0].endpoint, '/content/stock/unsplash');
		assert.equal(calls[0].method, 'GET');
		assert.deepEqual(calls[0].params.query, { q: 'cat', page: 2 });
	});

	test('searchPexels GETs /content/stock/pexels', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await content(fakeSdk).stock.searchPexels({ q: 'dog' });

		assert.equal(calls[0].endpoint, '/content/stock/pexels');
		assert.equal(calls[0].method, 'GET');
		assert.deepEqual(calls[0].params.query, { q: 'dog' });
	});

	test('searchGiphy GETs /content/stock/giphy', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await content(fakeSdk).stock.searchGiphy({ q: 'wave' });

		assert.equal(calls[0].endpoint, '/content/stock/giphy');
		assert.equal(calls[0].method, 'GET');
		assert.deepEqual(calls[0].params.query, { q: 'wave' });
	});
});

describe('ContentStockService.import', () => {
	test('POSTs /content/stock/import with source + remoteId', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await content(fakeSdk).stock.import({
			source: 'unsplash',
			remoteId: 'abc',
		});

		assert.equal(calls[0].endpoint, '/content/stock/import');
		assert.equal(calls[0].method, 'POST');
		assert.deepEqual(calls[0].params.body, {
			source: 'unsplash',
			remoteId: 'abc',
		});
	});

	test('POSTs import with url instead of remoteId', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await content(fakeSdk).stock.import({
			source: 'pexels',
			url: 'https://images.example/x.jpg',
		});

		assert.deepEqual(calls[0].params.body, {
			source: 'pexels',
			url: 'https://images.example/x.jpg',
		});
	});
});
