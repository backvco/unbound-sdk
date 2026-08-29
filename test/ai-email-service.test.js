import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { AIService } from '../services/ai.js';
import { EmailService } from '../services/ai/email.js';

/**
 * Build a minimal SDK double that EmailService can call into. Captures
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

function email(fakeSdk) {
	return new AIService(fakeSdk).email;
}

describe('AIService.email', () => {
	test('is an EmailService on AIService', () => {
		const { fakeSdk } = buildFakeSdk();
		const svc = new AIService(fakeSdk);
		assert.ok(svc.email instanceof EmailService);
	});
});

describe('EmailService.generate', () => {
	test('POSTs /ai/email/generate with defined fields', async () => {
		const { fakeSdk, calls } = buildFakeSdk();
		const tree = { type: 'email', children: [] };

		await email(fakeSdk).generate({
			prompt: 'Welcome series',
			brandKitId: 'kit-1',
			appearance: 'marketing',
			tree,
		});

		assert.equal(calls.length, 1);
		assert.equal(calls[0].endpoint, '/ai/email/generate');
		assert.equal(calls[0].method, 'POST');
		assert.deepEqual(calls[0].params.body, {
			prompt: 'Welcome series',
			brandKitId: 'kit-1',
			appearance: 'marketing',
			tree,
		});
	});

	test('omits undefined fields from the body', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await email(fakeSdk).generate({
			prompt: 'Follow up',
			brandKitId: undefined,
			appearance: undefined,
			tree: undefined,
		});

		assert.deepEqual(calls[0].params.body, { prompt: 'Follow up' });
	});
});

describe('EmailService.rewrite', () => {
	test('POSTs /ai/email/rewrite with defined fields', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await email(fakeSdk).rewrite({
			text: 'Hello there',
			instruction: 'translate',
			lang: 'es',
		});

		assert.equal(calls[0].endpoint, '/ai/email/rewrite');
		assert.equal(calls[0].method, 'POST');
		assert.deepEqual(calls[0].params.body, {
			text: 'Hello there',
			instruction: 'translate',
			lang: 'es',
		});
	});

	test('omits undefined lang from the body', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await email(fakeSdk).rewrite({
			text: 'Hello there',
			instruction: 'shorten',
			lang: undefined,
		});

		assert.deepEqual(calls[0].params.body, {
			text: 'Hello there',
			instruction: 'shorten',
		});
	});
});

describe('EmailService.subjects', () => {
	test('POSTs /ai/email/subjects with defined fields', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await email(fakeSdk).subjects({
			html: '<p>Hi</p>',
			prompt: 'Welcome',
			n: 3,
		});

		assert.equal(calls[0].endpoint, '/ai/email/subjects');
		assert.equal(calls[0].method, 'POST');
		assert.deepEqual(calls[0].params.body, {
			html: '<p>Hi</p>',
			prompt: 'Welcome',
			n: 3,
		});
	});

	test('omits undefined fields from the body', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await email(fakeSdk).subjects({ prompt: 'Welcome', html: undefined });

		assert.deepEqual(calls[0].params.body, { prompt: 'Welcome' });
	});
});

describe('EmailService.altText', () => {
	test('POSTs /ai/email/alt-text with defined fields', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await email(fakeSdk).altText({
			imageUrl: 'https://cdn.example.com/hero.png',
			description: 'Product hero',
		});

		assert.equal(calls[0].endpoint, '/ai/email/alt-text');
		assert.equal(calls[0].method, 'POST');
		assert.deepEqual(calls[0].params.body, {
			imageUrl: 'https://cdn.example.com/hero.png',
			description: 'Product hero',
		});
	});

	test('omits undefined fields from the body', async () => {
		const { fakeSdk, calls } = buildFakeSdk();

		await email(fakeSdk).altText({ description: 'A logo' });

		assert.deepEqual(calls[0].params.body, { description: 'A logo' });
	});
});
