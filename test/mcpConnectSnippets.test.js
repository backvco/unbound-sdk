import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { buildMcpConnectSnippets } from '../lib/mcpConnectSnippets.js';

const ARGS = { namespace: 'masterc', apiHost: 'dev-d01.app1svc.com', token: 'abc.def.ghi' };

describe('buildMcpConnectSnippets', () => {
  test('returns the clients in §5 order, each with the required fields', () => {
    const rows = buildMcpConnectSnippets(ARGS);
    assert.deepEqual(
      rows.map((r) => r.id),
      [
        'claude-code',
        'cursor',
        'vscode',
        'windsurf',
        'claude-desktop',
        'claude-connector',
        'chatgpt',
        'grok',
        'generic-rest',
      ],
    );
    for (const row of rows) {
      assert.equal(typeof row.id, 'string');
      assert.equal(typeof row.client, 'string');
      assert.equal(typeof row.mechanism, 'string');
      assert.equal(typeof row.note, 'string');
      assert.equal(typeof row.language, 'string');
      assert.equal(typeof row.snippet, 'string');
    }
  });

  test('Claude Code snippet carries the http transport, namespaced server name, url and bearer header', () => {
    const [row] = buildMcpConnectSnippets(ARGS);
    assert.match(row.snippet, /^claude mcp add --transport http unbound-masterc /);
    assert.match(row.snippet, /https:\/\/masterc\.api\.dev-d01\.app1svc\.com\/mcp/);
    assert.match(row.snippet, /Authorization: Bearer abc\.def\.ghi/);
  });

  test('Cursor / VS Code / Windsurf use their own field names, not a shared shape', () => {
    const rows = buildMcpConnectSnippets(ARGS);
    const cursor = JSON.parse(rows.find((r) => r.id === 'cursor').snippet);
    const vscode = JSON.parse(rows.find((r) => r.id === 'vscode').snippet);
    const windsurf = JSON.parse(rows.find((r) => r.id === 'windsurf').snippet);

    assert.ok(cursor.mcpServers['unbound-masterc'].url);
    assert.equal(cursor.mcpServers['unbound-masterc'].headers.Authorization, 'Bearer abc.def.ghi');

    assert.equal(vscode.servers['unbound-masterc'].type, 'http');
    assert.ok(vscode.servers['unbound-masterc'].url);
    assert.equal(vscode.servers['unbound-masterc'].headers.Authorization, 'Bearer abc.def.ghi');

    assert.ok(windsurf.mcpServers['unbound-masterc'].serverUrl);
    assert.equal(windsurf.mcpServers['unbound-masterc'].headers.Authorization, 'Bearer abc.def.ghi');
  });

  test('Claude Desktop passes the header via env, never inline in args', () => {
    const rows = buildMcpConnectSnippets(ARGS);
    const desktop = JSON.parse(rows.find((r) => r.id === 'claude-desktop').snippet);
    const cfg = desktop.mcpServers['unbound-masterc'];
    assert.equal(cfg.command, 'npx');
    assert.deepEqual(cfg.args, [
      '-y',
      'mcp-remote@latest',
      'https://masterc.api.dev-d01.app1svc.com/mcp',
      '--header',
      'Authorization:${AUTH_HEADER}',
    ]);
    assert.equal(cfg.env.AUTH_HEADER, 'Bearer abc.def.ghi');
    assert.ok(cfg.args.every((a) => !a.includes('Bearer')));
    assert.match(rows.find((r) => r.id === 'claude-desktop').note, /env/);
  });

  test('ChatGPT connectors row is disabled with the OAuth note; Claude.ai connector is not disabled', () => {
    const rows = buildMcpConnectSnippets(ARGS);
    const chatgpt = rows.find((r) => r.id === 'chatgpt');
    const claudeConnector = rows.find((r) => r.id === 'claude-connector');
    assert.equal(chatgpt.disabled, true);
    assert.match(chatgpt.note, /OAuth/);
    assert.equal(claudeConnector.disabled, undefined);
    assert.match(claudeConnector.note, /Owner/);
  });

  test('Grok row posts to the xAI Responses API with an mcp tool and a required server_label', () => {
    const rows = buildMcpConnectSnippets(ARGS);
    const grok = rows.find((r) => r.id === 'grok');
    assert.match(grok.snippet, /https:\/\/api\.x\.ai\/v1\/responses/);
    assert.match(grok.snippet, /"type":"mcp"/);
    assert.match(grok.snippet, /"server_label":"unbound-masterc"/);
    assert.match(grok.snippet, /"authorization":"Bearer abc\.def\.ghi"/);
  });

  test('Generic REST row calls the REST twin with a bearer header', () => {
    const rows = buildMcpConnectSnippets(ARGS);
    const rest = rows.find((r) => r.id === 'generic-rest');
    assert.match(rest.snippet, /\/workflows\/tools\/<slug>\/call/);
    assert.match(rest.snippet, /Authorization: Bearer abc\.def\.ghi/);
  });

  test('null token falls back to the placeholder everywhere', () => {
    const rows = buildMcpConnectSnippets({ ...ARGS, token: null });
    const claudeCode = rows.find((r) => r.id === 'claude-code');
    assert.match(claudeCode.snippet, /Bearer <your mcp token>/);
    const desktop = JSON.parse(rows.find((r) => r.id === 'claude-desktop').snippet);
    assert.equal(desktop.mcpServers['unbound-masterc'].env.AUTH_HEADER, 'Bearer <your mcp token>');
  });
});
