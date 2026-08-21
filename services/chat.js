import { internalRequest } from '../base.js';
/**
 * ChatService — channels, DMs, membership, unreads, DND, messages, search,
 * webhooks, card actions, reports, admin review, admin export, record feeds,
 * channel meet, push devices, and notifyLevel.
 * Backed by /chat/* on app1-api (checkApiAuth). Incoming webhook POST
 * (HMAC) is external and is not an SDK method.
 */
export class ChatService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Create a channel.
   * @param {Object} params
   * @param {string} params.name - Channel name (required)
   * @param {string} [params.topic]
   * @param {'public'|'private'|'dm'|'group_dm'|'record'|'meeting'} [params.kind]
   * @param {Object} [params.settings]
   * @param {string[]} [params.groupIds] - Groups whose members are auto-added
   * @returns {Promise<Object>} Created channel
   */
  async createChannel({ name, topic, kind, settings, groupIds }) {
    this.sdk.validateParams(
      { name, topic, kind, settings, groupIds },
      {
        name: { type: 'string', required: true },
        topic: { type: 'string', required: false },
        kind: { type: 'string', required: false },
        settings: { type: 'object', required: false },
        groupIds: { type: 'array', required: false },
      },
    );

    const body = { name };
    if (topic !== undefined) body.topic = topic;
    if (kind !== undefined) body.kind = kind;
    if (settings !== undefined) body.settings = settings;
    if (groupIds !== undefined) body.groupIds = groupIds;

    return internalRequest(this.sdk, '/chat/channels', 'POST', { body });
  }

  /**
   * List channels the current user is a member of.
   * @returns {Promise<Object>}
   */
  async listChannels() {
    return internalRequest(this.sdk, '/chat/channels', 'GET');
  }

  /**
   * Browse joinable (public) channels.
   * @returns {Promise<Object>}
   */
  async browseChannels() {
    return internalRequest(this.sdk, '/chat/channels/browse', 'GET');
  }

  /**
   * Get a channel by id.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getChannel(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/chat/channels/${id}`, 'GET');
  }

  /**
   * Update channel name/topic/settings.
   * @param {string} id
   * @param {Object} [params]
   * @param {string} [params.name]
   * @param {string} [params.topic]
   * @param {Object} [params.settings]
   * @returns {Promise<Object>}
   */
  async updateChannel(id, { name, topic, settings, kind } = {}) {
    this.sdk.validateParams(
      { id, name, topic, settings, kind },
      {
        id: { type: 'string', required: true },
        name: { type: 'string', required: false },
        topic: { type: 'string', required: false },
        settings: { type: 'object', required: false },
        kind: { type: 'string', required: false },
      },
    );

    const body = {};
    if (name !== undefined) body.name = name;
    if (topic !== undefined) body.topic = topic;
    if (settings !== undefined) body.settings = settings;
    if (kind !== undefined) body.kind = kind;

    return internalRequest(this.sdk, `/chat/channels/${id}`, 'PATCH', { body });
  }

  /**
   * Archive a channel (reversible; hard delete is not supported).
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async archiveChannel(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/chat/channels/${id}/archive`, 'POST', {
      body: {},
    });
  }

  /**
   * Unarchive a channel.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async unarchiveChannel(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/chat/channels/${id}/unarchive`, 'POST', {
      body: {},
    });
  }

  /**
   * Join a public channel.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async joinChannel(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/chat/channels/${id}/join`, 'POST', { body: {} });
  }

  /**
   * Leave a channel.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async leaveChannel(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/chat/channels/${id}/leave`, 'POST', { body: {} });
  }

  /**
   * List members of a channel.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async listMembers(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/chat/channels/${id}/members`, 'GET');
  }

  /**
   * Add a member to a channel.
   * @param {string} id
   * @param {Object} params
   * @param {string} params.userId
   * @param {'owner'|'moderator'|'member'} [params.role]
   * @returns {Promise<Object>}
   */
  async addMember(id, { userId, role } = {}) {
    this.sdk.validateParams(
      { id, userId, role },
      {
        id: { type: 'string', required: true },
        userId: { type: 'string', required: true },
        role: { type: 'string', required: false },
      },
    );

    const body = { userId };
    if (role !== undefined) body.role = role;

    return internalRequest(this.sdk, `/chat/channels/${id}/members`, 'POST', { body });
  }

  /**
   * Remove a member from a channel.
   * @param {string} id
   * @param {string} userId
   * @returns {Promise<Object>}
   */
  async removeMember(id, userId) {
    this.sdk.validateParams(
      { id, userId },
      {
        id: { type: 'string', required: true },
        userId: { type: 'string', required: true },
      },
    );
    return internalRequest(this.sdk, `/chat/channels/${id}/members/${userId}`, 'DELETE');
  }

  /**
   * Get group-default membership links for a channel.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getGroupDefaults(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/chat/channels/${id}/group-defaults`, 'GET');
  }

  /**
   * Replace group-default membership links for a channel.
   * @param {string} id
   * @param {Object} params
   * @param {string[]} params.groupIds
   * @returns {Promise<Object>}
   */
  async setGroupDefaults(id, { groupIds } = {}) {
    this.sdk.validateParams(
      { id, groupIds },
      {
        id: { type: 'string', required: true },
        groupIds: { type: 'array', required: true },
      },
    );
    return internalRequest(this.sdk, `/chat/channels/${id}/group-defaults`, 'PUT', {
      body: { groupIds },
    });
  }

  /**
   * Find-or-create a 1:1 or group DM.
   * @param {Object} params
   * @param {string[]} params.userIds
   * @returns {Promise<Object>}
   */
  async openDm({ userIds }) {
    this.sdk.validateParams(
      { userIds },
      { userIds: { type: 'array', required: true } },
    );
    return internalRequest(this.sdk, '/chat/dms', 'POST', { body: { userIds } });
  }

  /**
   * Sidebar unread snapshot (channels + previews + counters).
   * @returns {Promise<Object>}
   */
  async getUnreads() {
    return internalRequest(this.sdk, '/chat/unreads', 'GET');
  }

  /**
   * Get the caller's Do Not Disturb state.
   * @returns {Promise<Object>}
   */
  async getDnd() {
    return internalRequest(this.sdk, '/chat/dnd', 'GET');
  }

  /**
   * Set the caller's Do Not Disturb state.
   * @param {Object} params
   * @param {boolean} params.enabled
   * @returns {Promise<Object>}
   */
  async setDnd({ enabled } = {}) {
    this.sdk.validateParams(
      { enabled },
      { enabled: { type: 'boolean', required: true } },
    );
    return internalRequest(this.sdk, '/chat/dnd', 'PATCH', { body: { enabled } });
  }

  /**
   * Favorite reaction emojis for the current user.
   * @returns {Promise<Object>}
   */
  async getEmojiFavorites() {
    return internalRequest(this.sdk, '/chat/emoji-favorites', 'GET');
  }

  /**
   * Replace the caller's favorite reaction emojis.
   * @param {Object} params
   * @param {string[]} params.emojis
   * @returns {Promise<Object>}
   */
  async setEmojiFavorites({ emojis } = {}) {
    this.sdk.validateParams(
      { emojis },
      { emojis: { type: 'array', required: true } },
    );
    return internalRequest(this.sdk, '/chat/emoji-favorites', 'PATCH', {
      body: { emojis },
    });
  }

  /**
   * Advance the read watermark and recompute unread counters.
   * @param {string} channelId
   * @param {string} messageId
   * @returns {Promise<Object>}
   */
  async markRead(channelId, messageId) {
    this.sdk.validateParams(
      { channelId, messageId },
      {
        channelId: { type: 'string', required: true },
        messageId: { type: 'string', required: true },
      },
    );
    return internalRequest(this.sdk, `/chat/channels/${channelId}/read`, 'POST', {
      body: { messageId },
    });
  }

  /**
   * Set the watermark to the message before `messageId` (mark as unread).
   * @param {string} channelId
   * @param {string} messageId
   * @returns {Promise<Object>}
   */
  async markUnread(channelId, messageId) {
    this.sdk.validateParams(
      { channelId, messageId },
      {
        channelId: { type: 'string', required: true },
        messageId: { type: 'string', required: true },
      },
    );
    return internalRequest(this.sdk, `/chat/channels/${channelId}/unread`, 'POST', {
      body: { messageId },
    });
  }

  /**
   * Channels linked to a group via defaults (remove-from-group prompt).
   * @param {Object} params
   * @param {string} params.groupId
   * @param {string} params.userId
   * @returns {Promise<Object>}
   */
  async getLinkedChannels({ groupId, userId }) {
    this.sdk.validateParams(
      { groupId, userId },
      {
        groupId: { type: 'string', required: true },
        userId: { type: 'string', required: true },
      },
    );
    return internalRequest(this.sdk, `/chat/groups/${groupId}/linked-channels`, 'GET', {
      query: { userId },
    });
  }

  /**
   * List messages in a channel (cursor pagination).
   * @param {string} channelId
   * @param {Object} [params]
   * @param {string} [params.before]
   * @param {string} [params.after]
   * @param {number} [params.limit]
   * @returns {Promise<Object>}
   */
  async listMessages(channelId, { before, after, limit } = {}) {
    this.sdk.validateParams(
      { channelId, before, after, limit },
      {
        channelId: { type: 'string', required: true },
        before: { type: 'string', required: false },
        after: { type: 'string', required: false },
        limit: { type: 'number', required: false },
      },
    );

    const query = {};
    if (before !== undefined) query.before = before;
    if (after !== undefined) query.after = after;
    if (limit !== undefined) query.limit = limit;

    return internalRequest(this.sdk, `/chat/channels/${channelId}/messages`, 'GET', {
      query,
    });
  }

  /**
   * Send a message to a channel.
   * @param {string} channelId
   * @param {Object} params
   * @param {Object} params.message - ProseMirror JSON (required)
   * @param {string} [params.threadRootId]
   * @param {boolean} [params.alsoSendToChannel]
   * @param {string[]} [params.storageIds]
   * @returns {Promise<Object>} Created message
   */
  async sendMessage(
    channelId,
    {
      message,
      threadRootId,
      alsoSendToChannel,
      storageIds,
      suppressUnfurlUrls,
      unfurls,
    } = {},
  ) {
    this.sdk.validateParams(
      {
        channelId,
        message,
        threadRootId,
        alsoSendToChannel,
        storageIds,
        suppressUnfurlUrls,
        unfurls,
      },
      {
        channelId: { type: 'string', required: true },
        message: { type: 'object', required: true },
        threadRootId: { type: 'string', required: false },
        alsoSendToChannel: { type: 'boolean', required: false },
        storageIds: { type: 'array', required: false },
        suppressUnfurlUrls: { type: 'array', required: false },
        unfurls: { type: 'array', required: false },
      },
    );

    const body = { message };
    if (threadRootId !== undefined) body.threadRootId = threadRootId;
    if (alsoSendToChannel !== undefined) {
      body.alsoSendToChannel = alsoSendToChannel;
    }
    if (storageIds !== undefined) body.storageIds = storageIds;
    if (suppressUnfurlUrls !== undefined) {
      body.suppressUnfurlUrls = suppressUnfurlUrls;
    }
    if (unfurls !== undefined) body.unfurls = unfurls;

    return internalRequest(this.sdk, `/chat/channels/${channelId}/messages`, 'POST', {
      body,
    });
  }

  /**
   * Edit a message body (ProseMirror JSON).
   * @param {string} id
   * @param {Object} params
   * @param {Object} params.message - ProseMirror JSON (required)
   * @returns {Promise<Object>}
   */
  async editMessage(id, { message } = {}) {
    this.sdk.validateParams(
      { id, message },
      {
        id: { type: 'string', required: true },
        message: { type: 'object', required: true },
      },
    );
    return internalRequest(this.sdk, `/chat/messages/${id}`, 'PATCH', {
      body: { message },
    });
  }

  /**
   * Fetch Open Graph data for a URL (composer preview).
   * @param {Object} params
   * @param {string} params.url
   * @returns {Promise<Object>}
   */
  async previewLink({ url } = {}) {
    this.sdk.validateParams({ url }, { url: { type: 'string', required: true } });
    return internalRequest(
      this.sdk,
      `/chat/link-preview?url=${encodeURIComponent(url)}`,
      'GET',
    );
  }

  /**
   * Hide a link preview on a message.
   * @param {string} id
   * @param {Object} params
   * @param {string} params.url
   * @returns {Promise<Object>}
   */
  async hideUnfurl(id, { url } = {}) {
    this.sdk.validateParams(
      { id, url },
      {
        id: { type: 'string', required: true },
        url: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/chat/messages/${id}/unfurls/hide`,
      'POST',
      { body: { url } },
    );
  }

  /**
   * Delete a message (tombstone).
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async deleteMessage(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/chat/messages/${id}`, 'DELETE');
  }

  /**
   * Add an emoji reaction to a message.
   * @param {string} id
   * @param {Object} params
   * @param {string} params.emoji
   * @returns {Promise<Object>}
   */
  async addReaction(id, { emoji } = {}) {
    this.sdk.validateParams(
      { id, emoji },
      {
        id: { type: 'string', required: true },
        emoji: { type: 'string', required: true },
      },
    );
    return internalRequest(this.sdk, `/chat/messages/${id}/reactions`, 'POST', {
      body: { emoji },
    });
  }

  /**
   * Remove an emoji reaction from a message.
   * @param {string} id
   * @param {Object} params
   * @param {string} params.emoji
   * @returns {Promise<Object>}
   */
  async removeReaction(id, { emoji } = {}) {
    this.sdk.validateParams(
      { id, emoji },
      {
        id: { type: 'string', required: true },
        emoji: { type: 'string', required: true },
      },
    );
    return internalRequest(this.sdk, `/chat/messages/${id}/reactions`, 'DELETE', {
      body: { emoji },
    });
  }

  /**
   * Get a thread (root + replies) for a channel message.
   * @param {string} channelId
   * @param {string} rootId
   * @returns {Promise<Object>}
   */
  async getThread(channelId, rootId) {
    this.sdk.validateParams(
      { channelId, rootId },
      {
        channelId: { type: 'string', required: true },
        rootId: { type: 'string', required: true },
      },
    );
    return internalRequest(this.sdk, 
      `/chat/channels/${channelId}/messages/${rootId}/thread`,
      'GET',
    );
  }

  /**
   * Search messages the current user can read.
   * @param {Object} params
   * @param {string} params.q - Search term (required)
   * @param {string} [params.channelId]
   * @param {string} [params.fromUserId]
   * @param {string} [params.before]
   * @param {string} [params.after]
   * @param {'public'|'private'|'dm'|'group_dm'|'record'|'meeting'} [params.kind]
   * @param {string} [params.nextId]
   * @param {number} [params.limit]
   * @returns {Promise<Object>}
   */
  async search({
    q,
    channelId,
    fromUserId,
    before,
    after,
    kind,
    nextId,
    limit,
  } = {}) {
    this.sdk.validateParams(
      { q, channelId, fromUserId, before, after, kind, nextId, limit },
      {
        q: { type: 'string', required: true },
        channelId: { type: 'string', required: false },
        fromUserId: { type: 'string', required: false },
        before: { type: 'string', required: false },
        after: { type: 'string', required: false },
        kind: { type: 'string', required: false },
        nextId: { type: 'string', required: false },
        limit: { type: 'number', required: false },
      },
    );

    const query = { q };
    if (channelId !== undefined) query.channelId = channelId;
    if (fromUserId !== undefined) query.fromUserId = fromUserId;
    if (before !== undefined) query.before = before;
    if (after !== undefined) query.after = after;
    if (kind !== undefined) query.kind = kind;
    if (nextId !== undefined) query.nextId = nextId;
    if (limit !== undefined) query.limit = limit;

    return internalRequest(this.sdk, '/chat/search', 'GET', { query });
  }

  /**
   * Create a channel incoming webhook (signing secret returned once).
   * Button callback URLs are registered here — never taken from message payloads.
   * @param {string} channelId
   * @param {Object} params
   * @param {string} params.name - Display name (required)
   * @param {string} [params.avatar]
   * @param {string} [params.callbackUrl] - Admin-registered button callback URL
   * @returns {Promise<Object>} Created webhook (includes signingSecret once)
   */
  async createWebhook(channelId, { name, avatar, callbackUrl } = {}) {
    this.sdk.validateParams(
      { channelId, name, avatar, callbackUrl },
      {
        channelId: { type: 'string', required: true },
        name: { type: 'string', required: true },
        avatar: { type: 'string', required: false },
        callbackUrl: { type: 'string', required: false },
      },
    );

    const body = { name };
    if (avatar !== undefined) body.avatar = avatar;
    if (callbackUrl !== undefined) body.callbackUrl = callbackUrl;

    return internalRequest(this.sdk, `/chat/channels/${channelId}/webhooks`, 'POST', {
      body,
    });
  }

  /**
   * List webhooks for a channel.
   * @param {string} channelId
   * @returns {Promise<Object>}
   */
  async listWebhooks(channelId) {
    this.sdk.validateParams(
      { channelId },
      { channelId: { type: 'string', required: true } },
    );
    return internalRequest(this.sdk, `/chat/channels/${channelId}/webhooks`, 'GET');
  }

  /**
   * Revoke a channel webhook.
   * @param {string} channelId
   * @param {string} webhookId
   * @returns {Promise<Object>}
   */
  async revokeWebhook(channelId, webhookId) {
    this.sdk.validateParams(
      { channelId, webhookId },
      {
        channelId: { type: 'string', required: true },
        webhookId: { type: 'string', required: true },
      },
    );
    return internalRequest(this.sdk, 
      `/chat/channels/${channelId}/webhooks/${webhookId}`,
      'DELETE',
    );
  }

  /**
   * Click a card action button on a message. Acting principal is the caller.
   * @param {string} messageId
   * @param {Object} params
   * @param {string} params.actionId
   * @param {string} [params.value]
   * @returns {Promise<Object>}
   */
  async clickAction(messageId, { actionId, value } = {}) {
    this.sdk.validateParams(
      { messageId, actionId, value },
      {
        messageId: { type: 'string', required: true },
        actionId: { type: 'string', required: true },
        value: { type: 'string', required: false },
      },
    );

    const body = { actionId };
    if (value !== undefined) body.value = value;

    return internalRequest(this.sdk, `/chat/messages/${messageId}/actions`, 'POST', {
      body,
    });
  }

  /**
   * Report a message.
   * @param {string} id
   * @param {Object} params
   * @param {string} params.reason
   * @returns {Promise<Object>}
   */
  async reportMessage(id, { reason } = {}) {
    this.sdk.validateParams(
      { id, reason },
      {
        id: { type: 'string', required: true },
        reason: { type: 'string', required: true },
      },
    );
    return internalRequest(this.sdk, `/chat/messages/${id}/report`, 'POST', {
      body: { reason },
    });
  }

  /**
   * Admin: list all channels (optional search/kind filter).
   * @param {Object} [params]
   * @param {string} [params.q]
   * @param {'public'|'private'|'dm'|'group_dm'|'record'|'meeting'} [params.kind]
   * @returns {Promise<Object>}
   */
  async adminListChannels({ q, kind } = {}) {
    this.sdk.validateParams(
      { q, kind },
      {
        q: { type: 'string', required: false },
        kind: { type: 'string', required: false },
      },
    );

    const query = {};
    if (q !== undefined) query.q = q;
    if (kind !== undefined) query.kind = kind;

    return internalRequest(this.sdk, '/chat/admin/channels', 'GET', { query });
  }

  /**
   * Admin: get a channel by id (no membership required).
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async adminGetChannel(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/chat/admin/channels/${id}`, 'GET');
  }

  /**
   * Admin: export a channel (messages + members).
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async adminExportChannel(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/chat/admin/channels/${id}/export`, 'GET');
  }

  /**
   * Admin: list message reports.
   * @param {Object} [params]
   * @param {string} [params.status]
   * @returns {Promise<Object>}
   */
  async adminListReports({ status } = {}) {
    this.sdk.validateParams(
      { status },
      { status: { type: 'string', required: false } },
    );

    const query = {};
    if (status !== undefined) query.status = status;

    return internalRequest(this.sdk, '/chat/admin/reports', 'GET', { query });
  }

  /**
   * Admin: review a message report (set status).
   * @param {string} id
   * @param {Object} params
   * @param {string} params.status
   * @returns {Promise<Object>}
   */
  async adminReviewReport(id, { status } = {}) {
    this.sdk.validateParams(
      { id, status },
      {
        id: { type: 'string', required: true },
        status: { type: 'string', required: true },
      },
    );
    return internalRequest(this.sdk, `/chat/admin/reports/${id}`, 'POST', {
      body: { status },
    });
  }

  /**
   * Admin: delete a message (moderation).
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async adminDeleteMessage(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/chat/admin/messages/${id}`, 'DELETE');
  }

  /**
   * Admin: audit log of review actions.
   * @returns {Promise<Object>}
   */
  async adminAudit() {
    return internalRequest(this.sdk, '/chat/admin/audit', 'GET');
  }

  /**
   * Get (find-or-create) the record-feed channel for a related record.
   * @param {string} relatedId
   * @param {Object} params
   * @param {string} params.recordTypeId
   * @returns {Promise<Object>} Record-kind channel
   */
  async getRecordChannel(relatedId, { recordTypeId } = {}) {
    this.sdk.validateParams(
      { relatedId, recordTypeId },
      {
        relatedId: { type: 'string', required: true },
        recordTypeId: { type: 'string', required: true },
      },
    );
    return internalRequest(this.sdk, `/chat/records/${relatedId}`, 'GET', {
      query: { recordTypeId },
    });
  }

  /**
   * Post a message to a record-feed channel (find-or-create).
   * @param {string} relatedId
   * @param {Object} params
   * @param {Object} params.message - ProseMirror JSON (required)
   * @param {string} params.recordTypeId
   * @returns {Promise<Object>} Created message
   */
  async postToRecord(relatedId, { message, recordTypeId } = {}) {
    this.sdk.validateParams(
      { relatedId, message, recordTypeId },
      {
        relatedId: { type: 'string', required: true },
        message: { type: 'object', required: true },
        recordTypeId: { type: 'string', required: true },
      },
    );
    return internalRequest(this.sdk, `/chat/records/${relatedId}/messages`, 'POST', {
      body: { message, recordTypeId },
    });
  }

  /**
   * Get the Meet/Call room for a channel.
   * @param {string} channelId
   * @returns {Promise<Object>}
   */
  async getChannelMeet(channelId) {
    this.sdk.validateParams(
      { channelId },
      { channelId: { type: 'string', required: true } },
    );
    return internalRequest(this.sdk, `/chat/channels/${channelId}/meet`, 'GET');
  }

  /**
   * Get the VAPID public key for Web Push subscription.
   * @returns {Promise<Object>}
   */
  async getVapidPublicKey() {
    return internalRequest(this.sdk, '/chat/push/vapidPublicKey', 'GET');
  }

  /**
   * Register a push device (web push subscription or native FCM/APNs token).
   * @param {Object} params
   * @param {'webpush'|'fcm'|'apns'} params.kind
   * @param {Object} params.subscription - Push subscription / token JSON
   * @returns {Promise<Object>}
   */
  async registerPushDevice({ kind, subscription } = {}) {
    this.sdk.validateParams(
      { kind, subscription },
      {
        kind: { type: 'string', required: true },
        subscription: { type: 'object', required: true },
      },
    );
    return internalRequest(this.sdk, '/chat/push/devices', 'POST', {
      body: { kind, subscription },
    });
  }

  /**
   * Unregister a push device.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async unregisterPushDevice(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/chat/push/devices/${id}`, 'DELETE');
  }

  /**
   * Set the caller's notifyLevel on a channel (all | mentions | mute).
   * @param {string} channelId
   * @param {Object} params
   * @param {'all'|'mentions'|'mute'} params.notifyLevel
   * @returns {Promise<Object>}
   */
  async setNotifyLevel(channelId, { notifyLevel } = {}) {
    this.sdk.validateParams(
      { channelId, notifyLevel },
      {
        channelId: { type: 'string', required: true },
        notifyLevel: { type: 'string', required: true },
      },
    );
    return internalRequest(this.sdk, `/chat/channels/${channelId}/notify`, 'PATCH', {
      body: { notifyLevel },
    });
  }

  /**
   * List the caller's pinned conversations (channel or record).
   * @returns {Promise<Object>}
   */
  async listPins() {
    return internalRequest(this.sdk, '/chat/pins', 'GET');
  }

  /**
   * Pin a channel or record conversation to the sidebar.
   * @param {Object} params
   * @param {'channel'|'record'} params.kind
   * @param {string} [params.channelId]
   * @param {string} [params.relatedId]
   * @param {string} [params.relatedRecordTypeId]
   * @returns {Promise<Object>}
   */
  async pinItem({ kind, channelId, relatedId, relatedRecordTypeId } = {}) {
    this.sdk.validateParams(
      { kind, channelId, relatedId, relatedRecordTypeId },
      {
        kind: { type: 'string', required: true },
        channelId: { type: 'string', required: false },
        relatedId: { type: 'string', required: false },
        relatedRecordTypeId: { type: 'string', required: false },
      },
    );
    const body = { kind };
    if (channelId !== undefined) body.channelId = channelId;
    if (relatedId !== undefined) body.relatedId = relatedId;
    if (relatedRecordTypeId !== undefined) body.relatedRecordTypeId =
      relatedRecordTypeId;
    return internalRequest(this.sdk, '/chat/pins', 'POST', { body });
  }

  /**
   * Remove a sidebar pin by id.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async unpinItem(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return internalRequest(this.sdk, `/chat/pins/${id}`, 'DELETE');
  }

  /**
   * Pin a message to the top of a channel/feed.
   * @param {string} channelId
   * @param {Object} params
   * @param {string} params.messageId
   * @returns {Promise<Object>}
   */
  async pinMessage(channelId, { messageId } = {}) {
    this.sdk.validateParams(
      { channelId, messageId },
      {
        channelId: { type: 'string', required: true },
        messageId: { type: 'string', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/chat/channels/${channelId}/pinned-message`,
      'PUT',
      { body: { messageId } },
    );
  }

  /**
   * Clear the pinned message on a channel/feed.
   * @param {string} channelId
   * @returns {Promise<Object>}
   */
  async unpinMessage(channelId) {
    this.sdk.validateParams(
      { channelId },
      { channelId: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/chat/channels/${channelId}/pinned-message`,
      'DELETE',
    );
  }

  /**
   * List messages that mention the caller.
   * @param {Object} [params]
   * @param {'public'|'private'|'dm'|'group_dm'|'record'} [params.kind]
   * @param {number} [params.limit]
   * @returns {Promise<Object>}
   */
  async listMentions({ kind, limit } = {}) {
    const query = {};
    if (kind) query.kind = kind;
    if (limit != null) query.limit = limit;
    return internalRequest(this.sdk, '/chat/mentions', 'GET', { query });
  }

  async listAdminChannels(query) {
    return this.adminListChannels(query);
  }

  async getAdminChannel(id) {
    return this.adminGetChannel(id);
  }

  async listAdminReports(query) {
    return this.adminListReports(query);
  }

  async listAdminAudit() {
    return this.adminAudit();
  }

  async listAdminMessages(channelId, query) {
    return this.listMessages(channelId, query);
  }

  async dismissAdminReport(id) {
    return this.adminReviewReport(id, { status: 'dismissed' });
  }

  async actionAdminReport(id, body = {}) {
    return this.adminReviewReport(id, {
      status: body.status || 'actioned',
    });
  }
}
