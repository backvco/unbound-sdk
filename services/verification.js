import { internalRequest } from '../base.js';
export class VerificationService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async createSmsVerification({ phoneNumber, code, expiresIn, metadata }) {
    this.sdk.validateParams(
      { phoneNumber },
      {
        phoneNumber: { type: 'string', required: true },
        code: { type: 'string', required: false },
        expiresIn: { type: 'number', required: false },
        metadata: { type: 'object', required: false },
      },
    );

    const verificationData = { phoneNumber };
    if (code) verificationData.code = code;
    if (expiresIn) verificationData.expiresIn = expiresIn;
    if (metadata) verificationData.metadata = metadata;

    const params = {
      body: verificationData,
    };

    const result = await internalRequest(this.sdk, '/verification/sms', 'POST', params);
    return result;
  }

  async validateSmsVerification(phoneNumber, code) {
    this.sdk.validateParams(
      { phoneNumber, code },
      {
        phoneNumber: { type: 'string', required: true },
        code: { type: 'string', required: true },
      },
    );

    const params = {
      body: { phoneNumber, code },
    };

    const result = await internalRequest(this.sdk, 
      '/verification/sms/validate',
      'POST',
      params,
    );
    return result;
  }

  async createEmailVerification({ email, code, expiresIn, metadata }) {
    this.sdk.validateParams(
      { email },
      {
        email: { type: 'string', required: true },
        code: { type: 'string', required: false },
        expiresIn: { type: 'number', required: false },
        metadata: { type: 'object', required: false },
      },
    );

    const verificationData = { email };
    if (code) verificationData.code = code;
    if (expiresIn) verificationData.expiresIn = expiresIn;
    if (metadata) verificationData.metadata = metadata;

    const params = {
      body: verificationData,
    };

    const result = await internalRequest(this.sdk, '/verification/email', 'POST', params);
    return result;
  }

  async validateEmailVerification(email, code) {
    this.sdk.validateParams(
      { email, code },
      {
        email: { type: 'string', required: true },
        code: { type: 'string', required: true },
      },
    );

    const params = {
      body: { email, code },
    };

    const result = await internalRequest(this.sdk, 
      '/verification/email/validate',
      'POST',
      params,
    );
    return result;
  }
}
