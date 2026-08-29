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
