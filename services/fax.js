import { internalRequest } from '../base.js';
export class FaxService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Create an inbound fax document record with status 'receiving'.
   * Called by the media manager when an inbound fax is first detected.
   * After the fax is fully received, call sdk.fax.status() to update
   * with the final storage IDs and completion metadata.
   *
   * @param {Object} options - Parameters
   * @param {string} options.faxMailboxId - ID of the fax mailbox receiving the fax (required)
   * @param {string} [options.sipCallId] - SIP call correlation ID
   * @param {string} [options.name] - Display name for the fax document
   * @param {string} [options.faxHeader] - TSI header string from the sender
   * @param {string} [options.resolution] - Fax resolution (e.g. 'fine', 'standard')
   * @param {string} [options.toNumber] - Destination number in E.164 format
   * @param {string} [options.fromNumber] - Sender number in E.164 format
   * @returns {Promise<Object>} Created fax document
   * @returns {string} result.id - The fax document ID (use in subsequent status calls)
   * @returns {string} result.status - 'receiving'
   *
   * @example
   * const { id } = await sdk.fax.receive({
   *   faxMailboxId: '157abc123...',
   *   sipCallId: 'sip-call-uuid',
   *   name: 'Fax from +15551234567',
   *   toNumber: '+15559876543',
   *   fromNumber: '+15551234567',
   * });
   * // Save id for use with sdk.fax.status() after reception completes
   */
  async receive({
    faxMailboxId,
    sipCallId,
    name,
    faxHeader,
    resolution,
    toNumber,
    fromNumber,
    cId,
  }) {
    this.sdk.validateParams(
      { faxMailboxId },
      {
        faxMailboxId: { type: 'string', required: true },
      },
    );

    const params = {
      body: {
        faxMailboxId,
        sipCallId,
        name,
        faxHeader,
        resolution,
        toNumber,
        fromNumber,
        cId,
      },
    };

    return await internalRequest(this.sdk, '/fax/receive', 'POST', params);
  }

  /**
   * Send an outbound fax.
   * Creates a fax document record, retrieves the document from storage,
   * and publishes to the media manager via NATS to initiate the fax call.
   *
   * @param {Object} options - Parameters
   * @param {string} options.faxMailboxId - ID of the fax mailbox to send from (required)
   * @param {string} options.toNumber - Destination number in E.164 format (required)
   * @param {string} options.fromNumber - Caller ID number in E.164 format (required)
   * @param {string} [options.storageId] - Storage ID of a PDF or TIFF file to fax. The server will
   *   automatically convert it to the missing format so both PDF and TIFF are stored.
   *   Required if pdfStorageId and tiffStorageId are not provided.
   * @param {string} [options.pdfStorageId] - Storage ID of the PDF version. Required if storageId is not provided.
   * @param {string} [options.tiffStorageId] - Storage ID of the TIFF version. Required if storageId is not provided.
   * @param {string} [options.coverStorageId] - Optional cover PDF (or TIFF). Concatenated in front of the body before TIFF convert.
   * @param {('letter'|'legal'|'a4')} [options.paperSize] - Paper size hint for TIFF conversion. Server also reads PDF MediaBox.
   * @param {string} [options.faxHeader] - TSI header text (defaults to mailbox faxHeader)
   * @param {string} [options.resolution] - Fax resolution (defaults to mailbox resolution)
   * @param {boolean} [options.ecm] - Enable Error Correction Mode (default: true)
   * @param {number} [options.timeout] - Dial timeout in seconds (defaults to mailbox dialTimeout)
   * @returns {Promise<Object>} Send result
   * @returns {string} result.id - The fax document ID
   * @returns {string} result.status - 'sending' on success, 'failed' on NATS error
   * @returns {string} [result.requestId] - NATS request ID (on success)
   * @returns {string} [result.error] - Error message (on failure)
   *
   * @example
   * // Send using a single storageId (PDF or TIFF — server auto-converts the missing format)
   * const result = await sdk.fax.send({
   *   faxMailboxId: '157abc123...',
   *   toNumber: '+15551234567',
   *   fromNumber: '+15559876543',
   *   storageId: '017xyz788...',
   *   paperSize: 'legal',
   *   coverStorageId: '017cover...',
   * });
   * console.log(result.id);     // '158def456...'
   * console.log(result.status); // 'sending'
   *
   * @example
   * // Send using explicit PDF and TIFF storage IDs
   * const result = await sdk.fax.send({
   *   faxMailboxId: '157abc123...',
   *   toNumber: '+15551234567',
   *   fromNumber: '+15559876543',
   *   pdfStorageId: '017xyz789...',
   *   tiffStorageId: '017xyz788...',
   *   faxHeader: 'My Company',
   *   resolution: 'fine',
   *   ecm: true,
   *   timeout: 90,
   * });
   */
  async send({
    faxMailboxId,
    toNumber,
    fromNumber,
    storageId,
    pdfStorageId,
    tiffStorageId,
    coverStorageId,
    paperSize,
    faxHeader,
    resolution,
    ecm,
    timeout,
  }) {
    this.sdk.validateParams(
      { faxMailboxId, toNumber, fromNumber, coverStorageId, paperSize },
      {
        faxMailboxId: { type: 'string', required: true },
        toNumber: { type: 'string', required: true },
        fromNumber: { type: 'string', required: true },
        storageId: { type: 'string', required: false },
        pdfStorageId: { type: 'string', required: false },
        tiffStorageId: { type: 'string', required: false },
        coverStorageId: { type: 'string', required: false },
        paperSize: { type: 'string', required: false },
      },
    );

    if (!storageId && (!pdfStorageId || !tiffStorageId)) {
      throw new Error(
        'Either storageId or both pdfStorageId and tiffStorageId are required.',
      );
    }

    const params = {
      body: {
        faxMailboxId,
        toNumber,
        fromNumber,
        storageId,
        pdfStorageId,
        tiffStorageId,
        coverStorageId,
        paperSize,
        faxHeader,
        resolution,
        ecm,
        timeout,
      },
    };

    return await internalRequest(this.sdk, '/fax/send', 'POST', params);
  }

  /**
   * Update the status and metadata of a fax document.
   * Called by the media manager to report progress and completion
   * of both inbound and outbound faxes.
   *
   * @param {Object} options - Parameters
   * @param {string} options.faxDocumentId - ID of the fax document to update (required)
   * @param {string} options.status - New status (required): 'receiving', 'sending', 'sent', 'completed', 'failed'
   * @param {string} [options.sipCallId] - SIP call correlation ID
   * @param {number} [options.pages] - Number of pages transmitted/received
   * @param {number} [options.duration] - Call duration in seconds
   * @param {number} [options.transferRate] - Baud rate (e.g. 14400)
   * @param {number} [options.ecmUsed] - Whether ECM was used (1 or 0)
   * @param {number} [options.isError] - Whether an error occurred (1 or 0)
   * @param {string} [options.errorMessage] - Error description
   * @param {number} [options.sendAttempts] - Number of send attempts made
   * @param {string} [options.pdfStorageId] - Storage ID of the PDF version
   * @param {string} [options.tiffStorageId] - Storage ID of the TIFF version
   * @returns {Promise<Object>} Updated fields
   * @returns {string} result.id - The fax document ID
   *
   * @example
   * // Complete an inbound fax with storage files and metadata
   * await sdk.fax.status({
   *   faxDocumentId: '158abc123...',
   *   status: 'completed',
   *   pdfStorageId: '017pdf456...',
   *   tiffStorageId: '017tiff789...',
   *   pages: 3,
   *   duration: 45,
   *   transferRate: 14400,
   *   ecmUsed: 1,
   * });
   *
   * @example
   * // Report a fax failure
   * await sdk.fax.status({
   *   faxDocumentId: '158abc123...',
   *   status: 'failed',
   *   isError: 1,
   *   errorMessage: 'Remote side disconnected',
   *   sendAttempts: 2,
   * });
   */
  async status({
    faxDocumentId,
    status,
    sipCallId,
    pages,
    duration,
    transferRate,
    ecmUsed,
    isError,
    errorMessage,
    sendAttempts,
    pdfStorageId,
    tiffStorageId,
  }) {
    this.sdk.validateParams(
      { faxDocumentId, status },
      {
        faxDocumentId: { type: 'string', required: true },
        status: { type: 'string', required: true },
      },
    );

    const params = {
      body: {
        faxDocumentId,
        status,
        sipCallId,
        pages,
        duration,
        transferRate,
        ecmUsed,
        isError,
        errorMessage,
        sendAttempts,
        pdfStorageId,
        tiffStorageId,
      },
    };

    return await internalRequest(this.sdk, '/fax/status', 'POST', params);
  }
}
