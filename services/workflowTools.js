import { internalRequest } from '../base.js';

// P5 "REST twin + SDK" / "Auth" rows: workflows.tools.{list,call} +
// workflows.mcpTokens.{create,list,revoke}. Kept in its own file (repo
// file-size convention) rather than growing workflows.js further.

export class WorkflowToolsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  // GET /workflows/tools -> [{name, description, inputSchema, outputSchema, annotations}]
  async list() {
    const result = await internalRequest(this.sdk, '/workflows/tools', 'GET');
    return result;
  }

  // POST /workflows/tools/:slug/call -> {completed, outputs, isError, message, sessionId}
  async call(slug, input) {
    this.sdk.validateParams(
      { slug },
      { slug: { type: 'string', required: true } },
    );

    const params = { body: { input: input || {} } };
    const result = await internalRequest(
      this.sdk,
      `/workflows/tools/${slug}/call`,
      'POST',
      params,
    );
    return result;
  }
}

export class WorkflowMcpTokensService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  // POST /workflows/mcp/tokens -> {id, token, name} -- `token` (the raw
  // JWT) is shown exactly once, never retrievable again.
  async create({ name } = {}) {
    const params = { body: name ? { name } : {} };
    const result = await internalRequest(
      this.sdk,
      '/workflows/mcp/tokens',
      'POST',
      params,
    );
    return result;
  }

  // GET /workflows/mcp/tokens -> {tokens: [{id, name, createdAt, lastUsedAt, revokedAt}]}
  async list() {
    const result = await internalRequest(this.sdk, '/workflows/mcp/tokens', 'GET');
    return result;
  }

  // DELETE /workflows/mcp/tokens/:id -> {id, revoked:true}
  async revoke(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );

    const result = await internalRequest(
      this.sdk,
      `/workflows/mcp/tokens/${id}`,
      'DELETE',
    );
    return result;
  }
}
