import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { EmailTemplatesService } from '../services/messaging/EmailTemplatesService.js';

/**
 * Build a minimal SDK double that EmailTemplatesService can call into. Captures
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

describe('EmailTemplatesService.preview', () => {
	test('POSTs /messaging/email/template/:id/preview with the body', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new EmailTemplatesService(fakeSdk);

		await svc.preview('tpl-1', {
			subject: 'Hi {{firstName}}',
			html: '<p>Hello</p>',
			text: 'Hello',
			variables: { firstName: 'Jane' },
		});

		assert.equal(calls.length, 1);
		assert.equal(calls[0].endpoint, '/messaging/email/template/tpl-1/preview');
		assert.equal(calls[0].method, 'POST');
		assert.deepEqual(calls[0].params, {
			body: {
				subject: 'Hi {{firstName}}',
				html: '<p>Hello</p>',
				text: 'Hello',
				variables: { firstName: 'Jane' },
			},
		});
	});

	test('omits undefined draft fields from the body', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new EmailTemplatesService(fakeSdk);

		await svc.preview('tpl-1', { subject: 'Draft subject' });

		assert.deepEqual(calls[0].params, {
			body: { subject: 'Draft subject' },
		});
	});
});

describe('EmailTemplatesService.sendTest', () => {
	test('POSTs /messaging/email/template/:id/test with { to }', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new EmailTemplatesService(fakeSdk);

		await svc.sendTest('tpl-1', 'a@b.com');

		assert.equal(calls.length, 1);
		assert.equal(calls[0].endpoint, '/messaging/email/template/tpl-1/test');
		assert.equal(calls[0].method, 'POST');
		assert.deepEqual(calls[0].params, { body: { to: 'a@b.com' } });
	});

	test('includes optional extra fields with { to }', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new EmailTemplatesService(fakeSdk);

		await svc.sendTest('tpl-1', 'a@b.com', {
			from: 'noreply@example.com',
			subject: 'Test subject',
			html: '<p>Hi</p>',
			text: 'Hi',
			variables: { firstName: 'Jane' },
		});

		assert.equal(calls[0].endpoint, '/messaging/email/template/tpl-1/test');
		assert.equal(calls[0].method, 'POST');
		assert.deepEqual(calls[0].params, {
			body: {
				to: 'a@b.com',
				from: 'noreply@example.com',
				subject: 'Test subject',
				html: '<p>Hi</p>',
				text: 'Hi',
				variables: { firstName: 'Jane' },
			},
		});
	});

	test('sendTest requires to — request body always includes to', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new EmailTemplatesService(fakeSdk);

		await svc.sendTest('tpl-1', 'a@b.com');

		assert.equal(calls[0].params.body.to, 'a@b.com');
	});
});
