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
	test('returns whatever the API sends, including unresolvedTags', async () => {
		const { fakeSdk } = buildFakeSdk();
		fakeSdk[Symbol.for('unbound.sdk.request')] = async () => ({
			subject: 'Hi Jane',
			html: '<p>Hello Jane</p>',
			text: 'Hello Jane',
			unresolvedTags: ['companyName'],
		});
		const svc = new EmailTemplatesService(fakeSdk);

		const preview = await svc.preview('tpl-1', {
			subject: 'Hi {{firstName}}',
			variables: { firstName: 'Jane' },
		});

		assert.deepEqual(preview.unresolvedTags, ['companyName']);
	});

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

describe('EmailTemplatesService.autosave', () => {
	test('POSTs /messaging/email/template/:id/autosave with { design }', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new EmailTemplatesService(fakeSdk);
		const design = { type: 'email', children: [] };

		await svc.autosave('tpl-1', { design });

		assert.equal(calls.length, 1);
		assert.equal(calls[0].endpoint, '/messaging/email/template/tpl-1/autosave');
		assert.equal(calls[0].method, 'POST');
		assert.deepEqual(calls[0].params, { body: { design } });
	});
});

describe('EmailTemplatesService.listVersions', () => {
	test('GETs /messaging/email/template/:id/versions', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new EmailTemplatesService(fakeSdk);

		await svc.listVersions('tpl-1');

		assert.equal(calls[0].endpoint, '/messaging/email/template/tpl-1/versions');
		assert.equal(calls[0].method, 'GET');
	});
});

describe('EmailTemplatesService.restoreVersion', () => {
	test('POSTs /messaging/email/template/:id/versions/:version/restore', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new EmailTemplatesService(fakeSdk);

		await svc.restoreVersion('tpl-1', 3);

		assert.equal(
			calls[0].endpoint,
			'/messaging/email/template/tpl-1/versions/3/restore',
		);
		assert.equal(calls[0].method, 'POST');
	});
});

describe('EmailTemplatesService.update', () => {
	test('PUTs defined fields including false usage flags; omits appearance', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new EmailTemplatesService(fakeSdk);
		const design = { type: 'email', children: [] };

		await svc.update('tpl-1', {
			design,
			allowOneOff: false,
			allowCampaign: true,
			html: '<p>Hi</p>',
			text: 'Hi',
			subject: 'Hello',
			name: 'Welcome',
			brandKitId: 'kit-1',
			category: 'welcome',
			variables: [{ key: 'firstName', label: 'First', type: 'text' }],
		});

		assert.equal(calls[0].endpoint, '/messaging/email/template/tpl-1');
		assert.equal(calls[0].method, 'PUT');
		assert.deepEqual(calls[0].params.body, {
			name: 'Welcome',
			subject: 'Hello',
			html: '<p>Hi</p>',
			text: 'Hi',
			variables: [{ key: 'firstName', label: 'First', type: 'text' }],
			design,
			allowOneOff: false,
			allowCampaign: true,
			brandKitId: 'kit-1',
			category: 'welcome',
		});
		assert.equal('appearance' in calls[0].params.body, false);
	});

	test('includes appearance when it is defined', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new EmailTemplatesService(fakeSdk);

		await svc.update('tpl-1', { appearance: 'client' });

		assert.deepEqual(calls[0].params.body, { appearance: 'client' });
	});
});

describe('EmailTemplatesService.create', () => {
	test('POSTs appearance, usage flags, and design with existing fields', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new EmailTemplatesService(fakeSdk);
		const design = { type: 'email', children: [] };

		await svc.create({
			name: 'Welcome',
			subject: 'Hi {{firstName}}',
			appearance: 'marketing',
			allowOneOff: true,
			allowCampaign: false,
			design,
			html: '<p>Hi</p>',
			text: 'Hi',
		});

		assert.equal(calls[0].endpoint, '/messaging/email/template');
		assert.equal(calls[0].method, 'POST');
		assert.deepEqual(calls[0].params.body, {
			name: 'Welcome',
			subject: 'Hi {{firstName}}',
			html: '<p>Hi</p>',
			text: 'Hi',
			design,
			appearance: 'marketing',
			allowOneOff: true,
			allowCampaign: false,
		});
	});
});

describe('EmailTemplatesService.list', () => {
	test('GETs /messaging/email/template with no query when unfiltered', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new EmailTemplatesService(fakeSdk);

		await svc.list();

		assert.equal(calls[0].endpoint, '/messaging/email/template');
		assert.equal(calls[0].method, 'GET');
		assert.equal(calls[0].params.query, undefined);
	});

	test('GETs with appearance / usage flag query string', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const svc = new EmailTemplatesService(fakeSdk);

		await svc.list({
			appearance: 'client',
			allowOneOff: true,
			allowCampaign: false,
		});

		assert.equal(calls[0].endpoint, '/messaging/email/template');
		assert.equal(calls[0].method, 'GET');
		assert.deepEqual(calls[0].params.query, {
			appearance: 'client',
			allowOneOff: true,
			allowCampaign: false,
		});
	});
});

