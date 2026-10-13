// Shared MCP "Connect" snippet builder (mcp-tools-plan.md §5, D8). Pure, no
// network -- consumed by app1-client's Setup → MCP tools page and the
// app1-developer portal's Tools & Connect page so the two surfaces never
// drift on client wiring quirks (Cursor/VS Code/Windsurf header shape,
// Claude Desktop's env-var workaround, Grok's required server_label).
//
// `namespace` is the account subdomain (e.g. "masterc"); `apiHost` is the
// base domain the client already resolves for API calls (e.g.
// "dev-d01.app1svc.com", the same value other pages use as
// `$page.data.env.baseUrl`) -- this helper prepends `${namespace}.api.`
// itself, matching the existing `https://${namespace}.api.${envBaseUrl}/...`
// convention. `token` is the raw MCP bearer JWT shown once right after
// mint; pass null before a token exists and every snippet falls back to
// the literal placeholder `<your mcp token>`.

const PLACEHOLDER_TOKEN = '<your mcp token>';

function serverUrl(namespace, apiHost) {
  return `https://${namespace}.api.${apiHost}/mcp`;
}

function bearer(token) {
  return `Bearer ${token || PLACEHOLDER_TOKEN}`;
}

/**
 * @param {{namespace: string, apiHost: string, token: string|null}} args
 * @returns {Array<{id: string, client: string, mechanism: string, note: string, language: string, snippet: string, disabled?: boolean}>}
 */
export function buildMcpConnectSnippets({ namespace, apiHost, token } = {}) {
  const ns = namespace || '<namespace>';
  const host = apiHost || '<host>';
  const url = serverUrl(ns, host);
  const auth = bearer(token);
  const label = `unbound-${ns}`;

  return [
    {
      id: 'claude-code',
      client: 'Claude Code',
      mechanism: 'streamable HTTP + header',
      note: '',
      language: 'bash',
      snippet: `claude mcp add --transport http ${label} ${url} --header "Authorization: ${auth}"`,
    },
    {
      id: 'cursor',
      client: 'Cursor',
      mechanism: 'mcpServers + url + headers.Authorization',
      note: '',
      language: 'json',
      snippet: JSON.stringify(
        {
          mcpServers: {
            [label]: {
              url,
              headers: { Authorization: auth },
            },
          },
        },
        null,
        2,
      ),
    },
    {
      id: 'vscode',
      client: 'VS Code',
      mechanism: 'servers + type:http + headers',
      note: '',
      language: 'json',
      snippet: JSON.stringify(
        {
          servers: {
            [label]: {
              type: 'http',
              url,
              headers: { Authorization: auth },
            },
          },
        },
        null,
        2,
      ),
    },
    {
      id: 'windsurf',
      client: 'Windsurf',
      mechanism: 'serverUrl + headers',
      note: '',
      language: 'json',
      snippet: JSON.stringify(
        {
          mcpServers: {
            [label]: {
              serverUrl: url,
              headers: { Authorization: auth },
            },
          },
        },
        null,
        2,
      ),
    },
    {
      id: 'claude-desktop',
      client: 'Claude Desktop',
      mechanism: 'npx -y mcp-remote',
      note: 'Desktop splits args on spaces, so the Authorization header is passed via an env var instead of inline.',
      language: 'json',
      snippet: JSON.stringify(
        {
          mcpServers: {
            [label]: {
              command: 'npx',
              args: [
                '-y',
                'mcp-remote@latest',
                url,
                '--header',
                'Authorization:${AUTH_HEADER}',
              ],
              env: { AUTH_HEADER: auth },
            },
          },
        },
        null,
        2,
      ),
    },
    {
      id: 'claude-connector',
      client: 'Claude.ai custom connector',
      mechanism: 'static Authorization header',
      note: 'org Owner, beta; OAuth later',
      language: 'text',
      snippet: `URL: ${url}\nAuthorization: ${auth}`,
    },
    {
      id: 'chatgpt',
      client: 'ChatGPT connectors',
      mechanism: 'OAuth only',
      note: 'after OAuth',
      language: 'text',
      snippet: '',
      disabled: true,
    },
    {
      id: 'grok',
      client: 'Grok (xAI Responses API)',
      mechanism: 'tools:[{type:"mcp", ...}]',
      note: '',
      language: 'bash',
      snippet: `curl https://api.x.ai/v1/responses \\
  -H "Authorization: Bearer $XAI_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '${JSON.stringify(
    {
      model: 'grok-4',
      input: 'List the tools available to you.',
      tools: [
        {
          type: 'mcp',
          server_url: url,
          server_label: label,
          authorization: auth,
        },
      ],
    },
  )}'`,
    },
    {
      id: 'generic-rest',
      client: 'Generic REST',
      mechanism: 'REST twin',
      note: '',
      language: 'bash',
      snippet: `curl -X POST https://${ns}.api.${host}/workflows/tools/<slug>/call \\
  -H "Authorization: ${auth}" \\
  -H "Content-Type: application/json" \\
  -d '{"input": {}}'`,
    },
  ];
}

export default buildMcpConnectSnippets;
