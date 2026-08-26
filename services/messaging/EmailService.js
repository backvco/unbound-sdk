import { EmailTemplatesService } from './EmailTemplatesService.js';
import { EmailDomainsService } from './EmailDomainsService.js';
import { EmailAddressesService } from './EmailAddressesService.js';
import { EmailMailboxesService } from './EmailMailboxesService.js';
import { EmailAnalyticsService } from './EmailAnalyticsService.js';
import { EmailQueueService } from './EmailQueueService.js';
import { EmailSuppressionService } from './EmailSuppressionService.js';
import { EmailAccountSettingsService } from './EmailAccountSettingsService.js';

import { internalRequest } from '../../base.js';
export class EmailService {
  constructor(sdk) {
    this.sdk = sdk;
    this.templates = new EmailTemplatesService(sdk);
    this.domains = new EmailDomainsService(sdk);
    this.addresses = new EmailAddressesService(sdk);
    this.mailboxes = new EmailMailboxesService(sdk);
    this.analytics = new EmailAnalyticsService(sdk);
    this.queue = new EmailQueueService(sdk);
    this.suppression = new EmailSuppressionService(sdk);
    // Account-level email settings (plan §3.3).
    this.settings = new EmailAccountSettingsService(sdk);
  }

  /**
   * Assign (or unassign) an email message to a user — shared-inbox "claim" (plan §2b/§4)
   * @param {string} messageId - Email message ID
   * @param {string|null} userId - User ID to assign to, or null to unassign
   * @returns {Promise<Object>} { id, assignedUserId, assignedAt, message }
   * @example
   * await sdk.messaging.email.assign('emailId123', 'user456');
   * await sdk.messaging.email.assign('emailId123', null); // unassign
   */
  async assign(messageId, userId = null) {
    this.sdk.validateParams(
      { messageId },
      { messageId: { type: 'string', required: true } },
    );
    return internalRequest(this.sdk, `/messaging/email/${messageId}/assign`, 'PUT', {
      body: { userId },
    });
  }

  /**
   * Send an email message
   * @param {Object} params - Email parameters
   * @param {string} [params.from] - Sender email address (required unless using draftId)
   * @param {string|Array<string>} [params.to] - Recipient email address(es) (required unless using draftId)
   * @param {string} [params.subject] - Email subject (required unless using draftId)
   * @param {string|Array<string>} [params.cc] - CC recipients
   * @param {string|Array<string>} [params.bcc] - BCC recipients
   * @param {string} [params.html] - HTML email body
   * @param {string} [params.text] - Plain text email body
   * @param {string} [params.templateId] - Email template ID to use
   * @param {Object} [params.variables] - Template variables for substitution
   * @param {Array} [params.storageId] - Array of storage IDs for attachments
   * @param {string} [params.replyTo] - Reply-to email address
   * @param {string} [params.replyToEmailId] - ID of email this is replying to
   * @param {string} [params.relatedId] - Related record ID
   * @param {string} [params.emailType='marketing'] - Email type: 'marketing' or 'transactional'
   * @param {boolean} [params.tracking=true] - Enable email tracking (opens, clicks)
   * @param {string} [params.mailboxId] - Specific mailbox to send from
   * @param {string} [params.draftId] - Convert existing draft to sent email
   * @returns {Promise<Object>} Email send result with ID and threading info
   */
  async send({
    from,
    to,
    cc,
    bcc,
    subject,
    html,
    text,
    templateId,
    variables,
    storageId,
    replyTo,
    replyToEmailId,
    relatedId,
    emailType,
    tracking,
    mailboxId,
    draftId,
    engagementSessionId,
  }) {
    // Validate required params (relaxed when using draftId)
    if (!draftId) {
      this.sdk.validateParams(
        { from, to, subject },
        {
          from: { type: 'string', required: true },
          subject: { type: 'string', required: true },
        },
      );
    }

    // Validate optional params
    this.sdk.validateParams(
      {
        cc,
        bcc,
        html,
        text,
        templateId,
        variables,
        storageId,
        replyTo,
        replyToEmailId,
        relatedId,
        emailType,
        tracking,
        mailboxId,
        draftId,
        engagementSessionId,
      },
      {
        html: { type: 'string', required: false },
        text: { type: 'string', required: false },
        templateId: { type: 'string', required: false },
        variables: { type: 'object', required: false },
        storageId: { type: 'array', required: false },
        replyTo: { type: 'string', required: false },
        replyToEmailId: { type: 'string', required: false },
        relatedId: { type: 'string', required: false },
        emailType: { type: 'string', required: false },
        tracking: { type: 'boolean', required: false },
        mailboxId: { type: 'string', required: false },
        draftId: { type: 'string', required: false },
        engagementSessionId: { type: 'string', required: false },
      },
    );

    const emailData = {};

    if (from !== undefined) emailData.from = from;
    if (to !== undefined) emailData.to = to;
    if (subject !== undefined) emailData.subject = subject;
    if (cc) emailData.cc = cc;
    if (bcc) emailData.bcc = bcc;
    if (html) emailData.html = html;
    if (text) emailData.text = text;
    if (templateId) emailData.templateId = templateId;
    if (variables) emailData.variables = variables;
    if (storageId) emailData.storageId = storageId;
    if (replyTo) emailData.replyTo = replyTo;
    if (replyToEmailId) emailData.replyToEmailId = replyToEmailId;
    if (relatedId) emailData.relatedId = relatedId;
    if (emailType) emailData.emailType = emailType;
    if (tracking !== undefined) emailData.tracking = tracking;
    if (mailboxId) emailData.mailboxId = mailboxId;
    if (draftId) emailData.draftId = draftId;
    if (engagementSessionId)
      emailData.engagementSessionId = engagementSessionId;

    const options = {
      body: emailData,
    };

    const result = await internalRequest(this.sdk, '/messaging/email', 'POST', options);
    return result;
  }

  /**
   * Get email message by ID
   * @param {string} id - Email message ID (required)
   * @returns {Promise<Object>} Email message details with related emails (deduplicated from same person/company)
   * @example
   * const email = await sdk.messaging.email.get('email_123');
   * // Returns:
   * {
   *   id: "email_123",
   *   subject: "Project Discussion",
   *   html: "<p>Email content...</p>",
   *   plainText: "Email content...",
   *   from: "john@company.com",
   *   to: ["jane@mycompany.com"],
   *   peopleId: "person_456",
   *   companyId: "company_789",
   *   relatedEmails: [
   *     { id: "email_124", subject: "Previous email from John", dateTime: "2023-12-01T10:00:00Z", ... },
   *     { id: "email_125", subject: "Other email from Company", dateTime: "2023-11-30T15:00:00Z", ... }
   *   ]
   * }
   */
  async get(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/email/message/${id}`,
      'GET',
    );
    return result;
  }

  /**
   * Update domain email settings
   * @param {string} id - Domain ID (required)
   * @param {Object} params - Update parameters
   * @param {boolean} [params.dkimEnabled] - Enable DKIM signing
   * @param {Object} [params.customDkim] - Custom DKIM configuration
   * @returns {Promise<Object>} Updated domain details
   */
  async updateDomain(id, { dkimEnabled, customDkim }) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
        dkimEnabled: { type: 'boolean', required: false },
        customDkim: { type: 'object', required: false },
      },
    );

    const updateData = {};
    if (dkimEnabled !== undefined) updateData.dkimEnabled = dkimEnabled;
    if (customDkim) updateData.customDkim = customDkim;

    const options = {
      body: updateData,
    };

    const result = await internalRequest(this.sdk, 
      `/messaging/email/${id}`,
      'PUT',
      options,
    );
    return result;
  }

  /*
   * EMAIL DRAFTS
   */

  /**
   * Create an email draft
   * @param {Object} params - Draft parameters
   * @param {string} [params.from] - Sender email address (auto-selected from mailbox if not provided)
   * @param {string|Array<string>} [params.to] - Recipient email address(es)
   * @param {string|Array<string>} [params.cc] - CC recipients
   * @param {string|Array<string>} [params.bcc] - BCC recipients
   * @param {string} [params.subject] - Email subject
   * @param {string} [params.html] - HTML email body
   * @param {string} [params.text] - Plain text email body
   * @param {string} [params.templateId] - Email template ID to use
   * @param {Object} [params.variables] - Template variables for substitution
   * @param {Array} [params.storageId] - Array of storage IDs for attachments
   * @param {string} [params.replyTo] - Reply-to email address
   * @param {string} [params.replyToEmailId] - ID of email this is replying to
   * @param {string} [params.relatedId] - Related record ID
   * @param {string} [params.emailType='marketing'] - Email type: 'marketing' or 'transactional'
   * @param {boolean} [params.tracking=true] - Enable email tracking (opens, clicks)
   * @param {string} [params.mailboxId] - Specific mailbox for the draft
   * @param {string} [params.replyType] - Reply type: 'reply', 'replyAll', or 'forward' (auto-formats content)
   * @param {string} [params.engagementSessionId] - Engagement session ID to link to the draft
   * @returns {Promise<Object>} Created draft details
   */
  async createDraft({
    from,
    to,
    cc,
    bcc,
    subject,
    html,
    text,
    templateId,
    variables,
    storageId,
    replyTo,
    replyToEmailId,
    relatedId,
    emailType,
    tracking,
    mailboxId,
    replyType,
    engagementSessionId,
  }) {
    this.sdk.validateParams(
      {
        from,
        to,
        cc,
        bcc,
        subject,
        html,
        text,
        templateId,
        variables,
        storageId,
        replyTo,
        replyToEmailId,
        relatedId,
        emailType,
        tracking,
        mailboxId,
        replyType,
        engagementSessionId,
      },
      {
        from: { type: 'string', required: false },
        subject: { type: 'string', required: false },
        html: { type: 'string', required: false },
        text: { type: 'string', required: false },
        templateId: { type: 'string', required: false },
        variables: { type: 'object', required: false },
        storageId: { type: 'array', required: false },
        replyTo: { type: 'string', required: false },
        replyToEmailId: { type: 'string', required: false },
        relatedId: { type: 'string', required: false },
        emailType: { type: 'string', required: false },
        tracking: { type: 'boolean', required: false },
        mailboxId: { type: 'string', required: false },
        replyType: { type: 'string', required: false },
        engagementSessionId: { type: 'string', required: false },
      },
    );

    const draftData = {};

    if (from) draftData.from = from;
    if (to) draftData.to = to;
    if (cc) draftData.cc = cc;
    if (bcc) draftData.bcc = bcc;
    if (subject) draftData.subject = subject;
    if (html) draftData.html = html;
    if (text) draftData.text = text;
    if (templateId) draftData.templateId = templateId;
    if (variables) draftData.variables = variables;
    if (storageId) draftData.storageId = storageId;
    if (replyTo) draftData.replyTo = replyTo;
    if (replyToEmailId) draftData.replyToEmailId = replyToEmailId;
    if (relatedId) draftData.relatedId = relatedId;
    if (emailType) draftData.emailType = emailType;
    if (tracking !== undefined) draftData.tracking = tracking;
    if (mailboxId) draftData.mailboxId = mailboxId;
    if (replyType) draftData.replyType = replyType;
    if (engagementSessionId)
      draftData.engagementSessionId = engagementSessionId;

    const params = {
      body: draftData,
    };

    const result = await internalRequest(this.sdk, 
      '/messaging/email/drafts',
      'POST',
      params,
    );
    return result;
  }

  /**
   * Update an existing email draft
   * @param {string} id - Draft ID (required)
   * @param {Object} params - Fields to update
   * @param {string} [params.from] - Sender email address
   * @param {string|Array<string>} [params.to] - Recipient email address(es)
   * @param {string|Array<string>} [params.cc] - CC recipients
   * @param {string|Array<string>} [params.bcc] - BCC recipients
   * @param {string} [params.subject] - Email subject
   * @param {string} [params.html] - HTML email body
   * @param {string} [params.text] - Plain text email body
   * @param {string} [params.templateId] - Email template ID to use
   * @param {Object} [params.variables] - Template variables for substitution
   * @param {Array} [params.storageId] - Array of storage IDs for attachments
   * @param {string} [params.replyTo] - Reply-to email address
   * @param {string} [params.emailType] - Email type: 'marketing' or 'transactional'
   * @param {boolean} [params.tracking] - Enable email tracking (opens, clicks)
   * @param {string} [params.mailboxId] - Specific mailbox for the draft
   * @param {string} [params.engagementSessionId] - Engagement session ID to link to the draft
   * @returns {Promise<Object>} Updated draft details
   */
  async updateDraft(
    id,
    {
      from,
      to,
      cc,
      bcc,
      subject,
      html,
      text,
      templateId,
      variables,
      storageId,
      replyTo,
      emailType,
      tracking,
      mailboxId,
      engagementSessionId,
    },
  ) {
    this.sdk.validateParams(
      {
        id,
        from,
        to,
        cc,
        bcc,
        subject,
        html,
        text,
        templateId,
        variables,
        storageId,
        replyTo,
        emailType,
        tracking,
        mailboxId,
        engagementSessionId,
      },
      {
        id: { type: 'string', required: true },
        from: { type: 'string', required: false },
        subject: { type: 'string', required: false },
        html: { type: 'string', required: false },
        text: { type: 'string', required: false },
        templateId: { type: 'string', required: false },
        variables: { type: 'object', required: false },
        storageId: { type: 'array', required: false },
        replyTo: { type: 'string', required: false },
        emailType: { type: 'string', required: false },
        tracking: { type: 'boolean', required: false },
        mailboxId: { type: 'string', required: false },
        engagementSessionId: { type: 'string', required: false },
      },
    );

    const updateData = {};

    if (from !== undefined) updateData.from = from;
    if (to !== undefined) updateData.to = to;
    if (cc !== undefined) updateData.cc = cc;
    if (bcc !== undefined) updateData.bcc = bcc;
    if (subject !== undefined) updateData.subject = subject;
    if (html !== undefined) updateData.html = html;
    if (text !== undefined) updateData.text = text;
    if (templateId !== undefined) updateData.templateId = templateId;
    if (variables !== undefined) updateData.variables = variables;
    if (storageId !== undefined) updateData.storageId = storageId;
    if (replyTo !== undefined) updateData.replyTo = replyTo;
    if (emailType !== undefined) updateData.emailType = emailType;
    if (tracking !== undefined) updateData.tracking = tracking;
    if (mailboxId !== undefined) updateData.mailboxId = mailboxId;
    if (engagementSessionId)
      updateData.engagementSessionId = engagementSessionId;

    const params = {
      body: updateData,
    };

    const result = await internalRequest(this.sdk, 
      `/messaging/email/drafts/${id}`,
      'PUT',
      params,
    );
    return result;
  }

  /**
   * Get draft by ID
   * @param {string} id - Draft ID (required)
   * @returns {Promise<Object>} Draft details
   */
  async getDraft(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/email/drafts/${id}`,
      'GET',
    );
    return result;
  }

  /**
   * Delete draft by ID
   * @param {string} id - Draft ID (required)
   * @returns {Promise<Object>} Deletion result
   */
  async deleteDraft(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/email/drafts/${id}`,
      'DELETE',
    );
    return result;
  }

  /**
   * List email drafts
   * @param {Object} [filters] - Filter options
   * @param {string} [filters.mailboxId] - Filter by mailbox ID
   * @param {string} [filters.subject] - Search in subject
   * @param {string} [filters.threadId] - Filter by thread ID
   * @param {number} [filters.limit=50] - Number of results per page (max 200)
   * @param {number} [filters.offset=0] - Offset for pagination
   * @returns {Promise<Object>} Paginated list of drafts
   */
  async listDrafts({
    mailboxId,
    subject,
    threadId,
    limit = 50,
    offset = 0,
  } = {}) {
    this.sdk.validateParams(
      { mailboxId, subject, threadId, limit, offset },
      {
        mailboxId: { type: 'string', required: false },
        subject: { type: 'string', required: false },
        threadId: { type: 'string', required: false },
        limit: { type: 'number', required: false },
        offset: { type: 'number', required: false },
      },
    );
    const params = {
      query: {
        limit,
        offset,
        mailboxId,
        subject,
        threadId,
      },
    };

    const result = await internalRequest(this.sdk, 
      '/messaging/email/drafts',
      'GET',
      params,
    );
    return result;
  }

  /*
   * MAILBOX EMAILS
   */

  /**
   * Get emails from a specific mailbox (Gmail-like view with messages and their threads)
   * @param {string} mailboxId - Mailbox ID (required)
   * @param {Object} [filters] - Filter options
   * @param {string} [filters.folder='open'] - Email folder: 'open' or 'closed'
   * @param {boolean} [filters.includeDrafts=false] - Include draft emails
   * @param {string} [filters.search] - Search in subject, from, or recipients
   * @param {string} [filters.sortBy='dateTime'] - Sort field: 'dateTime', 'createdAt', 'subject', 'from'
   * @param {string} [filters.sortOrder='desc'] - Sort order: 'asc', 'desc'
   * @param {number} [filters.limit=25] - Number of results per page (max 200)
   * @param {number} [filters.offset=0] - Offset for pagination
   * @param {string} [filters.assignedUserId] - Filter by assignment: 'me', 'none', or a specific user ID (plan §2b)
   * @returns {Promise<Object>} List of email messages with their threads
   * @example
   * // Returns messages with nested threads for Gmail-like UI:
   * {
   *   messages: [
   *     {
   *       id: "email_123",
   *       subject: "Project Discussion",
   *       to: ["john@example.com"],
   *       cc: [],
   *       from: "jane@example.com",
   *       isDraft: false,
   *       hasAttachments: false,
   *       isUnread: true,
   *       direction: "inbound",
   *       dateTime: "2023-12-01T15:30:00Z",
   *       snippet: "Thanks for the update...",
   *       threads: [
   *         {
   *           id: "email_124",
   *           subject: "Re: Project Discussion",
   *           // ... same structure as main message
   *         }
   *       ]
   *     }
   *   ],
   *   pagination: { total: 50, limit: 25, hasMore: true }
   * }
   */
  async getMailboxEmails(
    mailboxId,
    {
      folder = 'open',
      includeDrafts = false,
      search,
      sortBy = 'dateTime',
      sortOrder = 'desc',
      limit = 25,
      offset = 0,
      assignedUserId,
    } = {},
  ) {
    this.sdk.validateParams(
      {
        mailboxId,
        folder,
        includeDrafts,
        search,
        sortBy,
        sortOrder,
        limit,
        offset,
        assignedUserId,
      },
      {
        mailboxId: { type: 'string', required: true },
        folder: { type: 'string', required: false },
        includeDrafts: { type: 'boolean', required: false },
        search: { type: 'string', required: false },
        sortBy: { type: 'string', required: false },
        sortOrder: { type: 'string', required: false },
        limit: { type: 'number', required: false },
        offset: { type: 'number', required: false },
        assignedUserId: { type: 'string', required: false },
      },
    );

    const query = { folder, includeDrafts, sortBy, sortOrder, limit, offset };
    if (search) query.search = search;
    if (assignedUserId) query.assignedUserId = assignedUserId;

    const params = {
      query,
    };

    const result = await internalRequest(this.sdk, 
      `/messaging/email/mailbox/${mailboxId}/emails`,
      'GET',
      params,
    );
    return result;
  }

  /**
   * Update an email message (e.g., move between folders, mark as read/unread)
   * @param {string} emailId - Email ID to update
   * @param {Object} updates - Object containing fields to update
   * @param {string} [updates.folder] - Folder to move email to (open, completed, trash, spam)
   * @param {boolean} [updates.isRead] - Mark email as read (true) or unread (false). Automatically sets/clears isReadBy field.
   * @returns {Promise<Object>} Update result
   * @example
   * // Move email to completed folder
   * await sdk.messaging.email.update('emailId123', {folder: 'completed'});
   *
   * // Mark email as read (sets isReadBy to current user)
   * await sdk.messaging.email.update('emailId123', {isRead: true});
   *
   * // Mark email as unread (clears isReadBy field)
   * await sdk.messaging.email.update('emailId123', {isRead: false});
   *
   * // Mark as unread and move to open
   * await sdk.messaging.email.update('emailId123', {folder: 'open', isRead: false});
   */
  async update(emailId, updates = {}) {
    const updateData = { ...updates };

    this.sdk.validateParams(
      { emailId, ...updateData },
      {
        emailId: { type: 'string', required: true },
        folder: { type: 'string', required: false },
        isRead: { type: 'boolean', required: false },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/email/message/${emailId}`,
      'PUT',
      {
        body: updateData,
      },
    );
    return result;
  }

  /**
   * Delete an email message (two-stage deletion)
   * - First delete: Move to trash folder (recoverable)
   * - Second delete: Permanently delete if already in trash
   * @param {string} emailId - Email ID to delete
   * @returns {Promise<Object>} Deletion result with action type
   * @example
   * // First delete: Move to trash
   * const result1 = await sdk.messaging.email.delete('emailId123');
   * // Returns: { action: 'trash', message: 'Email moved to trash' }
   *
   * // Second delete: Permanent deletion
   * const result2 = await sdk.messaging.email.delete('emailId123');
   * // Returns: { action: 'permanent', message: 'Email permanently deleted' }
   */
  async delete(emailId) {
    this.sdk.validateParams(
      { emailId },
      {
        emailId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/messaging/email/message/${emailId}`,
      'DELETE',
    );
    return result;
  }
}
