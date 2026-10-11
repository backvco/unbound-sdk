import { internalRequest } from '../base.js';

// analytics-expansion live-testing fix: report-scoped users list beyond
// team members (Call log's Users filter). Own file (not reporting.js) same
// as ReportingMissedCallsService -- keeps reporting.js under the repo's
// 400-line limit.
export class ReportingUsersService {
  constructor(sdk) {
    this.sdk = sdk;
    this.scope = (...args) => this.getUsersScope(...args);
  }

  /**
   * Report-scoped users list beyond team members (analytics-expansion
   * live-testing fix -- Call log's Users filter).
   * @returns {Promise<Object>} { all: true } | { all: false, userIds: string[] }
   * @example
   * const { all, userIds } = await sdk.reporting.users.scope();
   */
  async getUsersScope() {
    return internalRequest(this.sdk, '/reporting/users/scope', 'GET');
  }
}
