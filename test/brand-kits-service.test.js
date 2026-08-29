import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { BrandService } from '../services/brand.js';

/**
 * Build a minimal SDK double that BrandKitsService can call into. Captures
 * request calls for inspection. Mirrors test/branding-service.test.js.
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

function kits(fakeSdk) {
	return new BrandService(fakeSdk).kits;
}

describe('BrandKitsService.list', () => {
	test('GETs /brand/kits', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await kits(fakeSdk).list();

		assert.equal(calls.length, 1);
		assert.equal(calls[0].endpoint, '/brand/kits');
		assert.equal(calls[0].method, 'GET');
	});
});

describe('BrandKitsService.create', () => {
	test('POSTs /brand/kits with defined fields', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const body = {
			name: 'Default',
			logoStorageId: 'stor-1',
			colors: { primary: '#111' },
			isDefault: true,
		};

		await kits(fakeSdk).create(body);

		assert.equal(calls[0].endpoint, '/brand/kits');
		assert.equal(calls[0].method, 'POST');
		assert.deepEqual(calls[0].params, { body });
	});

	test('omits undefined fields from the body', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await kits(fakeSdk).create({ name: 'Kit', legalFooter: undefined });

		assert.deepEqual(calls[0].params.body, { name: 'Kit' });
	});
});

describe('BrandKitsService.get', () => {
	test('GETs /brand/kits/:id', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await kits(fakeSdk).get('kit-1');

		assert.equal(calls[0].endpoint, '/brand/kits/kit-1');
		assert.equal(calls[0].method, 'GET');
	});
});

describe('BrandKitsService.update', () => {
	test('PUTs /brand/kits/:id with defined fields', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await kits(fakeSdk).update('kit-1', {
			name: 'Renamed',
			websiteUrl: 'https://example.com',
			colors: undefined,
		});

		assert.equal(calls[0].endpoint, '/brand/kits/kit-1');
		assert.equal(calls[0].method, 'PUT');
		assert.deepEqual(calls[0].params.body, {
			name: 'Renamed',
			websiteUrl: 'https://example.com',
		});
	});
});

describe('BrandKitsService.delete', () => {
	test('DELETEs /brand/kits/:id', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await kits(fakeSdk).delete('kit-1');

		assert.equal(calls[0].endpoint, '/brand/kits/kit-1');
		assert.equal(calls[0].method, 'DELETE');
	});
});

describe('BrandKitsService.setDefault', () => {
	test('POSTs /brand/kits/:id/default', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await kits(fakeSdk).setDefault('kit-1');

		assert.equal(calls[0].endpoint, '/brand/kits/kit-1/default');
		assert.equal(calls[0].method, 'POST');
	});
});

describe('BrandKitsService.extract', () => {
	test('POSTs /brand/kits/extract with { url }', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await kits(fakeSdk).extract({ url: 'https://example.com' });

		assert.equal(calls[0].endpoint, '/brand/kits/extract');
		assert.equal(calls[0].method, 'POST');
		assert.deepEqual(calls[0].params, {
			body: { url: 'https://example.com' },
		});
	});
});
