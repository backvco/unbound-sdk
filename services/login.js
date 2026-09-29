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

    return {
      valid: true,
      userId: login.userId,
      namespace: login.namespace,
      url: login.url,
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
}
