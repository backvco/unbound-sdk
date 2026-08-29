import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { BrandingService } from '../services/branding.js';

/**
 * Build a minimal SDK double that BrandingService can call into. Captures
 * request calls for inspection. Mirrors test/layouts-service.test.js.
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

describe('BrandingService.current', () => {
	test('GETs /branding/current with no body', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new BrandingService(fakeSdk);

		await svc.current();

		assert.equal(calls.length, 1);
		assert.equal(calls[0].endpoint, '/branding/current');
		assert.equal(calls[0].method, 'GET');
	});
});

describe('BrandingService.get', () => {
	test('GETs /branding/:id', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new BrandingService(fakeSdk);

		await svc.get('brand-1');

		assert.equal(calls[0].endpoint, '/branding/brand-1');
		assert.equal(calls[0].method, 'GET');
	});
});

describe('BrandingService.update', () => {
	test('PATCHes /branding/:id with the patch body', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new BrandingService(fakeSdk);

		await svc.update('brand-1', { displayName: 'Acme' });

		assert.equal(calls[0].endpoint, '/branding/brand-1');
		assert.equal(calls[0].method, 'PATCH');
		assert.deepEqual(calls[0].params, { body: { displayName: 'Acme' } });
	});
});

describe('BrandingService.uploadLogo', () => {
	test('POSTs /branding/:id/logos/:kind with a Node multipart Buffer body, forceFetch', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new BrandingService(fakeSdk);

		await svc.uploadLogo('brand-1', 'icon', {
			buffer: Buffer.from('fake-png-bytes'),
			originalname: 'icon.png',
			mimetype: 'image/png',
		});

		assert.equal(calls[0].endpoint, '/branding/brand-1/logos/icon');
		assert.equal(calls[0].method, 'POST');
		assert.equal(calls[0].forceFetch, true);
		assert.ok(Buffer.isBuffer(calls[0].params.body));
		assert.match(
			calls[0].params.headers['content-type'],
			/^multipart\/form-data; boundary=/,
		);
		assert.match(
			calls[0].params.body.toString('utf8'),
			/name="file"; filename="icon.png"/,
		);
	});

	test('accepts a plain Buffer with a generic filename', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new BrandingService(fakeSdk);

		await svc.uploadLogo('brand-1', 'main', Buffer.from('fake-bytes'));

		assert.match(
			calls[0].params.body.toString('utf8'),
			/name="file"; filename="logo"/,
		);
	});

	test('rejects an invalid kind', async () => {
		const { fakeSdk } = buildFakeSdk();
		const svc = new BrandingService(fakeSdk);

		await assert.rejects(() =>
			svc.uploadLogo('brand-1', 'banner', Buffer.from('x')),
		);
	});
});

describe('BrandingService.verifyDomain', () => {
	test('POSTs /branding/:id/domains/verify', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new BrandingService(fakeSdk);

		await svc.verifyDomain('brand-1');

		assert.equal(calls[0].endpoint, '/branding/brand-1/domains/verify');
		assert.equal(calls[0].method, 'POST');
	});
});

describe('BrandingService.accounts', () => {
	test('GETs /branding/:id/accounts', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new BrandingService(fakeSdk);

		await svc.accounts('brand-1');

		assert.equal(calls[0].endpoint, '/branding/brand-1/accounts');
		assert.equal(calls[0].method, 'GET');
	});
});

describe('BrandingService.emailTemplates', () => {
	test('list() GETs /branding/:id/email-templates', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new BrandingService(fakeSdk);

		await svc.emailTemplates.list('brand-1');

		assert.equal(calls[0].endpoint, '/branding/brand-1/email-templates');
		assert.equal(calls[0].method, 'GET');
	});

	test('get() GETs /branding/:id/email-templates/:type', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new BrandingService(fakeSdk);

		await svc.emailTemplates.get('brand-1', 'newUser');

		assert.equal(
			calls[0].endpoint,
			'/branding/brand-1/email-templates/newUser',
		);
		assert.equal(calls[0].method, 'GET');
	});

	test('update() PUTs /branding/:id/email-templates/:type with the body', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new BrandingService(fakeSdk);

		await svc.emailTemplates.update('brand-1', 'newUser', {
			subject: 'Welcome!',
		});

		assert.equal(
			calls[0].endpoint,
			'/branding/brand-1/email-templates/newUser',
		);
		assert.equal(calls[0].method, 'PUT');
		assert.deepEqual(calls[0].params, { body: { subject: 'Welcome!' } });
	});

	test('reset() DELETEs /branding/:id/email-templates/:type', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new BrandingService(fakeSdk);

		await svc.emailTemplates.reset('brand-1', 'newUser');

		assert.equal(
			calls[0].endpoint,
			'/branding/brand-1/email-templates/newUser',
		);
		assert.equal(calls[0].method, 'DELETE');
	});

	test('preview() POSTs /branding/:id/email-templates/:type/preview with the draft body', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new BrandingService(fakeSdk);

		await svc.emailTemplates.preview('brand-1', 'newUser', {
			subject: 'Draft subject',
		});

		assert.equal(
			calls[0].endpoint,
			'/branding/brand-1/email-templates/newUser/preview',
		);
		assert.equal(calls[0].method, 'POST');
		assert.deepEqual(calls[0].params, {
			body: { subject: 'Draft subject' },
		});
	});

	test('sendTest() POSTs /branding/:id/email-templates/:type/test with { to }', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new BrandingService(fakeSdk);

		await svc.emailTemplates.sendTest('brand-1', 'newUser', 'a@b.com');

		assert.equal(
			calls[0].endpoint,
			'/branding/brand-1/email-templates/newUser/test',
		);
		assert.equal(calls[0].method, 'POST');
		assert.deepEqual(calls[0].params, { body: { to: 'a@b.com' } });
	});
});
