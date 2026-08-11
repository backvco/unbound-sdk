/* eslint-disable indent */
/* eslint-disable prettier/prettier */

/*
 * Base SDK Class with Transport Plugin System
 *
 * Optional Dependencies:
 * - mime-types: For accurate MIME type detection (automatically imported if available)
 *
 * This package is optional and the SDK will gracefully fall back to built-in MIME type
 * detection if not installed. For best MIME type accuracy, it's recommended to install:
 *
 * npm install mime-types
 */

export class BaseSDK {
  constructor(options = {}) {
    // Support both object and legacy positional parameters for backwards compatibility
    if (typeof options === 'string') {
      // Legacy positional parameters: (namespace, callId, token, fwRequestId)
      this.namespace = options || process?.env?.namespace;
      this.callId = arguments[1];
      this.token = arguments[2];
      this.fwRequestId = arguments[3];
    } else {
      // New object-based parameters
      const { namespace, callId, token, fwRequestId, baseURL } = options;
      this.namespace = namespace || process?.env?.namespace;
      this.callId = callId;
      this.token = token;
      this.fwRequestId = fwRequestId;
      this._constructorBaseURL = baseURL;
    }
    this.baseURL;
    this.transports = new Map();
    this.debugMode = false;
    this._initializeEnvironment();
  }

  _initializeEnvironment() {
    const defaultDomain = 'api.unbound.cx';

    if (typeof window === 'undefined') {
      // Server-side (Node.js)
      this.environment = 'node';
      this.baseURL = this._constructorBaseURL || `https://${this.namespace ? this.namespace : 'login'}.${
        process.env?.API_BASE_URL || defaultDomain
      }`;
    } else {
      // Client-side (browser)
      this.environment = 'browser';
      if (this._constructorBaseURL) {
        // Use the baseURL passed to the constructor
        this.baseURL = this._constructorBaseURL;
        // Extract baseUrl for setNamespace compatibility
        const url = new URL(this._constructorBaseURL);
        this.baseUrl = url.hostname.replace(/^[^.]+\./, '');
      } else {
        this.baseUrl =
          this.baseUrl || process?.env?.API_BASE_URL || defaultDomain;
        if (this.baseUrl && !this.baseUrl.startsWith('api.')) {
          this.baseUrl = `api.${this.baseUrl}`;
        }
      }
      this.setNamespace(this.namespace);
    }
  }

  setToken(token) {
    this.token = token;
  }

  setNamespace(namespace) {
    this.namespace = namespace;
    const defaultDomain = 'api.unbound.cx';

    if (this.environment === 'node') {
      if (!this._constructorBaseURL) {
        this.baseURL = `https://${this.namespace ? this.namespace : 'login'}.${
          process.env?.API_BASE_URL || defaultDomain
        }`;
      }
    } else {
      this.fullUrl = `https://${this.namespace}.${this.baseUrl}`;
    }
  }

  debug(enabled = true) {
    this.debugMode = enabled;
    return this;
  }

  addTransport(transport) {
    if (!transport || typeof transport.request !== 'function') {
      throw new Error('Transport must have a request method');
    }

    // Transport plugins must follow these rules:
    // 1. RETURN API responses normally (including error status codes like 400, 500)
    // 2. ONLY THROW exceptions for transport mechanism failures (connection issues, plugin errors)
    // This ensures API errors flow through unchanged, same as built-in fetch

    const priority = transport.getPriority ? transport.getPriority() : 50;
    const name = transport.name || `transport_${Date.now()}`;

    this.transports.set(name, {
      transport,
      priority,
    });
  }

  removeTransport(name) {
    this.transports.delete(name);
  }

  _getJsonSafely(str, defaultValue) {
    try {
      return JSON.parse(str);
    } catch (e) {
      return defaultValue;
    }
  }

  async _getAvailableTransport(forceFetch = false) {
    if (forceFetch) {
      return null; // Use built-in HTTP
    }

    // Sort transports by priority (lower number = higher priority)
    const sortedTransports = Array.from(this.transports.values()).sort(
      (a, b) => a.priority - b.priority,
    );

    for (const { transport } of sortedTransports) {
      try {
        if (transport.isAvailable && (await transport.isAvailable())) {
          return transport;
        }
      } catch (err) {
        console.debug(
          `Transport ${transport.name} not available:`,
          err.message,
        );
        continue;
      }
    }

    return null; // Fall back to HTTP
  }

  validateParams(params, schema) {
    for (const key in schema) {
      if (params[key] === undefined && schema[key].required) {
        throw new Error(`Missing required parameter ${key}`);
      }

      if (params[key] !== undefined && params[key] !== null) {
        const expectedType = schema[key].type;
        const actualValue = params[key];
        let isValidType = false;

        if (expectedType === 'array') {
          isValidType = Array.isArray(actualValue);
        } else {
          isValidType = typeof actualValue === expectedType;
        }

        if (!isValidType) {
          const actualType = Array.isArray(actualValue)
            ? 'array'
            : typeof actualValue;
          throw new Error(
            `Invalid type for parameter ${key}: expected ${expectedType}, got ${actualType}`,
          );
        }
      }
    }
  }

  async _fetch(endpoint, method, params = {}, forceFetch = false) {
    const startTime = Date.now();
    const { body, query, headers = {}, returnRawResponse = false } = params;

    this.validateParams(
      { endpoint, method, body, query, headers, returnRawResponse },
      {
        endpoint: { type: 'string', required: true },
        method: { type: 'string', required: true },
        body: { type: 'object', required: false },
        query: { type: 'object', required: false },
        headers: { type: 'object', required: false },
        returnRawResponse: { type: 'boolean', required: false },
      },
    );

    // Add auth headers
    if (this.token) {
      headers.Authorization = `Bearer ${this.token}`;
    }
    if (this.fwRequestId) {
      headers['x-request-id-fw'] = this.fwRequestId;
    }
    if (this.callId) {
      headers['x-call-id'] = this.callId;
    }

    params.headers = headers;

    // Try transport plugins first
    const transport = await this._getAvailableTransport(forceFetch);
    let response;
    if (transport) {
      try {
        response = await transport.request(endpoint, method, params, {
          namespace: this.namespace,
          token: this.token,
          callId: this.callId,
          fwRequestId: this.fwRequestId,
          baseURL: this.baseURL || this.fullUrl,
        });
      } catch (err) {
        // IMPORTANT: This catch block should ONLY handle transport-level failures
        // (e.g., WebSocket disconnected, plugin unavailable, network errors)
        //
        // Transport plugins should:
        // - RETURN API error responses normally (400, 500, etc.) as response objects
        // - ONLY THROW for transport mechanism failures

        console.warn(
          `Transport ${transport.name} mechanism failed, falling back to HTTP:`,
          err.message,
        );

        // Built-in HTTP transport (fallback)
        return this._httpRequest(
          endpoint,
          method,
          params,
          returnRawResponse,
          startTime,
        );
      }
    } else {
      // No transport available, fallback to HTTP
      if (forceFetch && process.env.AUTH_V3_TOKEN_TYPE_OVERRIDE) {
        params.headers['x-token-type-override'] =
          process.env.AUTH_V3_TOKEN_TYPE_OVERRIDE;
      }
      return this._httpRequest(
        endpoint,
        method,
        params,
        returnRawResponse,
        startTime,
      );
    }

    // For streaming requests, return the raw response from transports
    if (returnRawResponse) {
      return response;
    }

    const duration = Date.now() - startTime;
    return this._processResponse(
      response,
      transport.name,
      method,
      endpoint,
      duration,
    );
  }

  _isMultipartBody(body) {
    // Check if body is FormData or multipart content
    if (!body) return false;

    // Browser FormData
    if (typeof FormData !== 'undefined' && body instanceof FormData) {
      return true;
    }

    // Node.js Buffer (our manual multipart construction)
    if (typeof Buffer !== 'undefined' && Buffer.isBuffer(body)) {
      return true;
    }

    // Uint8Array (fallback multipart construction)
    if (body instanceof Uint8Array) {
      return true;
    }

    // String-based multipart (check for multipart boundaries)
    if (
      typeof body === 'string' &&
      body.includes('Content-Disposition: form-data')
    ) {
      return true;
    }

    // Streaming bodies (Node Readable or Web ReadableStream) — caller is
    // expected to set an explicit content-type header alongside.
    if (
      typeof body === 'object' &&
      body !== null &&
      (typeof body.pipe === 'function' ||
        typeof body.getReader === 'function')
    ) {
      return true;
    }

    return false;
  }

  async _httpRequest(
    endpoint,
    method,
    params = {},
    returnRawResponse = false,
    startTime = Date.now(),
  ) {
    const { body, query, headers = {} } = params;

    const options = {
      method,
      headers: {
        // Smart content-type detection based on actual body content
        ...(this._isMultipartBody(body) ||
        headers?.['Content-Type'] ||
        headers?.['content-type']
          ? {}
          : { 'Content-Type': 'application/json' }),
        ...headers,
      },
    };

    // Set credentials for browser environment
    if (this.environment === 'browser') {
      options.credentials = 'include';
    }

    let url;
    if (this.environment === 'node') {
      url = `${this.baseURL}${endpoint}`;
    } else {
      url = `${this.fullUrl}${endpoint}`;
    }

    // Add query parameters
    if (query) {
      const params = new URLSearchParams(query).toString();
      url += `?${params}`;
    }

    // Handle body
    if (options.method.toLowerCase() === 'get') {
      delete options.body;
    } else if (body) {
      // For FormData or Buffer, pass directly without JSON.stringify
      const isFormData =
        body &&
        (body.constructor.name === 'FormData' ||
          typeof body.getBoundary === 'function');
      const isBuffer =
        typeof Buffer !== 'undefined' &&
        Buffer.isBuffer &&
        Buffer.isBuffer(body);
      const isStream =
        body &&
        typeof body === 'object' &&
        (typeof body.pipe === 'function' ||
          typeof body.getReader === 'function');

      if (isFormData || isBuffer) {
        options.body = body;
      } else if (isStream) {
        // Node 18+ native fetch (undici) requires duplex: 'half' for
        // streaming request bodies. Without this the fetch throws
        // synchronously before the first byte is sent.
        options.body = body;
        options.duplex = 'half';
      } else {
        options.body = JSON.stringify(body);
      }
    }

    const response = await fetch(url, options);
    const duration = Date.now() - startTime;

    // For streaming requests, return the raw fetch response
    if (returnRawResponse) {
      return response;
    }

    return this._processResponse(response, 'https', method, endpoint, duration);
  }

  async _processResponse(response, transport, method, endpoint, duration = 0) {
    // Check if the response indicates an HTTP error
    // These are API/configuration errors, not transport failures

    const responseHeaders = response.headers;
    const responseRequestId =
      responseHeaders?.get?.('x-request-id') ||
      responseHeaders?.['x-request-id'] ||
      '';

    const contentType =
      responseHeaders?.get?.('content-type') ||
      response?.headers?.['content-type'] ||
      'application/json';

    if (!response.ok) {
      let errorBody;
      if (response?.body) {
        errorBody = response.body;
      } else if (response?.headers?.['content-type']) {
        try {
          if (
            typeof response?.json === 'function' ||
            typeof response?.text === 'function'
          ) {
            if (contentType.includes('application/json')) {
              errorBody = await response.json();
            } else if (contentType.includes('text/')) {
              errorBody = await response.text();
            }
          } else {
            if (contentType.includes('application/json')) {
              errorBody = this._getJsonSafely(
                response?.body,
                response?.body || {},
              );
            } else if (contentType.includes('text/')) {
              errorBody = response?.body || '';
            }
          }
          if (!errorBody) {
            errorBody = `HTTP ${response.status} ${response.statusText}`;
          }
        } catch (parseError) {
          errorBody = `HTTP ${response.status} ${response.statusText}`;
        }
      } else {
        errorBody = `HTTP ${response.status} ${response.statusText}`;
      }

      // Create a structured error for API/HTTP failures
      const httpError = new Error(
        `API :: Error :: ${transport} :: ${method.toUpperCase()} :: ${endpoint} :: ${
          response.status
        } :: ${response.statusText}`,
      );
      httpError.status = response.status;
      httpError.statusText = response.statusText;
      httpError.method = method;
      httpError.endpoint = endpoint;
      httpError.body = errorBody;
      httpError.message = errorBody?.error || errorBody?.message || 'API Error';

      // Debug logging for successful HTTP requests
      if (this.debugMode) {
        console.log(
          `API :: ERROR :: ${transport} :: ${method.toUpperCase()} :: ${
            this.baseURL
          }${endpoint} :: ${
            response?.status
          } :: ${responseRequestId} :: ${duration}ms`,
          httpError,
        );
      }

      throw httpError;
    }

    let responseBody;
    if (response?.body && !contentType) {
      responseBody = response.body;
    } else if (contentType) {
      try {
        if (transport === 'https') {
          if (contentType.includes('application/json')) {
            responseBody = await response.json();
          } else if (contentType.includes('text/')) {
            responseBody = await response.text();
          } else {
            responseBody = await response.arrayBuffer();
          }
        } else {
          if (contentType.includes('application/json')) {
            responseBody = this._getJsonSafely(response.body, response.body);
          } else if (contentType.includes('text/')) {
            responseBody = response?.body || '';
          }
        }
        if (!responseBody) {
          responseBody = {};
        }
      } catch (parseError) {
        responseBody = {};
      }
    } else {
      responseBody = {};
    }

    // Debug logging for successful HTTP requests
    if (this.debugMode) {
      console.log(
        `API :: ${transport} :: ${method.toUpperCase()} :: ${
          this.baseURL
        }${endpoint} :: ${
          response?.status
        } :: ${responseRequestId} :: ${duration}ms`,
      );
    }

    return responseBody;
  }
}
