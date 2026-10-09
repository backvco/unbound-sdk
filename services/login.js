import { internalRequest } from '../base.js';
export class LoginService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async login(username, password, namespace) {
    this.sdk.validateParams(
      { username, password },
      {
        username: { type: 'string', required: true },
        password: { type: 'string', required: true },
        namespace: { type: 'string', required: false },
      },
    );

    const options = {
      body: { username, password, tokenType: 'cookie', namespace },
    };

    const login = await internalRequest(this.sdk, '/login', 'POST', options, true);

    if (typeof window !== 'undefined') {
      const canUseLocalStorage = typeof localStorage !== 'undefined';
      if (login?.namespace && canUseLocalStorage) {
        localStorage.setItem('unbound_url', login.url);
        localStorage.setItem('unbound_userId', login.userId);
        localStorage.setItem('unbound_namespace', login.namespace);
      }
    }

    // api#222: bearer clients get refreshToken back on /login too (same
    // contract as /login/refresh) -- seed it onto the sdk instance so
    // autoRefresh has something to send on the very first refresh, and
    // also return it for a caller that manages the token itself.
    if (login?.refreshToken) this.sdk.setRefreshToken(login.refreshToken);

    return {
      valid: true,
      userId: login.userId,
      namespace: login.namespace,
      url: login.url,
      refreshToken: login.refreshToken,
    };
  }

  // api#222. Cookie clients: no args -- the refreshToken cookie is sent
  // automatically and the new authToken/refreshToken cookies come back on
  // the response, nothing to apply to the SDK instance. Bearer clients:
  // pass the refresh token string; the response's `token` is returned so
  // the caller (or lib/refreshInterceptor.js) can call sdk.setToken(token).
  // Always forceFetch (true): refresh exists to recover a dead session, so
  // it must never ride a socket transport that itself depends on that
  // session still being alive.
  async refresh(refreshToken) {
    const options = {};
    if (refreshToken) options.body = { refreshToken };
    return internalRequest(this.sdk, '/login/refresh', 'POST', options, true);
  }

  async logout() {
    const logout = await internalRequest(this.sdk, '/login', 'DELETE', {}, true);

    if (typeof window !== 'undefined') {
      const canUseLocalStorage = typeof localStorage !== 'undefined';
      if (canUseLocalStorage) {
        localStorage.removeItem('unbound_url');
        localStorage.removeItem('unbound_userId');
        localStorage.removeItem('unbound_namespace');
      }
    }

    return true;
  }

  async validate(forceFetch = true) {
    console.log('login :: validate :: forceFetch', forceFetch);
    const options = {};
    const validation = await internalRequest(this.sdk, 
      '/login/validate',
      'POST',
      options,
      forceFetch,
    );
    return validation;
  }

  async changePassword(newPassword) {
    this.sdk.validateParams(
      { newPassword },
      {
        newPassword: { type: 'string', required: true },
      },
    );

    const options = {
      body: { password: newPassword },
    };

    const result = await internalRequest(this.sdk, 
      '/login/changePassword',
      'PUT',
      options,
    );
    return result;
  }

  async getPasswordRequirements() {
    const result = await internalRequest(this.sdk, 
      '/login/passwordRequirements',
      'GET',
      {},
    );
    return result;
  }

  async validatePasswordStrength(password) {
    this.sdk.validateParams(
      { password },
      {
        password: { type: 'string', required: true },
      },
    );

    const options = {
      body: { password },
    };

    const result = await internalRequest(this.sdk, 
      '/login/validatePasswordStrength',
      'POST',
      options,
    );
    return result;
  }

  async forgotPassword(email) {
    this.sdk.validateParams(
      { email },
      {
        email: { type: 'string', required: true },
      },
    );

    const options = {
      body: { email },
    };

    const result = await internalRequest(this.sdk,
      '/login/forgotPassword',
      'POST',
      options,
      true,
    );
    return result;
  }

  /**
   * User sessions (one row per refresh-token family). userId defaults to
   * the caller; passing someone else's userId requires the caller to hold
   * admin:user:manage AND that user to be in the caller's own account --
   * the API 403s otherwise.
   * @param {object} [params]
   * @param {string} [params.userId] -- defaults to the caller
   * @param {boolean} [params.includeClosed] -- also return closed
   *   (revoked/expired) sessions from the last 30 days
   * @returns {Promise<{ sessions: Array<object> }>}
   */
  async listSessions({ userId, includeClosed } = {}) {
    const query = {};
    if (userId) query.userId = userId;
    if (includeClosed) query.includeClosed = true;

    const options = { query };
    const result = await internalRequest(this.sdk,
      '/login/sessions',
      'GET',
      options,
    );
    return result;
  }

  /**
   * Revoke a single session (refresh-token family) by id.
   * @param {string} sessionId
   * @param {object} [params]
   * @param {string} [params.userId] -- defaults to the caller; same
   *   self-or-admin-same-account rule as listSessions
   * @returns {Promise<{ revoked: boolean, id: string, current: boolean }>}
   */
  async revokeSession(sessionId, { userId } = {}) {
    this.sdk.validateParams(
      { sessionId },
      {
        sessionId: { type: 'string', required: true },
      },
    );

    const options = {};
    if (userId) options.body = { userId };

    const result = await internalRequest(this.sdk,
      `/login/sessions/${sessionId}`,
      'DELETE',
      options,
    );
    return result;
  }

  /**
   * Revoke every live session for a user.
   * @param {object} [params]
   * @param {string} [params.userId] -- defaults to the caller
   * @param {boolean} [params.keepCurrent] -- when acting on your own
   *   sessions, leave the session you're calling from untouched
   * @returns {Promise<{ revoked: number }>}
   */
  async revokeAllSessions({ userId, keepCurrent } = {}) {
    const body = {};
    if (userId) body.userId = userId;
    if (keepCurrent) body.keepCurrent = true;

    const options = { body };
    const result = await internalRequest(this.sdk,
      '/login/sessions/revoke-all',
      'POST',
      options,
    );
    return result;
  }
}
