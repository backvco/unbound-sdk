import { internalRequest } from '../../base.js';
import { EmailMailboxAccessService } from './EmailMailboxAccessService.js';
import { EmailMailboxUserService } from './EmailMailboxUserService.js';
import { EmailMailboxGroupAccessService } from './EmailMailboxGroupAccessService.js';
import { EmailAliasSuggestService } from './EmailAliasSuggestService.js';

export class EmailMailboxesService {
  constructor(sdk) {
    this.sdk = sdk;
    // Access grants (mailboxUsers_acct) — plan §3.2/§4.
    this.access = new EmailMailboxAccessService(sdk);
    // A user's dedicated mailbox — plan §4/§6.
    this.forUser = new EmailMailboxUserService(sdk);
    // Shared mailboxes granted to a group — plan §3.2/§4/§6.
    this.groupAccess = new EmailMailboxGroupAccessService(sdk);
    this._aliasSuggestService = new EmailAliasSuggestService(sdk);
  }

  /**
   * Suggest an available mailbox localpart for a user on the account's default domain
   * @param {string} [firstName]
   * @param {string} [lastName]
   * @param {string} [username]
   * @returns {Promise<Object>} { localpart, domain, domainId, available: true }
   */
  aliasSuggest(params) {
    return this._aliasSuggestService.suggest(params);
  }

  /**
   * Check whether a localpart is available on a given domain
   * @param {string} localpart
   * @param {string} domainId
   * @returns {Promise<Object>} { localpart, domainId, available }
   */
  aliasAvailable(params) {
    return this._aliasSuggestService.available(params);
  }

  /**
   * Create a new mailbox with system address
   * @param {string} [mailbox] - Custom mailbox name (optional, must be unique per account)
   * @param {string} [name] - Display name for the mailbox (optional)
   * @param {string} [userId] - User ID to assign mailbox to (optional)
   * @param {string} [recordTypeId] - Record type ID for permissions (optional)
   * @param {boolean} [useEngagementSessions=false] - Enable engagement session linking for ticketing (optional)
   * @param {string} [queueId] - Queue ID for contact center routing (optional)
   * @param {string} [ticketPrefix] - Ticket prefix for engagement sessions (e.g., 'SUP', 'TECH') (optional)
   * @param {string} [ticketCreateEmailTemplateId] - Email template ID for auto-reply on new tickets (optional)
   * @param {string} [ticketCreateEmailFrom] - From address for auto-reply emails (optional, defaults to received address)
   * @param {string} [type] - Mailbox type: 'dedicated' (has a primary user) or 'shared' (default)
   * @returns {Promise<Object>} Created mailbox with system address
   * @example
   * // Create basic mailbox
   * const mailbox = await sdk.messaging.email.mailboxes.create();
   *
   * // Create support mailbox with engagement sessions and auto-reply
   * const supportMailbox = await sdk.messaging.email.mailboxes.create({
   *   mailbox: 'support',
   *   name: 'Support Team',
   *   useEngagementSessions: true,
   *   queueId: 'queue123',
   *   ticketPrefix: 'SUP',
   *   ticketCreateEmailTemplateId: 'template123',
   *   ticketCreateEmailFrom: 'support@company.com'
   * });
   */
  async create(options = {}) {
    // Support both old positional parameters and new options object
    let mailboxData;
    if (typeof options === 'string' || arguments.length > 1) {
      // Old API: positional parameters
      const [
        mailbox,
        name,
        userId,
        recordTypeId,
        useEngagementSessions,
        queueId,
        ticketPrefix,
        ticketCreateEmailTemplateId,
        ticketCreateEmailFrom,
        type,
      ] = arguments;
      mailboxData = {};
      if (mailbox !== undefined) mailboxData.mailbox = mailbox;
      if (name !== undefined) mailboxData.name = name;
      if (userId !== undefined) mailboxData.userId = userId;
      if (recordTypeId !== undefined) mailboxData.recordTypeId = recordTypeId;
      if (useEngagementSessions !== undefined)
        mailboxData.useEngagementSessions = useEngagementSessions;
      if (queueId !== undefined) mailboxData.queueId = queueId;
      if (ticketPrefix !== undefined) mailboxData.ticketPrefix = ticketPrefix;
      if (ticketCreateEmailTemplateId !== undefined)
        mailboxData.ticketCreateEmailTemplateId = ticketCreateEmailTemplateId;
      if (ticketCreateEmailFrom !== undefined)
        mailboxData.ticketCreateEmailFrom = ticketCreateEmailFrom;
      if (type !== undefined) mailboxData.type = type;
    } else {
      // New API: options object
      mailboxData = { ...options };
    }

    this.sdk.validateParams(mailboxData, {
      mailbox: { type: 'string', required: false },
      name: { type: 'string', required: false },
      userId: { type: 'string', required: false },
      recordTypeId: { type: 'string', required: false },
      useEngagementSessions: { type: 'boolean', required: false },
      queueId: { type: 'string', required: false },
      ticketPrefix: { type: 'string', required: false },
      ticketCreateEmailTemplateId: { type: 'string', required: false },
      ticketCreateEmailFrom: { type: 'string', required: false },
      type: { type: 'string', required: false },
    });

    const result = await internalRequest(this.sdk, '/messaging/email/mailbox', 'POST', {
      body: mailboxData,
    });
    return result;
  }

  /**
   * List mailboxes with optional filtering
   * @param {string} [userId] - Filter by assigned user ID
   * @param {string} [search] - Search in mailbox name or display name
   * @param {string[]} [folderCounts] - Array of folders to count messages for (if provided, returns counts)
   * @param {number} [page=1] - Page number for pagination
   * @param {number} [limit=50] - Number of items per page (max 100)
   * @param {string} [sortBy='createdAt'] - Sort field: createdAt, mailbox, name
   * @param {string} [sortOrder='desc'] - Sort order: asc, desc
   * @returns {Promise<Object>} Paginated list of mailboxes with system addresses, optional message counts, and available folders
   * @example
   * // List all mailboxes (no counts)
   * const result = await sdk.messaging.email.mailboxes.list();
   *
   * // List mailboxes with message counts for open folder
   * const withCounts = await sdk.messaging.email.mailboxes.list({folderCounts: ['open']});
   * // Returns: { mailboxes: [{ ..., messageCounts: { open: 5, total: 5 }, availableFolders: ['open', 'completed', 'trash', 'spam'] }] }
   *
   * // List mailboxes with counts for multiple folders
   * const allCounts = await sdk.messaging.email.mailboxes.list({folderCounts: ['open', 'completed', 'trash']});
   * // Returns: { mailboxes: [{ ..., messageCounts: { open: 5, completed: 3, trash: 1, total: 9 }, availableFolders: [...] }] }
   *
   * // List mailboxes for specific user
   * const userMailboxes = await sdk.messaging.email.mailboxes.list({userId:'userId123'});
   *
   * // Search and paginate
   * const searchResults = await sdk.messaging.email.mailboxes.list({search: 'support', page: 1, limit: 10});
   */
  async list({
    userId,
    searchQuery,
    folderCounts,
    page = 1,
    limit = 50,
    sortBy = 'createdAt',
    sortOrder = 'desc',
  }) {
    this.sdk.validateParams(
      {
        userId,
        searchQuery,
        folderCounts,
        page,
        limit,
        sortBy,
        sortOrder,
      },
      {
        userId: { type: 'string', required: false },
        searchQuery: { type: 'string', required: false },
        folderCounts: { type: 'array', required: false },
        page: { type: 'number', required: false },
        limit: { type: 'number', required: false },
        sortBy: { type: 'string', required: false },
        sortOrder: { type: 'string', required: false },
      },
    );

    const params = {
      query: {
        userId,
        search: searchQuery,
        folderCounts: Array.isArray(folderCounts)
          ? folderCounts.join(',')
          : folderCounts,
        page,
        limit,
        sortBy,
        sortOrder,
      },
    };

    const result = await internalRequest(this.sdk, 
      '/messaging/email/mailbox',
      'GET',
      params,
    );
    return result;
  }

  /**
   * Get mailbox by ID with optional alias information
   * @param {string} id - Mailbox ID
   * @param {boolean} [includeAliases=false] - Include custom aliases information
   * @returns {Promise<Object>} Mailbox details with system address and optional aliases
   * @example
   * // Get basic mailbox info
   * const mailbox = await sdk.messaging.email.mailboxes.get('01030181181');
   *
   * // Get mailbox with all aliases
   * const mailboxWithAliases = await sdk.messaging.email.mailboxes.get('01030181181', true);
   */
  async get(id, includeAliases = true) {
    this.sdk.validateParams(
      { id, includeAliases },
      {
        id: { type: 'string', required: true },
        includeAliases: { type: 'boolean', required: false },
      },
    );

    const params = {
      query: {
        includeAliases,
      },
    };

    const result = await internalRequest(this.sdk, 
      `/messaging/email/mailbox/${id}`,
      'GET',
      params,
    );
    return result;
  }

  /**
   * Update mailbox settings
   * @param {string} id - Mailbox ID
   * @param {Object} updates - Update data object
   * @param {string} [updates.mailbox] - Custom mailbox name (must be unique per account)
   * @param {string} [updates.name] - Display name
   * @param {string} [updates.userId] - User ID to assign mailbox to
   * @param {string} [updates.recordTypeId] - Record type ID for permissions
   * @param {boolean} [updates.useEngagementSessions] - Enable engagement session linking
   * @param {string} [updates.queueId] - Queue ID for contact center routing
   * @param {string} [updates.ticketPrefix] - Ticket prefix for engagement sessions
   * @param {string} [updates.ticketCreateEmailTemplateId] - Email template ID for auto-reply
   * @param {string} [updates.ticketCreateEmailFrom] - From address for auto-reply emails
   * @param {boolean} [updates.isActive] - Whether mailbox is active
   * @param {string} [updates.type] - Mailbox type: 'dedicated' or 'shared'
   * @returns {Promise<Object>} Update result
   * @example
   * // Update mailbox with engagement sessions and queue
   * await sdk.messaging.email.mailboxes.update('01030181181', {
   *   name: 'Support Team',
   *   useEngagementSessions: true,
   *   queueId: 'queue123',
   *   ticketPrefix: 'SUP',
   *   ticketCreateEmailTemplateId: 'template123'
   * });
   *
   * // Deactivate mailbox
   * await sdk.messaging.email.mailboxes.update('01030181181', { isActive: false });
   */
  async update(id, updates = {}) {
    // Support both old positional API and new object API for backward compatibility
    let updateData;
    if (typeof updates === 'string' || arguments.length > 2) {
      // Old API: positional parameters
      const [
        mailbox,
        name,
        userId,
        recordTypeId,
        isActive,
        useEngagementSessions,
        queueId,
        ticketPrefix,
        ticketCreateEmailTemplateId,
        ticketCreateEmailFrom,
        type,
      ] = Array.from(arguments).slice(1);
      updateData = {};
      if (mailbox !== undefined) updateData.mailbox = mailbox;
      if (name !== undefined) updateData.name = name;
      if (userId !== undefined) updateData.userId = userId;
      if (recordTypeId !== undefined) updateData.recordTypeId = recordTypeId;
      if (isActive !== undefined) updateData.isActive = isActive;
      if (useEngagementSessions !== undefined)
        updateData.useEngagementSessions = useEngagementSessions;
      if (queueId !== undefined) updateData.queueId = queueId;
      if (ticketPrefix !== undefined) updateData.ticketPrefix = ticketPrefix;
      if (ticketCreateEmailTemplateId !== undefined)
        updateData.ticketCreateEmailTemplateId = ticketCreateEmailTemplateId;
      if (ticketCreateEmailFrom !== undefined)
        updateData.ticketCreateEmailFrom = ticketCreateEmailFrom;
      if (type !== undefined) updateData.type = type;
    } else {
      // New API: options object
      updateData = { ...updates };
    }

    this.sdk.validateParams(
      { id, ...updateData },
      {
        id: { type: 'string', required: true },
        mailbox: { type: 'string', required: false },
        name: { type: 'string', required: false },
        userId: { type: 'string', required: false },
        recordTypeId: { type: 'string', required: false },
        useEngagementSessions: { type: 'boolean', required: false },
        queueId: { type: 'string', required: false },
        ticketPrefix: { type: 'string', required: false },
        ticketCreateEmailTemplateId: { type: 'string', required: false },
        ticketCreateEmailFrom: { type: 'string', required: false },
        isActive: { type: 'boolean', required: false },
        type: { type: 'string', required: false },
      },
    );

    const result = await internalRequest(this.sdk,
      `/messaging/email/mailbox/${id}`,
      'PUT',
      {
        body: updateData,
      },
    );
    return result;
  }

  /**
   * Delete a mailbox (soft delete)
   * @param {string} id - Mailbox ID
   * @returns {Promise<Object>} Deletion result
   * @example
   * await sdk.messaging.email.mailboxes.delete('01030181181');
   */
  async delete(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/email/mailbox/${id}`,
      'DELETE',
    );
    return result;
  }

  /**
   * Create a custom alias for a mailbox on a verified domain
   * @param {string} mailboxId - Mailbox ID to create alias for
   * @param {string} emailDomainId - Verified email domain ID
   * @param {string} mailboxName - Mailbox name (the part before @)
   * @param {string} [recordTypeId] - Record type ID for permissions
   * @param {boolean} [isDefault=false] - Whether this alias should be the default for the mailbox
   * @returns {Promise<Object>} Created alias details
   * @example
   * // Add 'support@unbound.cx' alias to mailbox
   * const alias = await sdk.messaging.email.mailboxes.createAlias(
   *   '01030181181',
   *   'domainId123',
   *   'support'
   * );
   * // Returns: { id: 'aliasId', address: 'support@unbound.cx', mailboxId: '01030181181' }
   *
   * // Create alias and set as default
   * const defaultAlias = await sdk.messaging.email.mailboxes.createAlias(
   *   '01030181181',
   *   'domainId123',
   *   'info',
   *   null,
   *   true
   * );
   */
  async createAlias(
    mailboxId,
    emailDomainId,
    mailboxName,
    recordTypeId,
    isDefault = false,
  ) {
    const aliasData = {
      emailDomainId,
      mailbox: mailboxName,
    };
    if (recordTypeId !== undefined) aliasData.recordTypeId = recordTypeId;
    if (isDefault !== undefined) aliasData.isDefault = isDefault;

    this.sdk.validateParams(
      { mailboxId, ...aliasData },
      {
        mailboxId: { type: 'string', required: true },
        emailDomainId: { type: 'string', required: true },
        mailbox: { type: 'string', required: true },
        recordTypeId: { type: 'string', required: false },
        isDefault: { type: 'boolean', required: false },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/email/mailbox/${mailboxId}/alias`,
      'POST',
      {
        body: aliasData,
      },
    );
    return result;
  }

  /**
   * Update a custom alias
   * @param {string} aliasId - Alias ID to update
   * @param {boolean} [isDefault] - Whether this alias should be the default for the mailbox
   * @param {boolean} [isActive] - Whether the alias is active
   * @param {string} [recordTypeId] - Record type ID for permissions
   * @returns {Promise<Object>} Update result
   * @example
   * // Set alias as default
   * await sdk.messaging.email.mailboxes.updateAlias('aliasId123', true);
   *
   * // Deactivate alias
   * await sdk.messaging.email.mailboxes.updateAlias('aliasId123', undefined, false);
   */
  async updateAlias(aliasId, isDefault, isActive, recordTypeId) {
    const updateData = {};
    if (isDefault !== undefined) updateData.isDefault = isDefault;
    if (isActive !== undefined) updateData.isActive = isActive;
    if (recordTypeId !== undefined) updateData.recordTypeId = recordTypeId;

    this.sdk.validateParams(
      { aliasId, ...updateData },
      {
        aliasId: { type: 'string', required: true },
        isDefault: { type: 'boolean', required: false },
        isActive: { type: 'boolean', required: false },
        recordTypeId: { type: 'string', required: false },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/email/mailbox/alias/${aliasId}`,
      'PUT',
      {
        body: updateData,
      },
    );
    return result;
  }

  /**
   * Delete a custom alias
   * @param {string} aliasId - Alias ID to delete
   * @returns {Promise<Object>} Deletion result
   * @example
   * await sdk.messaging.email.mailboxes.deleteAlias('aliasId123');
   */
  async deleteAlias(aliasId) {
    this.sdk.validateParams(
      { aliasId },
      {
        aliasId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/email/mailbox/alias/${aliasId}`,
      'DELETE',
    );
    return result;
  }

  /**
   * Get list of folders for a specific mailbox
   * @param {string} mailboxId - Mailbox ID to get folders for
   * @returns {Promise<Object>} List of folders including standard and custom folders
   * @example
   * const result = await sdk.messaging.email.mailboxes.listFolders('01030181181');
   * // Returns: { folders: ['open', 'completed', 'trash', 'spam', 'archive', 'important'] }
   */
  async listFolders(mailboxId) {
    this.sdk.validateParams(
      { mailboxId },
      {
        mailboxId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/email/mailbox/${mailboxId}/folders`,
      'GET',
    );
    return result;
  }

  async createFolder(mailboxId, { name, parent } = {}) {
    this.sdk.validateParams(
      { mailboxId, name, parent },
      {
        mailboxId: { type: 'string', required: true },
        name: { type: 'string', required: true },
        parent: { type: 'string', required: false },
      },
    );
    const body = { name };
    if (parent) body.parent = parent;
    return internalRequest(this.sdk, 
      `/messaging/email/mailbox/${mailboxId}/folders`,
      'POST',
      { body },
    );
  }

  async renameFolder(mailboxId, { from, to } = {}) {
    this.sdk.validateParams(
      { mailboxId, from, to },
      {
        mailboxId: { type: 'string', required: true },
        from: { type: 'string', required: true },
        to: { type: 'string', required: true },
      },
    );
    return internalRequest(this.sdk, 
      `/messaging/email/mailbox/${mailboxId}/folders`,
      'PUT',
      { body: { from, to } },
    );
  }

  /**
   * Unread counts across every mailbox the caller can access, for the nav
   * bar badge.
   * @returns {Promise<Object>} { count, mailboxes: [{ mailboxId, unread }] }
   * @example
   * const { count } = await sdk.messaging.email.mailboxes.badge();
   */
  async badge() {
    return internalRequest(this.sdk, '/messaging/email/mailbox/badge', 'GET');
  }

  async deleteFolder(mailboxId, { name } = {}) {
    this.sdk.validateParams(
      { mailboxId, name },
      {
        mailboxId: { type: 'string', required: true },
        name: { type: 'string', required: true },
      },
    );
    return internalRequest(this.sdk, 
      `/messaging/email/mailbox/${mailboxId}/folders`,
      'DELETE',
      { query: { name }, body: { name } },
    );
  }
}
