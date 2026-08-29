import { internalRequest } from '../base.js';
export class PortalsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Creates a new portal for the authenticated account.
   *
   * @param {object} params
   * @param {string} params.name - Display name of the portal.
   * @param {string} [params.kind] - Portal kind (`marketing` | `support` | `partner`).
   * @param {string} [params.domain] - Custom domain for the portal (e.g. `portal.example.com`).
   *   A CNAME DNS record pointing to the platform's portal host is required.
   * @param {string} [params.slug] - Per-account preview slug (not a custom domain).
   *   At least one of `domain` or `slug` is required by the API.
   * @param {object} [params.settings] - Optional portal configuration settings.
   * @param {boolean} [params.isPublic] - Whether the portal is publicly accessible without
   *   authentication. Defaults to private if omitted.
   * @param {string} [params.customCss] - Optional custom CSS injected into the portal.
   * @param {string} [params.customJs] - Optional custom JavaScript injected into the portal.
   * @param {string} [params.favicon] - Optional URL or asset reference for the portal favicon.
   * @param {string} [params.logo] - Optional URL or asset reference for the portal logo.
   * @returns {Promise<{
   *   id: string,
   *   accountId: string,
   *   name: string,
   *   domain: string,
   *   dns: Array<{ type: string, name: string, value: string, description: string }>
   * }>} The newly created portal, including DNS records needed to configure the custom domain.
   */
  async create({
    name,
    kind,
    domain,
    slug,
    settings,
    isPublic,
    customCss,
    customJs,
    favicon,
    logo,
  }) {
    this.sdk.validateParams(
      { name, kind, domain, slug },
      {
        name: { type: 'string', required: true },
        kind: { type: 'string', required: false },
        domain: { type: 'string', required: false },
        slug: { type: 'string', required: false },
        settings: { type: 'object', required: false },
        isPublic: { type: 'boolean', required: false },
        customCss: { type: 'string', required: false },
        customJs: { type: 'string', required: false },
        favicon: { type: 'string', required: false },
        logo: { type: 'string', required: false },
      },
    );

    const portalData = { name };
    if (kind) portalData.kind = kind;
    if (domain) portalData.domain = domain;
    if (slug) portalData.slug = slug;
    if (settings) portalData.settings = settings;
    if (isPublic !== undefined) portalData.isPublic = isPublic;
    if (customCss) portalData.customCss = customCss;
    if (customJs) portalData.customJs = customJs;
    if (favicon) portalData.favicon = favicon;
    if (logo) portalData.logo = logo;

    const params = {
      body: portalData,
    };

    const result = await internalRequest(this.sdk, '/portals', 'POST', params);
    return result;
  }

  /**
   * Updates an existing portal's properties.
   *
   * Only the fields provided will be updated; omitted fields are left unchanged.
   *
   * @param {string} portalId - The ID of the portal to update.
   * @param {object} updates
   * @param {string} [updates.name] - New display name for the portal.
   * @param {string} [updates.domain] - New custom domain for the portal.
   * @param {object} [updates.settings] - Updated portal configuration settings.
   * @param {boolean} [updates.isPublic] - Updated public accessibility flag.
   * @param {string} [updates.customCss] - Updated custom CSS for the portal.
   * @param {string} [updates.customJs] - Updated custom JavaScript for the portal.
   * @param {string} [updates.favicon] - Updated favicon URL or asset reference.
   * @param {string} [updates.logo] - Updated logo URL or asset reference.
   * @returns {Promise<{
   *   id: string,
   *   updatedBy: string,
   *   updatedAt: string,
   *   name?: string,
   *   domain?: string
   * }>} The updated portal fields along with audit metadata.
   */
  async update(
    portalId,
    { name, domain, settings, isPublic, customCss, customJs, favicon, logo },
  ) {
    this.sdk.validateParams(
      { portalId },
      {
        portalId: { type: 'string', required: true },
        name: { type: 'string', required: false },
        domain: { type: 'string', required: false },
        settings: { type: 'object', required: false },
        isPublic: { type: 'boolean', required: false },
        customCss: { type: 'string', required: false },
        customJs: { type: 'string', required: false },
        favicon: { type: 'string', required: false },
        logo: { type: 'string', required: false },
      },
    );

    const updateData = {};
    if (name) updateData.name = name;
    if (domain) updateData.domain = domain;
    if (settings) updateData.settings = settings;
    if (isPublic !== undefined) updateData.isPublic = isPublic;
    if (customCss) updateData.customCss = customCss;
    if (customJs) updateData.customJs = customJs;
    if (favicon) updateData.favicon = favicon;
    if (logo) updateData.logo = logo;

    const params = {
      body: updateData,
    };

    const result = await internalRequest(this.sdk, `/portals/${portalId}`, 'PUT', params);
    return result;
  }

  /**
   * Deletes a portal by ID.
   *
   * @param {string} portalId - The ID of the portal to delete.
   * @returns {Promise<{ message: string }>} Confirmation message on success.
   */
  async delete(portalId) {
    this.sdk.validateParams(
      { portalId },
      {
        portalId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, `/portals/${portalId}`, 'DELETE');
    return result;
  }

  /**
   * Retrieves a portal by ID.
   *
   * @param {string} portalId - The ID of the portal to retrieve.
   * @returns {Promise<object>} The full portal record.
   */
  async get(portalId) {
    this.sdk.validateParams(
      { portalId },
      {
        portalId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, `/portals/${portalId}`, 'GET');
    return result;
  }

  /**
   * Retrieves public portal information by domain.
   *
   * This is an unauthenticated endpoint used by portal front-ends to look up
   * their own configuration based on the domain they are served from.
   *
   * @param {string} domain - The custom domain of the portal to look up
   *   (e.g. `portal.example.com`).
   * @returns {Promise<{ id: string, name: string, domain: string }>}
   *   The public-facing portal fields. Sensitive account data is excluded.
   */
  async getPublic(domain) {
    this.sdk.validateParams(
      { domain },
      {
        domain: { type: 'string', required: true },
      },
    );

    const params = {
      query: { domain },
    };

    const result = await internalRequest(this.sdk, '/portals/public', 'GET', params);
    return result;
  }

  /**
   * Lists all portals belonging to the authenticated account.
   *
   * @returns {Promise<{ portals: object[] }>} An object containing an array of portal records.
   */
  async list() {
    const result = await internalRequest(this.sdk, '/portals', 'GET');
    return result;
  }

  /**
   * Verifies that a portal's custom domain has the correct DNS configuration.
   *
   * Checks that the domain has a valid CNAME record pointing to the platform's
   * portal host. Use the `dns` records returned from `create()` to know the
   * expected target value.
   *
   * @param {string} portalId - The ID of the portal whose DNS should be verified.
   * @returns {Promise<{
   *   portalId: string,
   *   domain: string,
   *   expectedTarget: string,
   *   dns: object
   * }>} The DNS verification result, including the expected CNAME target and
   *   the actual resolution details.
   */
  async verifyDns(portalId) {
    this.sdk.validateParams(
      { portalId },
      {
        portalId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, '/portals/dns/verify', 'GET', {
      query: { id: portalId },
    });
    return result;
  }

  /**
   * Lists pages for a portal.
   *
   * @param {string} portalId
   * @returns {Promise<{ pages: object[] }>}
   */
  async listPages(portalId) {
    this.sdk.validateParams(
      { portalId },
      {
        portalId: { type: 'string', required: true },
      },
    );

    return internalRequest(this.sdk, `/portals/${portalId}/pages`, 'GET');
  }

  /**
   * Creates a portal page.
   *
   * @param {string} portalId
   * @param {object} params
   * @param {string} params.path - `/` or a slash-prefixed path like `/spring-sale`.
   * @param {string} params.title
   * @param {string} params.type - landing|html|layout|kbHome|kbArticle|ticketList|ticketDetail|login|redirect
   * @param {boolean} [params.requiresLogin] - Require a signed-in portal session to view this page.
   * @returns {Promise<object>}
   */
  async createPage(portalId, { path, title, type, requiresLogin }) {
    this.sdk.validateParams(
      { portalId, path, title, type, requiresLogin },
      {
        portalId: { type: 'string', required: true },
        path: { type: 'string', required: true },
        title: { type: 'string', required: true },
        type: { type: 'string', required: true },
        requiresLogin: { type: 'boolean', required: false },
      },
    );

    const body = { path, title, type };
    if (requiresLogin !== undefined) body.requiresLogin = requiresLogin;

    return internalRequest(this.sdk, `/portals/${portalId}/pages`, 'POST', {
      body,
    });
  }

  /**
   * Retrieves a portal page by ID.
   *
   * @param {string} portalId
   * @param {string} pageId
   * @returns {Promise<object>}
   */
  async getPage(portalId, pageId) {
    this.sdk.validateParams(
      { portalId, pageId },
      {
        portalId: { type: 'string', required: true },
        pageId: { type: 'string', required: true },
      },
    );

    return internalRequest(
      this.sdk,
      `/portals/${portalId}/pages/${pageId}`,
      'GET',
    );
  }

  /**
   * Updates a portal page. Only provided fields are changed.
   *
   * @param {string} portalId
   * @param {string} pageId
   * @param {object} [updates]
   * @returns {Promise<object>}
   */
  async updatePage(
    portalId,
    pageId,
    {
      path,
      title,
      type,
      isPublished,
      publishedVersionId,
      draftVersionId,
      requiresLogin,
    } = {},
  ) {
    this.sdk.validateParams(
      {
        portalId,
        pageId,
        path,
        title,
        type,
        isPublished,
        publishedVersionId,
        draftVersionId,
        requiresLogin,
      },
      {
        portalId: { type: 'string', required: true },
        pageId: { type: 'string', required: true },
        path: { type: 'string', required: false },
        title: { type: 'string', required: false },
        type: { type: 'string', required: false },
        isPublished: { type: 'boolean', required: false },
        publishedVersionId: { type: 'string', required: false },
        draftVersionId: { type: 'string', required: false },
        requiresLogin: { type: 'boolean', required: false },
      },
    );

    const body = {};
    if (path !== undefined) body.path = path;
    if (title !== undefined) body.title = title;
    if (type !== undefined) body.type = type;
    if (isPublished !== undefined) body.isPublished = isPublished;
    if (publishedVersionId !== undefined) {
      body.publishedVersionId = publishedVersionId;
    }
    if (draftVersionId !== undefined) body.draftVersionId = draftVersionId;
    if (requiresLogin !== undefined) body.requiresLogin = requiresLogin;

    return internalRequest(
      this.sdk,
      `/portals/${portalId}/pages/${pageId}`,
      'PUT',
      { body },
    );
  }

  /**
   * Soft-deletes a portal page.
   *
   * @param {string} portalId
   * @param {string} pageId
   * @returns {Promise<{ message: string }>}
   */
  async deletePage(portalId, pageId) {
    this.sdk.validateParams(
      { portalId, pageId },
      {
        portalId: { type: 'string', required: true },
        pageId: { type: 'string', required: true },
      },
    );

    return internalRequest(
      this.sdk,
      `/portals/${portalId}/pages/${pageId}`,
      'DELETE',
    );
  }

  /**
   * Lists versions for a portal page.
   *
   * @param {string} portalId
   * @param {string} pageId
   * @returns {Promise<{ versions: object[] }>}
   */
  async listPageVersions(portalId, pageId) {
    this.sdk.validateParams(
      { portalId, pageId },
      {
        portalId: { type: 'string', required: true },
        pageId: { type: 'string', required: true },
      },
    );

    return internalRequest(
      this.sdk,
      `/portals/${portalId}/pages/${pageId}/versions`,
      'GET',
    );
  }

  /**
   * Creates a page version (S3 pointers / layout / object only; no HTML compile).
   *
   * @param {string} portalId
   * @param {string} pageId
   * @param {object} [params]
   * @returns {Promise<object>}
   */
  async createPageVersion(
    portalId,
    pageId,
    { designStorageId, htmlStorageId, layoutId, objectName } = {},
  ) {
    this.sdk.validateParams(
      {
        portalId,
        pageId,
        designStorageId,
        htmlStorageId,
        layoutId,
        objectName,
      },
      {
        portalId: { type: 'string', required: true },
        pageId: { type: 'string', required: true },
        designStorageId: { type: 'string', required: false },
        htmlStorageId: { type: 'string', required: false },
        layoutId: { type: 'string', required: false },
        objectName: { type: 'string', required: false },
      },
    );

    const body = {};
    if (designStorageId !== undefined) body.designStorageId = designStorageId;
    if (htmlStorageId !== undefined) body.htmlStorageId = htmlStorageId;
    if (layoutId !== undefined) body.layoutId = layoutId;
    if (objectName !== undefined) body.objectName = objectName;

    return internalRequest(
      this.sdk,
      `/portals/${portalId}/pages/${pageId}/versions`,
      'POST',
      { body },
    );
  }

  /**
   * Autosave a page draft. Landing pages pass a block `tree`; `html`-type
   * pages (marketing portals only, P7.1) pass the raw full-document `html`
   * string instead.
   *
   * @param {string} portalId
   * @param {string} pageId
   * @param {object} params
   * @param {object|Array} [params.tree] - Block tree JSON (landing pages).
   * @param {string} [params.html] - Raw full-document HTML (html pages).
   * @returns {Promise<object>}
   */
  async savePageDraft(portalId, pageId, { tree, html } = {}) {
    this.sdk.validateParams(
      { portalId, pageId, tree, html },
      {
        portalId: { type: 'string', required: true },
        pageId: { type: 'string', required: true },
        tree: { type: 'object', required: false },
        html: { type: 'string', required: false },
      },
    );

    const body = {};
    if (tree !== undefined) body.tree = tree;
    if (html !== undefined) body.html = html;

    return internalRequest(
      this.sdk,
      `/portals/${portalId}/pages/${pageId}/draft`,
      'PUT',
      { body },
    );
  }

  /**
   * Compile a landing-page draft (P1.4) and publish HTML, or (for `html`-type
   * pages, P7.1) store the raw document string verbatim.
   *
   * @param {string} portalId
   * @param {string} pageId
   * @param {object} [params]
   * @param {object|Array} [params.tree] - Optional tree; otherwise the draft design is loaded.
   * @param {string} [params.html] - Raw full-document HTML (html pages); otherwise the draft is loaded.
   * @returns {Promise<object>}
   */
  async publishPage(portalId, pageId, { tree, html } = {}) {
    this.sdk.validateParams(
      { portalId, pageId, tree, html },
      {
        portalId: { type: 'string', required: true },
        pageId: { type: 'string', required: true },
        tree: { type: 'object', required: false },
        html: { type: 'string', required: false },
      },
    );

    const body = {};
    if (tree !== undefined) body.tree = tree;
    if (html !== undefined) body.html = html;

    return internalRequest(
      this.sdk,
      `/portals/${portalId}/pages/${pageId}/publish`,
      'POST',
      { body },
    );
  }

  /**
   * Staff-only portal credential status for a person. Never includes hashes.
   *
   * @param {string} peopleId
   * @returns {Promise<{
   *   hasPassword: boolean,
   *   ssoLinked: boolean,
   *   lastLoginAt: string|null,
   *   lastLoginMethod: string|null,
   *   mustReset: boolean
   * }>}
   */
  async getPeopleAccess(peopleId) {
    this.sdk.validateParams(
      { peopleId },
      {
        peopleId: { type: 'string', required: true },
      },
    );

    return internalRequest(
      this.sdk,
      `/portals/people/${encodeURIComponent(peopleId)}/access`,
      'GET',
    );
  }

  /**
   * Force the person to reset their portal password on next login (`mustReset=1`).
   *
   * @param {string} peopleId
   * @returns {Promise<{
   *   hasPassword: boolean,
   *   ssoLinked: boolean,
   *   lastLoginAt: string|null,
   *   lastLoginMethod: string|null,
   *   mustReset: boolean
   * }>}
   */
  async forceResetPeopleAccess(peopleId) {
    this.sdk.validateParams(
      { peopleId },
      {
        peopleId: { type: 'string', required: true },
      },
    );

    return internalRequest(
      this.sdk,
      `/portals/people/${encodeURIComponent(peopleId)}/access/force-reset`,
      'POST',
    );
  }

  /**
   * Lists the customer-facing labels configured for each engagement status.
   *
   * One entry per valid `engagementSessions.status` value; `customerLabel`
   * is `null` when unset (P4.2: the portal hides statuses with no label).
   *
   * @returns {Promise<{ statuses: Array<{ status: string, customerLabel: string|null }> }>}
   */
  async listTicketStatuses() {
    return internalRequest(this.sdk, '/portals/ticket-statuses', 'GET');
  }

  /**
   * Upserts customer-facing labels for engagement statuses.
   *
   * @param {object} params
   * @param {Array<{ status: string, customerLabel: string|null }>} params.statuses
   * @returns {Promise<{ statuses: Array<{ status: string, customerLabel: string|null }> }>}
   */
  async updateTicketStatuses({ statuses }) {
    this.sdk.validateParams(
      { statuses },
      {
        statuses: { type: 'array', required: true },
      },
    );

    return internalRequest(this.sdk, '/portals/ticket-statuses', 'PUT', {
      body: { statuses },
    });
  }
}
