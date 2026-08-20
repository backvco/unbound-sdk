import { internalRequest } from '../base.js';
export class EnrollService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async checkNamespace(namespace) {
    this.sdk.validateParams(
      { namespace },
      {
        namespace: { type: 'string', required: true },
      },
    );

    const params = {
      query: { namespace },
    };

    const result = await internalRequest(this.sdk, 
      '/enroll/checkNamespace',
      'GET',
      params,
    );
    return result;
  }

  async collectCompanyInfo(companyInfo) {
    this.sdk.validateParams(
      { companyInfo },
      {
        companyInfo: { type: 'object', required: true },
      },
    );

    const params = {
      body: companyInfo,
    };

    const result = await internalRequest(this.sdk, '/enroll/companyInfo', 'POST', params);
    return result;
  }

  async updateEnrollmentInfo(enrollmentId, updateData) {
    this.sdk.validateParams(
      { enrollmentId, updateData },
      {
        enrollmentId: { type: 'string', required: true },
        updateData: { type: 'object', required: true },
      },
    );

    const params = {
      body: updateData,
    };

    const result = await internalRequest(this.sdk, 
      `/enroll/enrollment/${enrollmentId}`,
      'PUT',
      params,
    );
    return result;
  }

  async validateEnrollment(enrollmentData) {
    this.sdk.validateParams(
      { enrollmentData },
      {
        enrollmentData: { type: 'object', required: true },
      },
    );

    const params = {
      body: enrollmentData,
    };

    const result = await internalRequest(this.sdk, '/enroll/validate', 'POST', params);
    return result;
  }

  async verifyEmail(email, code) {
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

    const result = await internalRequest(this.sdk, '/enroll/verifyEmail', 'POST', params);
    return result;
  }

  async verifySms(phoneNumber, code) {
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

    const result = await internalRequest(this.sdk, '/enroll/verifySms', 'POST', params);
    return result;
  }

  async verifyPayment(paymentData) {
    this.sdk.validateParams(
      { paymentData },
      {
        paymentData: { type: 'object', required: true },
      },
    );

    const params = {
      body: paymentData,
    };

    const result = await internalRequest(this.sdk, 
      '/enroll/verifyPayment',
      'POST',
      params,
    );
    return result;
  }

  async createStripeVerificationSession(sessionData) {
    this.sdk.validateParams(
      { sessionData },
      {
        sessionData: { type: 'object', required: true },
      },
    );

    const params = {
      body: sessionData,
    };

    const result = await internalRequest(this.sdk, 
      '/enroll/stripeVerification',
      'POST',
      params,
    );
    return result;
  }

  async getStripeVerificationStatus(sessionId) {
    this.sdk.validateParams(
      { sessionId },
      {
        sessionId: { type: 'string', required: true },
      },
    );

    const params = {
      query: { sessionId },
    };

    const result = await internalRequest(this.sdk, 
      '/enroll/stripeVerification/status',
      'GET',
      params,
    );
    return result;
  }

  async signAgreement(agreementData) {
    this.sdk.validateParams(
      { agreementData },
      {
        agreementData: { type: 'object', required: true },
      },
    );

    const params = {
      body: agreementData,
    };

    const result = await internalRequest(this.sdk, 
      '/enroll/signAgreement',
      'POST',
      params,
    );
    return result;
  }

  async getAgreement(agreementType, version) {
    this.sdk.validateParams(
      { agreementType },
      {
        agreementType: { type: 'string', required: true },
        version: { type: 'string', required: false },
      },
    );

    const params = {
      query: { type: agreementType, version },
    };

    const result = await internalRequest(this.sdk, '/enroll/agreement', 'GET', params);
    return result;
  }

  async getBrandForEnrollment(enrollmentId) {
    this.sdk.validateParams(
      { enrollmentId },
      {
        enrollmentId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/enroll/brand/${enrollmentId}`,
      'GET',
    );
    return result;
  }

  async getBuildStatus(enrollmentId) {
    this.sdk.validateParams(
      { enrollmentId },
      {
        enrollmentId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/enroll/buildStatus/${enrollmentId}`,
      'GET',
    );
    return result;
  }

  async completeEnrollment(enrollmentId, completionData) {
    this.sdk.validateParams(
      { enrollmentId, completionData },
      {
        enrollmentId: { type: 'string', required: true },
        completionData: { type: 'object', required: true },
      },
    );

    const params = {
      body: completionData,
    };

    const result = await internalRequest(this.sdk, 
      `/enroll/complete/${enrollmentId}`,
      'POST',
      params,
    );
    return result;
  }

  async createAccountDatabase(enrollmentId) {
    this.sdk.validateParams(
      { enrollmentId },
      {
        enrollmentId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/enroll/createDatabase/${enrollmentId}`,
      'POST',
    );
    return result;
  }
}
