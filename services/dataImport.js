import { internalRequest } from '../base.js';

export class DataImportService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Create a draft import/export job.
   * @param {Object} [body]
   */
  async createJob(body = {}) {
    return internalRequest(this.sdk, '/dataImport/jobs', 'POST', { body });
  }

  /**
   * Get a job by id.
   * @param {string} id
   */
  async getJob(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/dataImport/jobs/${id}`, 'GET');
  }

  /**
   * List jobs.
   * @param {Object} [query]
   */
  async listJobs(query) {
    if (query) {
      return internalRequest(this.sdk, '/dataImport/jobs', 'GET', { query });
    }
    return internalRequest(this.sdk, '/dataImport/jobs', 'GET');
  }

  /**
   * Autosave wizard state on a draft job.
   * @param {string} id
   * @param {Object} body { mapping?, wizardStep?, name?, errorMode?, skipTriggers? }
   */
  async updateJob(id, body = {}) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/dataImport/jobs/${id}`, 'PATCH', {
      body,
    });
  }

  /**
   * Attach a storage source file to a draft job.
   * @param {string} jobId
   * @param {Object} body
   */
  async attachSource(jobId, body = {}) {
    this.sdk.validateParams(
      { jobId },
      { jobId: { type: 'string', required: true } },
    );
    return internalRequest(this.sdk, `/dataImport/jobs/${jobId}/sources`, 'POST', {
      body,
    });
  }

  /**
   * Mapped+matched preview of a job's source.
   * @param {string} jobId
   * @param {Object} body
   */
  async preview(jobId, body = {}) {
    this.sdk.validateParams(
      { jobId },
      { jobId: { type: 'string', required: true } },
    );
    return internalRequest(this.sdk, `/dataImport/jobs/${jobId}/preview`, 'POST', {
      body,
    });
  }

  /**
   * Start a job (snapshot mapping, ACL, Zeus launch).
   * @param {string} jobId
   * @param {Object} [body]
   */
  async start(jobId, body) {
    this.sdk.validateParams(
      { jobId },
      { jobId: { type: 'string', required: true } },
    );
    if (body !== undefined) {
      return internalRequest(this.sdk, `/dataImport/jobs/${jobId}/start`, 'POST', {
        body,
      });
    }
    return internalRequest(this.sdk, `/dataImport/jobs/${jobId}/start`, 'POST');
  }

  /**
   * Pause a running job.
   * @param {string} jobId
   */
  async pause(jobId) {
    this.sdk.validateParams(
      { jobId },
      { jobId: { type: 'string', required: true } },
    );
    return internalRequest(this.sdk, `/dataImport/jobs/${jobId}/pause`, 'POST');
  }

  /**
   * Resume a paused job.
   * @param {string} jobId
   */
  async resume(jobId) {
    this.sdk.validateParams(
      { jobId },
      { jobId: { type: 'string', required: true } },
    );
    return internalRequest(this.sdk, `/dataImport/jobs/${jobId}/resume`, 'POST');
  }

  /**
   * Cancel a job.
   * @param {string} jobId
   */
  async cancel(jobId) {
    this.sdk.validateParams(
      { jobId },
      { jobId: { type: 'string', required: true } },
    );
    return internalRequest(this.sdk, `/dataImport/jobs/${jobId}/cancel`, 'POST');
  }

  /**
   * List job rows, optionally filtered.
   * @param {string} jobId
   * @param {Object} [query]
   */
  async listRows(jobId, query) {
    this.sdk.validateParams(
      { jobId },
      { jobId: { type: 'string', required: true } },
    );
    if (query) {
      return internalRequest(this.sdk, `/dataImport/jobs/${jobId}/rows`, 'GET', {
        query,
      });
    }
    return internalRequest(this.sdk, `/dataImport/jobs/${jobId}/rows`, 'GET');
  }

  /**
   * Resolve an errored row.
   * @param {string} jobId
   * @param {string} rowId
   * @param {Object} body
   */
  async resolveRow(jobId, rowId, body = {}) {
    this.sdk.validateParams(
      { jobId, rowId },
      {
        jobId: { type: 'string', required: true },
        rowId: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/dataImport/jobs/${jobId}/rows/${rowId}/resolve`,
      'POST',
      { body },
    );
  }

  /**
   * Get a signed download URL for a completed export job.
   * @param {string} jobId
   */
  async download(jobId) {
    this.sdk.validateParams(
      { jobId },
      { jobId: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/dataImport/jobs/${jobId}/download`,
      'GET',
    );
  }

  /**
   * Save a mapping template.
   * @param {Object} body
   */
  async createMapping(body = {}) {
    return internalRequest(this.sdk, '/dataImport/mappings', 'POST', { body });
  }

  /**
   * List mapping templates.
   */
  async listMappings() {
    return internalRequest(this.sdk, '/dataImport/mappings', 'GET');
  }

  /**
   * Get a mapping template by id.
   * @param {string} id
   */
  async getMapping(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/dataImport/mappings/${id}`, 'GET');
  }

  /**
   * Update a mapping template.
   * @param {string} id
   * @param {Object} body
   */
  async updateMapping(id, body = {}) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/dataImport/mappings/${id}`, 'PUT', {
      body,
    });
  }
}

/**
 * Export facade. Jobs are still dataImportJobs rows; createJob forces mode=export.
 */
export class DataExportService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Create a draft export job (POST /dataImport/jobs with mode=export).
   * @param {Object} [body]
   */
  async createJob(body = {}) {
    return internalRequest(this.sdk, '/dataImport/jobs', 'POST', {
      body: { ...body, mode: 'export' },
    });
  }

  /**
   * Get a signed download URL for a completed export job.
   * @param {string} jobId
   */
  async download(jobId) {
    this.sdk.validateParams(
      { jobId },
      { jobId: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/dataImport/jobs/${jobId}/download`,
      'GET',
    );
  }
}
