import { internalRequest } from '../base.js';
export class SubscriptionsService {
  constructor(sdk) {
    this.sdk = sdk;
    this.socket = new SocketSubscriptionsService(sdk);
  }
}

export class SocketSubscriptionsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async getConnection(sessionId) {
    this.sdk.validateParams(
      { sessionId },
      {
        sessionId: { type: 'string', required: false },
      },
    );

    const params = {
      query: {
        sessionId,
      },
    };

    const result = await internalRequest(this.sdk, 
      '/subscriptions/socket/connection',
      'GET',
      params,
    );
    return result;
  }

  async create(sessionId, subscriptionParams) {
    this.sdk.validateParams(
      { sessionId, subscriptionParams },
      {
        sessionId: { type: 'string', required: true },
        subscriptionParams: { type: 'object', required: true },
      },
    );

    const params = {
      body: {
        sessionId,
        ...subscriptionParams,
      },
    };

    let uri = `/subscriptions/socket/`;
    if (subscriptionParams?.id) {
      uri = `/subscriptions/socket/${subscriptionParams.id}`;
    }
    const result = await internalRequest(this.sdk, uri, 'POST', params);
    return result;
  }

  async delete(id, sessionId) {
    this.sdk.validateParams(
      { id, sessionId },
      {
        id: { type: 'string', required: false },
        sessionId: { type: 'string', required: true },
      },
    );

    const params = {
      body: {
        sessionId,
      },
    };

    const result = await internalRequest(this.sdk, 
      `/subscriptions/socket/${id}`,
      'DELETE',
      params,
    );
    return result;
  }
}
