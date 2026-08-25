import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { LayoutsService } from '../services/layouts.js';

/**
 * Build a minimal SDK double that the LayoutsService can call into. Captures
 * request calls for inspection. Mirrors test/video-service.test.js.
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

describe('LayoutsService.clone', () => {
	test('POSTs /layouts/:id/clone with name in body', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new LayoutsService(fakeSdk);

		await svc.clone('layout-1', { name: 'Copy of Layout' });

		assert.equal(calls.length, 1);
		assert.equal(calls[0].endpoint, '/layouts/layout-1/clone');
		assert.equal(calls[0].method, 'POST');
		assert.deepEqual(calls[0].params, { body: { name: 'Copy of Layout' } });
	});

	test('works without a name (server assigns default)', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new LayoutsService(fakeSdk);

		await svc.clone('layout-1');

		assert.equal(calls[0].endpoint, '/layouts/layout-1/clone');
		assert.equal(calls[0].method, 'POST');
		assert.deepEqual(calls[0].params, { body: { name: undefined } });
	});
});

describe('LayoutsService.getSystemSource', () => {
	test('GETs /layouts/:id/system-source', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new LayoutsService(fakeSdk);

		await svc.getSystemSource('layout-1');

		assert.equal(calls.length, 1);
		assert.equal(calls[0].endpoint, '/layouts/layout-1/system-source');
		assert.equal(calls[0].method, 'GET');
		assert.deepEqual(calls[0].params, {});
	});
});

describe('LayoutsService.create', () => {
	test('passes through tier and sourceLayoutId in the body', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new LayoutsService(fakeSdk);

		const layout = {
			objectName: 'company', type: 'detail', tier: 'tenant', sourceLayoutId: 'sys-layout-1',
		};
		await svc.create(layout);

		assert.equal(calls[0].endpoint, '/layouts/');
		assert.equal(calls[0].method, 'POST');
		assert.deepEqual(calls[0].params, { body: layout });
		assert.equal(calls[0].params.body.tier, 'tenant');
		assert.equal(calls[0].params.body.sourceLayoutId, 'sys-layout-1');
	});
});
