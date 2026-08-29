import { internalRequest } from '../base.js';

const LOGO_KINDS = ['main', 'icon', 'favicon'];

const EXT_CONTENT_TYPES = {
  png: 'image/png',
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  gif: 'image/gif',
  svg: 'image/svg+xml',
  webp: 'image/webp',
  ico: 'image/x-icon',
};

function guessContentType(fileName) {
  const ext = (fileName || '').split('.').pop()?.toLowerCase();
  return EXT_CONTENT_TYPES[ext] || 'application/octet-stream';
}

/**
 * Public `branding` service — white-label brand settings, logo/domain
 * management, and per-brand email template overrides.
 *
 * @see /workspace/code/app1/plans/white-label-plan.md §3
 * @see app1-api src/services/branding/routes.js
 */
export class BrandingService {
  constructor(sdk) {
    this.sdk = sdk;
    this.emailTemplates = new BrandingEmailTemplatesService(sdk);
  }

  /**
   * Host-resolved brand for the current request (public-safe fields only).
   * No auth required.
   *
   * @returns {Promise<Object>} Brand
   */
  async current() {
    const result = await internalRequest(this.sdk, '/branding/current', 'GET', {});
    return result;
  }

  /**
   * Get a brand by id. Requires brand-owner auth.
   *
   * @param {string} id - Brand id
   * @returns {Promise<Object>} Brand
   */
  async get(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );

    const result = await internalRequest(this.sdk, `/branding/${id}`, 'GET', {});
    return result;
  }

  /**
   * Update a brand's settings. Requires brand-owner auth.
   *
   * @param {string} id - Brand id
   * @param {Object} patch - Whitelisted fields to update (displayName, colors,
   *   baseUrl/baseAppUrl/enrollmentUrl, primaryEmail/supportEmail/supportPhone, etc.)
   * @returns {Promise<Object>} Updated brand
   */
  async update(id, patch) {
    this.sdk.validateParams(
      { id, patch },
      {
        id: { type: 'string', required: true },
        patch: { type: 'object', required: true },
      },
    );

    const params = {
      body: patch,
    };

    const result = await internalRequest(this.sdk, `/branding/${id}`, 'PATCH', params);
    return result;
  }

  /**
   * Upload a brand logo image. Requires brand-owner auth.
   *
   * @param {string} id - Brand id
   * @param {('main'|'icon'|'favicon')} kind - Which logo slot to upload into
   * @param {(Buffer|Blob|File|{buffer: Buffer, fileName?: string, originalname?: string, contentType?: string, mimetype?: string})} file -
   *   The image. In Node, pass a Buffer (a generic filename is used) or a
   *   multer-style object (`{ buffer, originalname, mimetype }`). In the
   *   browser, pass a `File`/`Blob` (its `.name`/`.type` are used).
   * @returns {Promise<Object>} Updated brand with the new logo URL
   */
  async uploadLogo(id, kind, file) {
    this.sdk.validateParams(
      { id, kind, file },
      {
        id: { type: 'string', required: true },
        kind: { type: 'string', required: true },
        file: { type: 'object', required: true },
      },
    );

    if (!LOGO_KINDS.includes(kind)) {
      throw new Error(
        `branding.uploadLogo: kind must be one of ${LOGO_KINDS.join(', ')}, got: ${kind}`,
      );
    }

    const { body, headers } = this._buildLogoFormData(file);

    const params = {
      body,
      headers,
    };

    const result = await internalRequest(
      this.sdk,
      `/branding/${id}/logos/${kind}`,
      'POST',
      params,
      true,
    );
    return result;
  }

  // Private helper — builds a single-file multipart body under field name
  // "file" (matches app1-api's `upload.single('file')`). Mirrors the
  // Node/browser split in services/storage.js's upload helpers, trimmed to
  // the single-small-image case (no streaming/progress paths needed here).
  _buildLogoFormData(file) {
    const isNode = typeof window === 'undefined';

    if (!isNode) {
      const formData = new FormData();
      const fileName = file?.name || 'logo';
      formData.append('file', file, fileName);
      return { body: formData, headers: {} };
    }

    const buffer = Buffer.isBuffer(file) ? file : file?.buffer;
    if (!Buffer.isBuffer(buffer)) {
      throw new Error(
        'branding.uploadLogo: file must be a Buffer, or an object with a Buffer .buffer property, in Node',
      );
    }
    const fileName = file?.fileName || file?.originalname || 'logo';
    const contentType =
      file?.contentType || file?.mimetype || guessContentType(fileName);

    const boundary = `----formdata-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const CRLF = '\r\n';

    const header = Buffer.from(
      `--${boundary}${CRLF}` +
        `Content-Disposition: form-data; name="file"; filename="${fileName}"${CRLF}` +
        `Content-Type: ${contentType}${CRLF}${CRLF}`,
      'utf8',
    );
    const footer = Buffer.from(`${CRLF}--${boundary}--${CRLF}`, 'utf8');
    const body = Buffer.concat([header, buffer, footer]);

    return {
      body,
      headers: { 'content-type': `multipart/form-data; boundary=${boundary}` },
    };
  }

  /**
   * Trigger DNS verification of a brand's custom domain(s). Requires
   * brand-owner auth.
   *
   * @param {string} id - Brand id
   * @returns {Promise<Object>} Verification result / updated `domainStatus`
   */
  async verifyDomain(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );

    const result = await internalRequest(this.sdk, `/branding/${id}/domains/verify`, 'POST', {});
    return result;
  }

  /**
   * List accounts on a brand. Requires brand-owner auth.
   *
   * @param {string} id - Brand id
   * @returns {Promise<Array>} Accounts
   */
  async accounts(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );

    const result = await internalRequest(this.sdk, `/branding/${id}/accounts`, 'GET', {});
    return result;
  }
}

/**
 * Per-brand system email template overrides. `sdk.branding.emailTemplates.*`.
 * A brand template is a system default + optional brand override; these
 * methods manage the override.
 */
export class BrandingEmailTemplatesService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * List all system email template types for a brand, each with a
   * `source: 'default'|'override'` flag.
   *
   * @param {string} id - Brand id
   * @returns {Promise<Array>} Templates
   */
  async list(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );

    const result = await internalRequest(this.sdk, `/branding/${id}/email-templates`, 'GET', {});
    return result;
  }

  /**
   * Get the resolved template (override, falling back to system default)
   * for one type.
   *
   * @param {string} id - Brand id
   * @param {string} type - Template type (newUser, newUserInvite, verification, forgotPassword, passwordChanged)
   * @returns {Promise<Object>} Resolved template, with `isOverride` flag
   */
  async get(id, type) {
    this.sdk.validateParams(
      { id, type },
      {
        id: { type: 'string', required: true },
        type: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, `/branding/${id}/email-templates/${type}`, 'GET', {});
    return result;
  }

  /**
   * Create or replace a brand's override for one template type.
   *
   * @param {string} id - Brand id
   * @param {string} type - Template type
   * @param {Object} body - Template fields (fromEmail, subject, html, regions, redirects, ...)
   * @returns {Promise<Object>} Updated override
   */
  async update(id, type, body) {
    this.sdk.validateParams(
      { id, type, body },
      {
        id: { type: 'string', required: true },
        type: { type: 'string', required: true },
        body: { type: 'object', required: true },
      },
    );

    const params = {
      body,
    };

    const result = await internalRequest(this.sdk, `/branding/${id}/email-templates/${type}`, 'PUT', params);
    return result;
  }

  /**
   * Remove a brand's override for one template type, reverting to the
   * system default.
   *
   * @param {string} id - Brand id
   * @param {string} type - Template type
   * @returns {Promise<Object>} Confirmation
   */
  async reset(id, type) {
    this.sdk.validateParams(
      { id, type },
      {
        id: { type: 'string', required: true },
        type: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, `/branding/${id}/email-templates/${type}`, 'DELETE', {});
    return result;
  }

  /**
   * Render a template (override or draft `body`) with sample variables for
   * preview, without saving.
   *
   * @param {string} id - Brand id
   * @param {string} type - Template type
   * @param {Object} body - Draft template fields to render
   * @returns {Promise<Object>} Rendered preview
   */
  async preview(id, type, body) {
    this.sdk.validateParams(
      { id, type, body },
      {
        id: { type: 'string', required: true },
        type: { type: 'string', required: true },
        body: { type: 'object', required: true },
      },
    );

    const params = {
      body,
    };

    const result = await internalRequest(this.sdk, `/branding/${id}/email-templates/${type}/preview`, 'POST', params);
    return result;
  }

  /**
   * Send a test email of a template to an address.
   *
   * @param {string} id - Brand id
   * @param {string} type - Template type
   * @param {string} to - Destination email address
   * @returns {Promise<Object>} Send confirmation
   */
  async sendTest(id, type, to) {
    this.sdk.validateParams(
      { id, type, to },
      {
        id: { type: 'string', required: true },
        type: { type: 'string', required: true },
        to: { type: 'string', required: true },
      },
    );

    const params = {
      body: { to },
    };

    const result = await internalRequest(this.sdk, `/branding/${id}/email-templates/${type}/test`, 'POST', params);
    return result;
  }
}
