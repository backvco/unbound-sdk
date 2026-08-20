import { internalRequest } from '../base.js';
export class SipEndpointsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Create a new SIP endpoint
   * @param {Object} options - The endpoint configuration
   * @param {string} options.recordTypeId - Record type ID for permissions
   * @param {string} options.userId - User ID to associate with this endpoint
   * @param {string} options.type - Endpoint type: 'webRtc' or 'ipPhone'
   * @param {string} options.name - Endpoint name
   * @param {string} options.macAddress - MAC address for ipPhone type
   * @param {Object} options - Additional provisioning fields (timezone, vlanId, etc.)
   * @returns {Promise<Object>} Created endpoint
   */
  async create(options) {
    const {
      recordTypeId,
      userId,
      type,
      name,
      macAddress,
      useSecureCalling,
      ...provisioningFields
    } = options;

    this.sdk.validateParams(
      { type, useSecureCalling },
      {
        type: { type: 'string', required: true },
        useSecureCalling: { type: 'boolean', required: false },
      },
    );

    const params = {
      body: {
        recordTypeId,
        userId,
        type,
        useSecureCalling,
        name,
        macAddress,
        ...provisioningFields, // Include all provisioning fields
      },
    };

    const result = await internalRequest(this.sdk, '/sipEndpoints', 'POST', params);
    return result;
  }

  /**
   * Get the authenticated user's WebRTC endpoint details
   * @returns {Promise<Object>} WebRTC endpoint configuration
   */
  async getWebRtcDetails() {
    const result = await internalRequest(this.sdk, '/sipEndpoints/webrtc', 'GET');
    return result;
  }

  /**
   * Update a SIP endpoint
   * @param {string} endpointId - The endpoint ID
   * @param {Object} options - The fields to update
   * @param {string} options.name - Endpoint name
   * @param {string} options.userId - User ID to associate with this endpoint
   * * @param {string} options.useSecureCalling - provision with TLS / secure calling
   * @param {string} options.macAddress - MAC address
   * @param {boolean} options.useIceAccelerator - Enable/disable ICE accelerator
   * @param {Object} options - Additional provisioning fields (timezone, vlanId, etc.)
   * @returns {Promise<Object>} Updated endpoint
   */
  async update(endpointId, options) {
    this.sdk.validateParams(
      { endpointId },
      {
        endpointId: { type: 'string', required: true },
      },
    );

    const params = {
      body: { ...options }, // Pass all options through
    };

    const result = await internalRequest(this.sdk, 
      `/sipEndpoints/${endpointId}`,
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Delete a SIP endpoint
   * @param {string} endpointId - The endpoint ID
   * @returns {Promise<Object>} Deletion result
   */
  async delete(endpointId) {
    this.sdk.validateParams(
      { endpointId },
      {
        endpointId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/sipEndpoints/${endpointId}`,
      'DELETE',
    );
    return result;
  }

  /**
   * Reboot a SIP endpoint (forces re-registration)
   * @param {string} endpointId - The endpoint ID
   * @returns {Promise<Object>} Reboot result
   */
  async reboot(endpointId) {
    this.sdk.validateParams(
      { endpointId },
      {
        endpointId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/sipEndpoints/${endpointId}/reboot`,
      'POST',
    );
    return result;
  }

  /**
   * Change the access secret for a SIP endpoint
   * @param {string} endpointId - The endpoint ID
   * @returns {Promise<Object>} New endpoint credentials
   */
  async changeAccessSecret(endpointId) {
    this.sdk.validateParams(
      { endpointId },
      {
        endpointId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/sipEndpoints/${endpointId}/secret`,
      'POST',
    );
    return result;
  }

  /**
   * Change the provisioning secret for a SIP endpoint
   * @param {string} endpointId - The endpoint ID
   * @returns {Promise<Object>} New endpoint credentials
   */
  async changeProvisioningSecret(endpointId) {
    this.sdk.validateParams(
      { endpointId },
      {
        endpointId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/sipEndpoints/${endpointId}/secret/provisioning`,
      'POST',
    );
    return result;
  }
}
