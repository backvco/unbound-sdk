import { internalRequest } from '../../base.js';

// phoneNumbers/order.js :: order/remove methods :: buying + releasing numbers, bulk carrier auto-create
export const orderMethods = {
  async order({ phoneNumbers, name }) {
    this.sdk.validateParams(
      { phoneNumbers },
      {
        phoneNumbers: { type: 'array', required: true },
        name: { type: 'string', required: false },
      },
    );

    const orderData = { phoneNumbers };
    if (name) orderData.name = name;

    const params = {
      body: orderData,
    };

    const result = await internalRequest(this.sdk, '/phoneNumbers/order', 'POST', params);
    return result;
  },

  async remove(phoneNumber) {
    this.sdk.validateParams(
      { phoneNumber },
      {
        phoneNumber: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk,
      `/phoneNumbers/${phoneNumber}`,
      'DELETE',
    );
    return result;
  },

  /**
   * Auto-create porting orders by grouping phone numbers by carrier
   *
   * Analyzes phone numbers using internal LRN lookup, groups them by carrier,
   * and either previews the groupings (dry run) or creates separate porting
   * orders for each carrier group.
   *
   * @param {Object} params
   * @param {string[]} params.phoneNumbers - Array of +E.164 formatted phone numbers (max 100)
   * @param {string} params.name - Base name for orders (will be appended with carrier names)
   * @param {boolean} [params.dryRun=false] - If true, returns preview without creating orders
   * @returns {Promise<Object>} Carrier groups and creation results
   * @example
   * // Preview carrier groupings
   * const preview = await sdk.phoneNumbers.autoCreateOrders({
   *   phoneNumbers: ['+15551234567', '+15551234568', '+15551234569'],
   *   name: 'Q1 2025 Port',
   *   dryRun: true
   * });
   * // Returns carrier groups with proposed order names
   *
   * // Create orders for each carrier
   * const result = await sdk.phoneNumbers.autoCreateOrders({
   *   phoneNumbers: ['+15551234567', '+15551234568', '+15551234569'],
   *   name: 'Q1 2025 Port',
   *   dryRun: false
   * });
   * // Returns created orders and any errors
   */
  async autoCreateOrders({ phoneNumbers, name, dryRun = false }) {
    this.sdk.validateParams(
      { phoneNumbers, name },
      {
        phoneNumbers: { type: 'array', required: true },
        name: { type: 'string', required: true },
        dryRun: { type: 'boolean', required: false },
      },
    );

    const result = await internalRequest(this.sdk,
      '/phoneNumbers/porting/auto-create-orders',
      'POST',
      {
        body: { phoneNumbers, name, dryRun },
      },
    );
    return result;
  },
};
