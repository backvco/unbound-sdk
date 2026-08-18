export class ExternalOAuthService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async create({ name, provider, scopes, credentials, configuration }) {
    this.sdk.validateParams(
      { name, provider, scopes },
      {
        name: { type: 'string', required: true },
        provider: { type: 'string', required: true },
        scopes: { type: 'array', required: true },
        credentials: { type: 'object', required: false },
        configuration: { type: 'object', required: false },
      },
    );

    const oauthData = { name, provider, scopes };
    if (credentials) oauthData.credentials = credentials;
    if (configuration) oauthData.configuration = configuration;

    const params = {
      body: oauthData,
    };

    const result = await this.sdk._fetch('/externalOAuth', 'POST', params);
    return result;
  }

  async update(id, { name, scopes, credentials, configuration }) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
        name: { type: 'string', required: false },
        scopes: { type: 'array', required: false },
        credentials: { type: 'object', required: false },
        configuration: { type: 'object', required: false },
      },
    );

    const updateData = {};
    if (name) updateData.name = name;
    if (scopes) updateData.scopes = scopes;
    if (credentials) updateData.credentials = credentials;
    if (configuration) updateData.configuration = configuration;

    const params = {
      body: updateData,
    };

    const result = await this.sdk._fetch(`/externalOAuth/${id}`, 'PUT', params);
    return result;
  }

  async delete(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const result = await this.sdk._fetch(`/externalOAuth/${id}`, 'DELETE');
    return result;
  }

  async get(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const result = await this.sdk._fetch(`/externalOAuth/${id}`, 'GET');
    return result;
  }

  async getByName(name) {
    this.sdk.validateParams(
      { name },
      {
        name: { type: 'string', required: true },
      },
    );

    const params = {
      query: { name },
    };

    const result = await this.sdk._fetch(
      '/externalOAuth/byName',
      'GET',
      params,
    );
    return result;
  }

  async getByScopeAndProvider(scope, provider) {
    this.sdk.validateParams(
      { scope, provider },
      {
        scope: { type: 'string', required: true },
        provider: { type: 'string', required: true },
      },
    );

    const params = {
      query: { scope, provider },
    };

    const result = await this.sdk._fetch(
      '/externalOAuth/byScopeAndProvider',
      'GET',
      params,
    );
    return result;
  }

  async list() {
    const result = await this.sdk._fetch('/externalOAuth', 'GET');
    return result;
  }

  async listUnified() {
    const result = await this.sdk._fetch('/externalOAuth/unified', 'GET');
    return result;
  }

  async providers() {
    const result = await this.sdk._fetch('/externalOAuth/providers', 'GET');
    return result;
  }

  async authorize({
    name,
    provider,
    clientId,
    clientSecret,
    scopes,
    authorizationUrl,
    tokenUrl,
    fromConnectionId,
  }) {
    this.sdk.validateParams(
      { name, provider },
      {
        name: { type: 'string', required: true },
        provider: { type: 'string', required: true },
        clientId: { type: 'string', required: false },
        clientSecret: { type: 'string', required: false },
        scopes: { type: 'array', required: false },
        authorizationUrl: { type: 'string', required: false },
        tokenUrl: { type: 'string', required: false },
        fromConnectionId: { type: 'string', required: false },
      },
    );

    const body = { name, provider };
    if (clientId) body.clientId = clientId;
    if (clientSecret) body.clientSecret = clientSecret;
    if (scopes) body.scopes = scopes;
    if (authorizationUrl) body.authorizationUrl = authorizationUrl;
    if (tokenUrl) body.tokenUrl = tokenUrl;
    if (fromConnectionId) body.fromConnectionId = fromConnectionId;

    const result = await this.sdk._fetch('/externalOAuth/authorize', 'POST', {
      body,
    });
    return result;
  }

  /**
   * Check whether a connection can be used for a purpose (e.g. Google Ads / Meta ads).
   *
   * @param {string} id
   * @param {object} [args]
   * @param {string} [args.purpose='googleAds']
   * @returns {Promise<object>}
   */
  async verify(id, { purpose = 'googleAds' } = {}) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );

    return this.sdk._fetch(`/externalOAuth/${id}/verify`, 'POST', {
      body: { purpose },
    });
  }
}
