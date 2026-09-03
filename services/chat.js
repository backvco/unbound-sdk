import { internalRequest } from "../base.js";
/**
 * ChatService — channels, DMs, membership, unreads, DND, messages, search,
 * webhooks, card actions, reports, admin review, admin export, record feeds,
 * channel meet, threads, bots, group default channels, push devices, and
 * notifyLevel.
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
        name: { type: "string", required: true },
        topic: { type: "string", required: false },
        kind: { type: "string", required: false },
        settings: { type: "object", required: false },
        groupIds: { type: "array", required: false },
      },
    );

    const body = { name };
    if (topic !== undefined) body.topic = topic;
    if (kind !== undefined) body.kind = kind;
    if (settings !== undefined) body.settings = settings;
    if (groupIds !== undefined) body.groupIds = groupIds;

    return internalRequest(this.sdk, "/chat/channels", "POST", { body });
  }

  /**
   * List channels the current user is a member of.
   * @returns {Promise<Object>}
   */
  async listChannels() {
    return internalRequest(this.sdk, "/chat/channels", "GET");
  }

  /**
   * Browse joinable (public) channels.
   * @returns {Promise<Object>}
   */
  async browseChannels() {
    return internalRequest(this.sdk, "/chat/channels/browse", "GET");
  }

  /**
   * Get a channel by id.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getChannel(id) {
    this.sdk.validateParams({ id }, { id: { type: "string", required: true } });
    return internalRequest(this.sdk, `/chat/channels/${id}`, "GET");
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
        id: { type: "string", required: true },
        name: { type: "string", required: false },
        topic: { type: "string", required: false },
        settings: { type: "object", required: false },
        kind: { type: "string", required: false },
      },
    );

    const body = {};
    if (name !== undefined) body.name = name;
    if (topic !== undefined) body.topic = topic;
    if (settings !== undefined) body.settings = settings;
    if (kind !== undefined) body.kind = kind;

    return internalRequest(this.sdk, `/chat/channels/${id}`, "PATCH", { body });
  }

  /**
   * Archive a channel (reversible; hard delete is not supported).
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async archiveChannel(id) {
    this.sdk.validateParams({ id }, { id: { type: "string", required: true } });
    return internalRequest(this.sdk, `/chat/channels/${id}/archive`, "POST", {
      body: {},
    });
  }

  /**
   * Unarchive a channel.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async unarchiveChannel(id) {
    this.sdk.validateParams({ id }, { id: { type: "string", required: true } });
    return internalRequest(this.sdk, `/chat/channels/${id}/unarchive`, "POST", {
      body: {},
    });
  }

  /**
   * Join a public channel.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async joinChannel(id) {
    this.sdk.validateParams({ id }, { id: { type: "string", required: true } });
    return internalRequest(this.sdk, `/chat/channels/${id}/join`, "POST", {
      body: {},
    });
  }

  /**
   * Leave a channel.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async leaveChannel(id) {
    this.sdk.validateParams({ id }, { id: { type: "string", required: true } });
    return internalRequest(this.sdk, `/chat/channels/${id}/leave`, "POST", {
      body: {},
    });
  }

  /**
   * List members of a channel.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async listMembers(id) {
    this.sdk.validateParams({ id }, { id: { type: "string", required: true } });
    return internalRequest(this.sdk, `/chat/channels/${id}/members`, "GET");
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
        id: { type: "string", required: true },
        userId: { type: "string", required: true },
        role: { type: "string", required: false },
      },
    );

    const body = { userId };
    if (role !== undefined) body.role = role;

    return internalRequest(this.sdk, `/chat/channels/${id}/members`, "POST", {
      body,
    });
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
        id: { type: "string", required: true },
        userId: { type: "string", required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/chat/channels/${id}/members/${userId}`,
      "DELETE",
    );
  }

  /**
   * Get group-default membership links for a channel.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getGroupDefaults(id) {
    this.sdk.validateParams({ id }, { id: { type: "string", required: true } });
    return internalRequest(
      this.sdk,
      `/chat/channels/${id}/group-defaults`,
      "GET",
    );
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
        id: { type: "string", required: true },
        groupIds: { type: "array", required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/chat/channels/${id}/group-defaults`,
      "PUT",
      {
        body: { groupIds },
      },
    );
  }

  /**
   * Find-or-create a 1:1, self ("You"), or group DM.
   * Pass `userIds: []` (or only the caller) for the You channel.
   * @param {Object} params
   * @param {string[]} params.userIds
   * @returns {Promise<Object>}
   */
  async openDm({ userIds }) {
    this.sdk.validateParams(
      { userIds },
      { userIds: { type: "array", required: true } },
    );
    return internalRequest(this.sdk, "/chat/dms", "POST", {
      body: { userIds },
    });
  }

  /**
   * Sidebar unread snapshot (channels + previews + counters).
   * @returns {Promise<Object>}
   */
  async getUnreads() {
    return internalRequest(this.sdk, "/chat/unreads", "GET");
  }

  /**
   * Get the caller's Do Not Disturb state.
   * @returns {Promise<Object>}
   */
  async getDnd() {
    return internalRequest(this.sdk, "/chat/dnd", "GET");
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
      { enabled: { type: "boolean", required: true } },
    );
    return internalRequest(this.sdk, "/chat/dnd", "PATCH", {
      body: { enabled },
    });
  }

  /**
   * Favorite reaction emojis for the current user.
   * @returns {Promise<Object>}
   */
  async getEmojiFavorites() {
    return internalRequest(this.sdk, "/chat/emoji-favorites", "GET");
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
      { emojis: { type: "array", required: true } },
    );
    return internalRequest(this.sdk, "/chat/emoji-favorites", "PATCH", {
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
        channelId: { type: "string", required: true },
        messageId: { type: "string", required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/chat/channels/${channelId}/read`,
      "POST",
      {
        body: { messageId },
      },
    );
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
        channelId: { type: "string", required: true },
        messageId: { type: "string", required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/chat/channels/${channelId}/unread`,
      "POST",
      {
        body: { messageId },
      },
    );
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
        groupId: { type: "string", required: true },
        userId: { type: "string", required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/chat/groups/${groupId}/linked-channels`,
      "GET",
      {
        query: { userId },
      },
    );
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
        channelId: { type: "string", required: true },
        before: { type: "string", required: false },
        after: { type: "string", required: false },
        limit: { type: "number", required: false },
      },
    );

    const query = {};
    if (before !== undefined) query.before = before;
    if (after !== undefined) query.after = after;
    if (limit !== undefined) query.limit = limit;

    return internalRequest(
      this.sdk,
      `/chat/channels/${channelId}/messages`,
      "GET",
      {
        query,
      },
    );
  }

  /**
   * Send a message to a channel.
   * @param {string} channelId
   * @param {Object} params
   * @param {Object} params.message - ProseMirror JSON (required)
   * @param {string} [params.threadRootId]
   * @param {boolean} [params.alsoSendToChannel]
   * @param {string[]} [params.storageIds]
   * @param {string[]} [params.tools]
   * @param {Object} [params.toolConfig]
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
      tools,
      toolConfig,
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
        tools,
        toolConfig,
      },
      {
        channelId: { type: "string", required: true },
        message: { type: "object", required: true },
        threadRootId: { type: "string", required: false },
        alsoSendToChannel: { type: "boolean", required: false },
        storageIds: { type: "array", required: false },
        suppressUnfurlUrls: { type: "array", required: false },
        unfurls: { type: "array", required: false },
        tools: { type: "array", required: false },
        toolConfig: { type: "object", required: false },
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
    if (tools !== undefined) body.tools = tools;
    if (toolConfig !== undefined) body.toolConfig = toolConfig;

    return internalRequest(
      this.sdk,
      `/chat/channels/${channelId}/messages`,
      "POST",
      {
        body,
      },
    );
  }

  /**
   * Send a message on a kind:'text' channel (sms-routing-plan.md §3.3.1).
   * Plain body only — no ProseMirror `message`, no threads/cards. The API
   * intercepts this route for text channels and sends the plain-text body
   * as a real SMS/MMS via the same pipeline as sdk.messaging.sms.send
   * (unless `internal` is set, which stays a regular chat message).
   * @param {string} channelId
   * @param {Object} params
   * @param {string} [params.text] - Plain message text
   * @param {string[]} [params.storageIds] - Image attachment storage ids
   * @param {boolean} [params.internal] - Internal note; never sent as SMS
   * @param {boolean} [params.force] - Force-send past a busy-conversation
   *   (409 TEXT_CONVERSATION_BUSY) collision
   * @returns {Promise<Object>} Created message
   */
  async sendTextMessage(channelId, { text, storageIds, internal, force } = {}) {
    this.sdk.validateParams(
      { channelId, text, storageIds, internal, force },
      {
        channelId: { type: "string", required: true },
        text: { type: "string", required: false },
        storageIds: { type: "array", required: false },
        internal: { type: "boolean", required: false },
        force: { type: "boolean", required: false },
      },
    );

    const body = {};
    if (text !== undefined) body.text = text;
    if (storageIds !== undefined) body.storageIds = storageIds;
    if (internal !== undefined) body.internal = internal;
    if (force !== undefined) body.force = force;

    return internalRequest(
      this.sdk,
      `/chat/channels/${channelId}/messages`,
      "POST",
      {
        body,
      },
    );
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
        id: { type: "string", required: true },
        message: { type: "object", required: true },
      },
    );
    return internalRequest(this.sdk, `/chat/messages/${id}`, "PATCH", {
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
    this.sdk.validateParams(
      { url },
      { url: { type: "string", required: true } },
    );
    return internalRequest(
      this.sdk,
      `/chat/link-preview?url=${encodeURIComponent(url)}`,
      "GET",
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
        id: { type: "string", required: true },
        url: { type: "string", required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/chat/messages/${id}/unfurls/hide`,
      "POST",
      { body: { url } },
    );
  }

  /**
   * Delete a message (tombstone).
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async deleteMessage(id) {
    this.sdk.validateParams({ id }, { id: { type: "string", required: true } });
    return internalRequest(this.sdk, `/chat/messages/${id}`, "DELETE");
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
        id: { type: "string", required: true },
        emoji: { type: "string", required: true },
      },
    );
    return internalRequest(this.sdk, `/chat/messages/${id}/reactions`, "POST", {
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
        id: { type: "string", required: true },
        emoji: { type: "string", required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/chat/messages/${id}/reactions`,
      "DELETE",
      {
        body: { emoji },
      },
    );
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
        channelId: { type: "string", required: true },
        rootId: { type: "string", required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/chat/channels/${channelId}/messages/${rootId}/thread`,
      "GET",
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
        q: { type: "string", required: true },
        channelId: { type: "string", required: false },
        fromUserId: { type: "string", required: false },
        before: { type: "string", required: false },
        after: { type: "string", required: false },
        kind: { type: "string", required: false },
        nextId: { type: "string", required: false },
        limit: { type: "number", required: false },
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

    return internalRequest(this.sdk, "/chat/search", "GET", { query });
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
        channelId: { type: "string", required: true },
        name: { type: "string", required: true },
        avatar: { type: "string", required: false },
        callbackUrl: { type: "string", required: false },
      },
    );

    const body = { name };
    if (avatar !== undefined) body.avatar = avatar;
    if (callbackUrl !== undefined) body.callbackUrl = callbackUrl;

    return internalRequest(
      this.sdk,
      `/chat/channels/${channelId}/webhooks`,
      "POST",
      {
        body,
      },
    );
  }

  /**
   * List webhooks for a channel.
   * @param {string} channelId
   * @returns {Promise<Object>}
   */
  async listWebhooks(channelId) {
    this.sdk.validateParams(
      { channelId },
      { channelId: { type: "string", required: true } },
    );
    return internalRequest(
      this.sdk,
      `/chat/channels/${channelId}/webhooks`,
      "GET",
    );
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
        channelId: { type: "string", required: true },
        webhookId: { type: "string", required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/chat/channels/${channelId}/webhooks/${webhookId}`,
      "DELETE",
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
        messageId: { type: "string", required: true },
        actionId: { type: "string", required: true },
        value: { type: "string", required: false },
      },
    );

    const body = { actionId };
    if (value !== undefined) body.value = value;

    return internalRequest(
      this.sdk,
      `/chat/messages/${messageId}/actions`,
      "POST",
      {
        body,
      },
    );
  }

  /**
   * Report a message. Refused (403) if reporting is disabled for the
   * account, the message is the caller's own, a system message, or
   * already deleted.
   * @param {string} id
   * @param {Object} params
   * @param {string} [params.reason] - One of the account's reportReasons
   * @param {string} [params.note] - Optional free-text detail (max 500 chars)
   * @returns {Promise<Object>}
   */
  async reportMessage(id, { reason, note } = {}) {
    this.sdk.validateParams(
      { id, reason, note },
      {
        id: { type: "string", required: true },
        reason: { type: "string", required: false },
        note: { type: "string", required: false },
      },
    );
    const body = {};
    if (reason !== undefined) body.reason = reason;
    if (note !== undefined) body.note = note;
    return internalRequest(this.sdk, `/chat/messages/${id}/report`, "POST", {
      body,
    });
  }

  /**
   * Get chat settings relevant to the caller (e.g. whether message
   * reporting is enabled for the account).
   * @returns {Promise<Object>} `{allowReports, reportReasons}`
   */
  async getSettings() {
    return internalRequest(this.sdk, "/chat/settings", "GET");
  }

  /**
   * Admin: get account-level chat settings.
   * @returns {Promise<Object>} `{allowReports, reportReasons, reportNotifications}`
   *   `reportNotifications[]` items are `{channelId, channelName, channelKind, reasons}` —
   *   `reasons` is `null` when the rule notifies for every reason.
   */
  async adminGetSettings() {
    return internalRequest(this.sdk, "/chat/admin/settings", "GET");
  }

  /**
   * Admin: update account-level chat settings.
   * @param {Object} params
   * @param {boolean} params.allowReports
   * @param {string[]} [params.reportReasons]
   * @param {Object[]} [params.reportNotifications] - Channels to post a
   *   "message reported" card to. Each item: `{channelId: string, reasons:
   *   string[]|null}` — `reasons` null/empty means "notify for every
   *   reason"; channel must be a non-archived public/private channel.
   * @returns {Promise<Object>} `{allowReports, reportReasons, reportNotifications}`
   */
  async adminPutSettings({
    allowReports,
    reportReasons,
    reportNotifications,
  } = {}) {
    this.sdk.validateParams(
      { allowReports, reportReasons, reportNotifications },
      {
        allowReports: { type: "boolean", required: true },
        reportReasons: { type: "array", required: false },
        reportNotifications: { type: "array", required: false },
      },
    );
    const body = { allowReports };
    if (reportReasons !== undefined) body.reportReasons = reportReasons;
    if (reportNotifications !== undefined) {
      body.reportNotifications = reportNotifications;
    }
    return internalRequest(this.sdk, "/chat/admin/settings", "PUT", {
      body,
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
        q: { type: "string", required: false },
        kind: { type: "string", required: false },
      },
    );

    const query = {};
    if (q !== undefined) query.q = q;
    if (kind !== undefined) query.kind = kind;

    return internalRequest(this.sdk, "/chat/admin/channels", "GET", { query });
  }

  /**
   * Admin: get a channel by id (no membership required).
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async adminGetChannel(id) {
    this.sdk.validateParams({ id }, { id: { type: "string", required: true } });
    return internalRequest(this.sdk, `/chat/admin/channels/${id}`, "GET");
  }

  /**
   * Admin: export a channel (messages + members).
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async adminExportChannel(id) {
    this.sdk.validateParams({ id }, { id: { type: "string", required: true } });
    return internalRequest(
      this.sdk,
      `/chat/admin/channels/${id}/export`,
      "GET",
    );
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
      { status: { type: "string", required: false } },
    );

    const query = {};
    if (status !== undefined) query.status = status;

    return internalRequest(this.sdk, "/chat/admin/reports", "GET", { query });
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
        id: { type: "string", required: true },
        status: { type: "string", required: true },
      },
    );
    return internalRequest(this.sdk, `/chat/admin/reports/${id}`, "POST", {
      body: { status },
    });
  }

  /**
   * Admin: delete a message (moderation).
   * @param {string} id
   * @param {Object} [params]
   * @param {string} [params.reason]
   * @returns {Promise<Object>}
   */
  async adminDeleteMessage(id, { reason } = {}) {
    this.sdk.validateParams(
      { id, reason },
      {
        id: { type: "string", required: true },
        reason: { type: "string", required: false },
      },
    );
    const query = {};
    if (reason !== undefined) query.reason = reason;
    return internalRequest(this.sdk, `/chat/admin/messages/${id}`, "DELETE", {
      query,
    });
  }

  /**
   * Admin: hide a reported message from user-facing chat (reversible).
   * Content stays visible to admins. Creates/updates the permanent
   * moderation case for the message.
   * @param {string} id
   * @returns {Promise<Object>} the hidden message, plus `caseId`
   */
  async adminHideMessage(id) {
    this.sdk.validateParams({ id }, { id: { type: "string", required: true } });
    return internalRequest(this.sdk, `/chat/admin/messages/${id}/hide`, "POST");
  }

  /**
   * Admin: apply the final disposition to a hidden (or never-hidden)
   * message — restore it, delete it (stays hidden, content retained
   * subject to retention), or purge it (content expunged everywhere now).
   * Also closes every open report on the message.
   * @param {string} id
   * @param {Object} params
   * @param {'restore'|'delete'|'purge'} params.action
   * @param {string} params.reason Free text, at least 3 characters
   * @param {string} [params.description] Required (>= 3 chars) for `purge` —
   *   describes what the content was, since the content itself is removed
   * @returns {Promise<Object>} the updated message, plus `caseId`/`caseAction`
   */
  async adminDispositionMessage(id, { action, reason, description } = {}) {
    this.sdk.validateParams(
      { id, action, reason, description },
      {
        id: { type: "string", required: true },
        action: { type: "string", required: true },
        reason: { type: "string", required: true },
        description: { type: "string", required: false },
      },
    );
    const body = { action, reason };
    if (description !== undefined) body.description = description;
    return internalRequest(
      this.sdk,
      `/chat/admin/messages/${id}/disposition`,
      "POST",
      { body },
    );
  }

  /**
   * Admin: list moderation dispositions (permanent per-message
   * hide/disposition history — one row per message).
   * @param {Object} [params]
   * @param {'open'|'closed'|'all'} [params.status]
   * @param {string} [params.authorId]
   * @param {string} [params.nextId] Pagination cursor (disposition id)
   * @param {number} [params.limit]
   * @returns {Promise<Object>} `{results, hasMore, nextId}`
   */
  async adminListDispositions({ status, authorId, nextId, limit } = {}) {
    this.sdk.validateParams(
      { status, authorId, nextId, limit },
      {
        status: { type: "string", required: false },
        authorId: { type: "string", required: false },
        nextId: { type: "string", required: false },
        limit: { type: "number", required: false },
      },
    );
    const query = {};
    if (status !== undefined) query.status = status;
    if (authorId !== undefined) query.authorId = authorId;
    if (nextId !== undefined) query.nextId = nextId;
    if (limit !== undefined) query.limit = limit;
    return internalRequest(this.sdk, "/chat/admin/dispositions", "GET", {
      query,
    });
  }

  /**
   * Admin: get one moderation disposition — hydrated with its message
   * (content per the usual rules) and reports.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async adminGetDisposition(id) {
    this.sdk.validateParams({ id }, { id: { type: "string", required: true } });
    return internalRequest(this.sdk, `/chat/admin/dispositions/${id}`, "GET");
  }

  /**
   * Admin: list chat cases (multi-message investigations — distinct from
   * the per-message disposition ledger above).
   * @param {Object} [params]
   * @param {'open'|'in_review'|'closed'|'all'} [params.status]
   * @param {string} [params.category]
   * @param {string} [params.ownerId]
   * @param {string} [params.q] Substring match on title
   * @param {string} [params.nextId] Pagination cursor (case id)
   * @param {number} [params.limit]
   * @returns {Promise<Object>} `{results, hasMore, nextId}` — each result
   *   includes `itemCount`, `noteCount`, `lastActivityAt`
   */
  async adminListCases({ status, category, ownerId, q, nextId, limit } = {}) {
    this.sdk.validateParams(
      { status, category, ownerId, q, nextId, limit },
      {
        status: { type: "string", required: false },
        category: { type: "string", required: false },
        ownerId: { type: "string", required: false },
        q: { type: "string", required: false },
        nextId: { type: "string", required: false },
        limit: { type: "number", required: false },
      },
    );
    const query = {};
    if (status !== undefined) query.status = status;
    if (category !== undefined) query.category = category;
    if (ownerId !== undefined) query.ownerId = ownerId;
    if (q !== undefined) query.q = q;
    if (nextId !== undefined) query.nextId = nextId;
    if (limit !== undefined) query.limit = limit;
    return internalRequest(this.sdk, "/chat/admin/cases", "GET", { query });
  }

  /**
   * Admin: create a chat case, optionally seeding it with messages
   * (report ids on those messages are auto-attached to the created item).
   * @param {Object} params
   * @param {string} params.title
   * @param {string} [params.category]
   * @param {string} [params.description]
   * @param {string} [params.ownerId]
   * @param {string[]} [params.messageIds]
   * @returns {Promise<Object>} the case, plus `items`/`notes`
   */
  async adminCreateCase({ title, category, description, ownerId, messageIds }) {
    this.sdk.validateParams(
      { title, category, description, ownerId, messageIds },
      {
        title: { type: "string", required: true },
        category: { type: "string", required: false },
        description: { type: "string", required: false },
        ownerId: { type: "string", required: false },
        messageIds: { type: "array", required: false },
      },
    );
    const body = { title };
    if (category !== undefined) body.category = category;
    if (description !== undefined) body.description = description;
    if (ownerId !== undefined) body.ownerId = ownerId;
    if (messageIds !== undefined) body.messageIds = messageIds;
    return internalRequest(this.sdk, "/chat/admin/cases", "POST", { body });
  }

  /**
   * Admin: get one chat case — hydrated with its items (each with
   * message/channel/reports/disposition) and its note trail.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async adminGetCase(id) {
    this.sdk.validateParams({ id }, { id: { type: "string", required: true } });
    return internalRequest(this.sdk, `/chat/admin/cases/${id}`, "GET");
  }

  /**
   * Admin: update a chat case's fields. `status` may only move between
   * 'open' and 'in_review' here — use adminCloseCase/adminReopenCase to
   * close or reopen.
   * @param {string} id
   * @param {Object} params
   * @param {string} [params.title]
   * @param {string} [params.category]
   * @param {string} [params.description]
   * @param {string} [params.ownerId]
   * @param {'open'|'in_review'} [params.status]
   * @returns {Promise<Object>}
   */
  async adminUpdateCase(
    id,
    { title, category, description, ownerId, status } = {},
  ) {
    this.sdk.validateParams(
      { id, title, category, description, ownerId, status },
      {
        id: { type: "string", required: true },
        title: { type: "string", required: false },
        category: { type: "string", required: false },
        description: { type: "string", required: false },
        ownerId: { type: "string", required: false },
        status: { type: "string", required: false },
      },
    );
    const body = {};
    if (title !== undefined) body.title = title;
    if (category !== undefined) body.category = category;
    if (description !== undefined) body.description = description;
    if (ownerId !== undefined) body.ownerId = ownerId;
    if (status !== undefined) body.status = status;
    return internalRequest(this.sdk, `/chat/admin/cases/${id}`, "PATCH", {
      body,
    });
  }

  /**
   * Admin: attach messages to a case (reportIds auto-filled from each
   * message's open reports). Messages already on the case are skipped.
   * @param {string} id
   * @param {Object} params
   * @param {string[]} params.messageIds
   * @returns {Promise<Object>}
   */
  async adminAddCaseItems(id, { messageIds }) {
    this.sdk.validateParams(
      { id, messageIds },
      {
        id: { type: "string", required: true },
        messageIds: { type: "array", required: true },
      },
    );
    return internalRequest(this.sdk, `/chat/admin/cases/${id}/items`, "POST", {
      body: { messageIds },
    });
  }

  /**
   * Admin: remove one message from a case.
   * @param {string} id
   * @param {string} messageId
   * @returns {Promise<Object>}
   */
  async adminRemoveCaseItem(id, messageId) {
    this.sdk.validateParams(
      { id, messageId },
      {
        id: { type: "string", required: true },
        messageId: { type: "string", required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/chat/admin/cases/${id}/items/${messageId}`,
      "DELETE",
    );
  }

  /**
   * Admin: add a note to a case.
   * @param {string} id
   * @param {Object} params
   * @param {string} params.body
   * @returns {Promise<Object>}
   */
  async adminAddCaseNote(id, { body }) {
    this.sdk.validateParams(
      { id, body },
      {
        id: { type: "string", required: true },
        body: { type: "string", required: true },
      },
    );
    return internalRequest(this.sdk, `/chat/admin/cases/${id}/notes`, "POST", {
      body: { body },
    });
  }

  /**
   * Admin: close a case with a required outcome and note. Appends a
   * system note to the case.
   * @param {string} id
   * @param {Object} params
   * @param {'no_action'|'warned'|'escalated_hr'|'content_removed'|'other'} params.outcome
   * @param {string} params.note
   * @returns {Promise<Object>}
   */
  async adminCloseCase(id, { outcome, note }) {
    this.sdk.validateParams(
      { id, outcome, note },
      {
        id: { type: "string", required: true },
        outcome: { type: "string", required: true },
        note: { type: "string", required: true },
      },
    );
    return internalRequest(this.sdk, `/chat/admin/cases/${id}/close`, "POST", {
      body: { outcome, note },
    });
  }

  /**
   * Admin: reopen a closed case with a required reason. Clears
   * outcome/closedAt/closedBy/closeNote and appends a system note.
   * @param {string} id
   * @param {Object} params
   * @param {string} params.reason
   * @returns {Promise<Object>}
   */
  async adminReopenCase(id, { reason }) {
    this.sdk.validateParams(
      { id, reason },
      {
        id: { type: "string", required: true },
        reason: { type: "string", required: true },
      },
    );
    return internalRequest(this.sdk, `/chat/admin/cases/${id}/reopen`, "POST", {
      body: { reason },
    });
  }

  /**
   * Admin: list the chat cases a message is linked to (for a report/
   * flagged-message "Add to case" affordance).
   * @param {string} messageId
   * @returns {Promise<Object>} `{results}`
   */
  async adminListMessageCases(messageId) {
    this.sdk.validateParams(
      { messageId },
      { messageId: { type: "string", required: true } },
    );
    return internalRequest(
      this.sdk,
      `/chat/admin/messages/${messageId}/cases`,
      "GET",
    );
  }

  /**
   * Admin: audit log of review actions.
   * @returns {Promise<Object>}
   */
  async adminAudit() {
    return internalRequest(this.sdk, "/chat/admin/audit", "GET");
  }

  /**
   * Admin: full-account message search (no membership ACL).
   * @param {Object} [params]
   * @param {string} [params.q] Boolean-mode fulltext; quoted phrases pass through
   * @param {string[]} [params.userIds]
   * @param {string[]} [params.channelIds] Empty/omitted = all channels
   * @param {string[]} [params.kinds]
   * @param {string} [params.from] ISO date/datetime
   * @param {string} [params.to] ISO date/datetime
   * @param {boolean} [params.includeDeleted] Default true server-side
   * @param {string} [params.nextId] Pagination cursor (message id)
   * @param {number} [params.limit]
   * @returns {Promise<Object>} `{results: [{message, channel}], nextId}`
   */
  async adminSearch({
    q,
    userIds,
    channelIds,
    kinds,
    from,
    to,
    includeDeleted,
    nextId,
    limit,
  } = {}) {
    this.sdk.validateParams(
      {
        q,
        userIds,
        channelIds,
        kinds,
        from,
        to,
        includeDeleted,
        nextId,
        limit,
      },
      {
        q: { type: "string", required: false },
        userIds: { type: "array", required: false },
        channelIds: { type: "array", required: false },
        kinds: { type: "array", required: false },
        from: { type: "string", required: false },
        to: { type: "string", required: false },
        includeDeleted: { type: "boolean", required: false },
        nextId: { type: "string", required: false },
        limit: { type: "number", required: false },
      },
    );

    // Array params use bracket notation (`userIds[]=a&userIds[]=b`) so the
    // API's qs parser always yields an array, even for a single value.
    const query = [];
    if (q !== undefined) query.push(["q", q]);
    for (const v of userIds || []) query.push(["userIds[]", v]);
    for (const v of channelIds || []) query.push(["channelIds[]", v]);
    for (const v of kinds || []) query.push(["kinds[]", v]);
    if (from !== undefined) query.push(["from", from]);
    if (to !== undefined) query.push(["to", to]);
    if (includeDeleted !== undefined) {
      query.push(["includeDeleted", includeDeleted ? "1" : "0"]);
    }
    if (nextId !== undefined) query.push(["nextId", nextId]);
    if (limit !== undefined) query.push(["limit", String(limit)]);

    return internalRequest(this.sdk, "/chat/admin/search", "GET", { query });
  }

  /**
   * Admin: get a message (any channel) with its channel and pre-edit original.
   * @param {string} id
   * @returns {Promise<Object>} `{message, channel, original}`
   */
  async adminGetMessage(id) {
    this.sdk.validateParams({ id }, { id: { type: "string", required: true } });
    return internalRequest(this.sdk, `/chat/admin/messages/${id}`, "GET");
  }

  /**
   * Admin: free-form edit of a message; reason required, no edit window.
   * @param {string} id
   * @param {Object} params
   * @param {Object} params.message Message doc
   * @param {string} params.reason
   * @returns {Promise<Object>} Updated message
   */
  async adminEditMessage(id, { message, reason } = {}) {
    this.sdk.validateParams(
      { id, message, reason },
      {
        id: { type: "string", required: true },
        message: { type: "object", required: true },
        reason: { type: "string", required: true },
      },
    );
    return internalRequest(this.sdk, `/chat/admin/messages/${id}`, "PATCH", {
      body: { message, reason },
    });
  }

  /**
   * Admin: get a message report with its message and channel.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async adminGetReport(id) {
    this.sdk.validateParams({ id }, { id: { type: "string", required: true } });
    return internalRequest(this.sdk, `/chat/admin/reports/${id}`, "GET");
  }

  /**
   * Admin: list audit events.
   * @param {Object} [params]
   * @param {string} [params.type]
   * @param {string} [params.actorId]
   * @param {string} [params.channelId]
   * @param {string} [params.from]
   * @param {string} [params.to]
   * @param {string} [params.nextId]
   * @param {number} [params.limit]
   * @returns {Promise<Object>} `{results, nextId}`
   */
  async adminListAudit({
    type,
    actorId,
    channelId,
    from,
    to,
    nextId,
    limit,
  } = {}) {
    this.sdk.validateParams(
      { type, actorId, channelId, from, to, nextId, limit },
      {
        type: { type: "string", required: false },
        actorId: { type: "string", required: false },
        channelId: { type: "string", required: false },
        from: { type: "string", required: false },
        to: { type: "string", required: false },
        nextId: { type: "string", required: false },
        limit: { type: "number", required: false },
      },
    );

    const query = {};
    if (type !== undefined) query.type = type;
    if (actorId !== undefined) query.actorId = actorId;
    if (channelId !== undefined) query.channelId = channelId;
    if (from !== undefined) query.from = from;
    if (to !== undefined) query.to = to;
    if (nextId !== undefined) query.nextId = nextId;
    if (limit !== undefined) query.limit = limit;

    return internalRequest(this.sdk, "/chat/admin/audit", "GET", { query });
  }

  /**
   * Admin: list per-group default channels.
   * @returns {Promise<Object>} `{results: [{group, channels}]}`
   */
  async adminListDefaults() {
    return internalRequest(this.sdk, "/chat/admin/defaults", "GET");
  }

  /**
   * Admin: list all webhooks across channels.
   * @returns {Promise<Object>} `{results}`
   */
  async adminListWebhooks() {
    return internalRequest(this.sdk, "/chat/admin/webhooks", "GET");
  }

  /**
   * Admin: list retention policies (account default + per-kind overrides).
   * @returns {Promise<Object>} `{results}`
   */
  async adminGetRetention() {
    return internalRequest(this.sdk, "/chat/admin/retention", "GET");
  }

  /**
   * Admin: upsert retention policies.
   * @param {Object[]} policies
   * @param {'account'|'kind'} policies[].scope
   * @param {string} [policies[].kind]
   * @param {number|null} [policies[].purgeDeletedAfterDays]
   * @param {boolean} [policies[].enabled]
   * @returns {Promise<Object>} `{results}`
   */
  async adminPutRetention(policies) {
    this.sdk.validateParams(
      { policies },
      { policies: { type: "array", required: true } },
    );
    return internalRequest(this.sdk, "/chat/admin/retention", "PUT", {
      body: { policies },
    });
  }

  /**
   * Admin: preview counts that would purge now, per retention policy.
   * @returns {Promise<Object>} `{results, heldSearchCount, heldMessageCount}`
   *   `heldSearchCount` is the number of saved searches currently on legal
   *   hold; `heldMessageCount` is how many otherwise-purgeable messages are
   *   protected by those holds (across all policies).
   */
  async adminRetentionPreview() {
    return internalRequest(this.sdk, "/chat/admin/retention/preview", "GET");
  }

  /**
   * Admin: set or release legal hold on a channel.
   * @param {string} id
   * @param {Object} params
   * @param {boolean} params.hold
   * @returns {Promise<Object>} Updated channel
   */
  async adminSetLegalHold(id, { hold } = {}) {
    this.sdk.validateParams(
      { id, hold },
      {
        id: { type: "string", required: true },
        hold: { type: "boolean", required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/chat/admin/channels/${id}/legal-hold`,
      "POST",
      { body: { hold } },
    );
  }

  /**
   * Admin: list saved searches (own + shared with chat:admin:review).
   * @returns {Promise<Object>} `{results}`
   */
  async adminListSavedSearches() {
    return internalRequest(this.sdk, "/chat/admin/saved-searches", "GET");
  }

  /**
   * Admin: create a saved search.
   * @param {Object} params
   * @param {string} params.name
   * @param {Object} params.criteria Search criteria (same shape as adminSearch params)
   * @param {boolean} [params.shared] Shared with everyone holding chat:admin:review
   * @param {Object} [params.hold] Legal hold — `{enabled, reason}`. `reason` is
   *   required (max 500 chars) when `enabled` is true. Freezes every message
   *   matching `criteria` against retention purge until released.
   * @returns {Promise<Object>} `{id}`
   */
  async adminCreateSavedSearch({ name, criteria, shared, hold } = {}) {
    this.sdk.validateParams(
      { name, criteria, shared, hold },
      {
        name: { type: "string", required: true },
        criteria: { type: "object", required: true },
        shared: { type: "boolean", required: false },
        hold: { type: "object", required: false },
      },
    );
    const body = { name, criteria };
    if (shared !== undefined) body.shared = shared;
    if (hold !== undefined) body.hold = hold;
    return internalRequest(this.sdk, "/chat/admin/saved-searches", "POST", {
      body,
    });
  }

  /**
   * Admin: update a saved search (owner only).
   * @param {string} id
   * @param {Object} [patch]
   * @param {string} [patch.name]
   * @param {Object} [patch.criteria]
   * @param {boolean} [patch.shared]
   * @param {Object} [patch.hold] `{enabled, reason}` — set `enabled: false`
   *   to release an active hold; `reason` required when enabling.
   * @returns {Promise<Object>} Updated saved search — includes
   *   `hold: {enabled, reason, by, at} | null`
   */
  async adminUpdateSavedSearch(id, { name, criteria, shared, hold } = {}) {
    this.sdk.validateParams(
      { id, hold },
      {
        id: { type: "string", required: true },
        hold: { type: "object", required: false },
      },
    );
    const body = {};
    if (name !== undefined) body.name = name;
    if (criteria !== undefined) body.criteria = criteria;
    if (shared !== undefined) body.shared = shared;
    if (hold !== undefined) body.hold = hold;
    return internalRequest(
      this.sdk,
      `/chat/admin/saved-searches/${id}`,
      "PATCH",
      { body },
    );
  }

  /**
   * Admin: delete a saved search (owner only). Refused (400) while the
   * saved search has an active legal hold — release it first.
   * @param {string} id
   * @returns {Promise<Object>} `{id}`
   */
  async adminDeleteSavedSearch(id) {
    this.sdk.validateParams({ id }, { id: { type: "string", required: true } });
    return internalRequest(
      this.sdk,
      `/chat/admin/saved-searches/${id}`,
      "DELETE",
    );
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
        relatedId: { type: "string", required: true },
        recordTypeId: { type: "string", required: true },
      },
    );
    return internalRequest(this.sdk, `/chat/records/${relatedId}`, "GET", {
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
        relatedId: { type: "string", required: true },
        message: { type: "object", required: true },
        recordTypeId: { type: "string", required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/chat/records/${relatedId}/messages`,
      "POST",
      {
        body: { message, recordTypeId },
      },
    );
  }

  /**
   * Get the Meet/Call room for a channel.
   * @param {string} channelId
   * @returns {Promise<Object>}
   */
  async getChannelMeet(channelId) {
    this.sdk.validateParams(
      { channelId },
      { channelId: { type: "string", required: true } },
    );
    return internalRequest(this.sdk, `/chat/channels/${channelId}/meet`, "GET");
  }

  /**
   * Get the VAPID public key for Web Push subscription.
   * @returns {Promise<Object>}
   */
  async getVapidPublicKey() {
    return internalRequest(this.sdk, "/chat/push/vapidPublicKey", "GET");
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
        kind: { type: "string", required: true },
        subscription: { type: "object", required: true },
      },
    );
    return internalRequest(this.sdk, "/chat/push/devices", "POST", {
      body: { kind, subscription },
    });
  }

  /**
   * Unregister a push device.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async unregisterPushDevice(id) {
    this.sdk.validateParams({ id }, { id: { type: "string", required: true } });
    return internalRequest(this.sdk, `/chat/push/devices/${id}`, "DELETE");
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
        channelId: { type: "string", required: true },
        notifyLevel: { type: "string", required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/chat/channels/${channelId}/notify`,
      "PATCH",
      {
        body: { notifyLevel },
      },
    );
  }

  /**
   * List the caller's pinned conversations (channel or record).
   * @returns {Promise<Object>}
   */
  async listPins() {
    return internalRequest(this.sdk, "/chat/pins", "GET");
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
        kind: { type: "string", required: true },
        channelId: { type: "string", required: false },
        relatedId: { type: "string", required: false },
        relatedRecordTypeId: { type: "string", required: false },
      },
    );
    const body = { kind };
    if (channelId !== undefined) body.channelId = channelId;
    if (relatedId !== undefined) body.relatedId = relatedId;
    if (relatedRecordTypeId !== undefined)
      body.relatedRecordTypeId = relatedRecordTypeId;
    return internalRequest(this.sdk, "/chat/pins", "POST", { body });
  }

  /**
   * Remove a sidebar pin by id.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async unpinItem(id) {
    this.sdk.validateParams({ id }, { id: { type: "string", required: true } });
    return internalRequest(this.sdk, `/chat/pins/${id}`, "DELETE");
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
        channelId: { type: "string", required: true },
        messageId: { type: "string", required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/chat/channels/${channelId}/pinned-message`,
      "PUT",
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
      { channelId: { type: "string", required: true } },
    );
    return internalRequest(
      this.sdk,
      `/chat/channels/${channelId}/pinned-message`,
      "DELETE",
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
    return internalRequest(this.sdk, "/chat/mentions", "GET", { query });
  }

  /**
   * List thread roots the caller participates in.
   * @param {Object} [params]
   * @param {'public'|'private'|'dm'|'group_dm'|'record'} [params.kind]
   * @param {number} [params.limit]
   * @returns {Promise<Object>}
   */
  async listThreads({ kind, limit } = {}) {
    const query = {};
    if (kind) query.kind = kind;
    if (limit != null) query.limit = limit;
    return internalRequest(this.sdk, "/chat/threads", "GET", { query });
  }

  /**
   * List default channels for a group (auto-join on membership).
   * @param {string} groupId
   * @returns {Promise<Object>}
   */
  async getGroupDefaultChannels(groupId) {
    this.sdk.validateParams(
      { groupId },
      { groupId: { type: "string", required: true } },
    );
    return internalRequest(
      this.sdk,
      `/chat/groups/${groupId}/default-channels`,
      "GET",
    );
  }

  /**
   * Replace default channels for a group.
   * @param {string} groupId
   * @param {Object} [params]
   * @param {string[]} [params.channelIds]
   * @returns {Promise<Object>}
   */
  async setGroupDefaultChannels(groupId, { channelIds } = {}) {
    this.sdk.validateParams(
      { groupId, channelIds },
      {
        groupId: { type: "string", required: true },
        channelIds: { type: "array", required: false },
      },
    );
    return internalRequest(
      this.sdk,
      `/chat/groups/${groupId}/default-channels`,
      "PUT",
      { body: { channelIds } },
    );
  }

  /**
   * Create a Meet/Call room for a channel.
   * @param {string} channelId
   * @returns {Promise<Object>}
   */
  async createChannelMeet(channelId) {
    this.sdk.validateParams(
      { channelId },
      { channelId: { type: "string", required: true } },
    );
    return internalRequest(
      this.sdk,
      `/chat/channels/${channelId}/meet`,
      "POST",
      { body: {} },
    );
  }

  /**
   * Update a channel Meet/Call room.
   * @param {string} channelId
   * @param {Object} [patch]
   * @param {string} [patch.slug]
   * @param {string} [patch.password]
   * @param {boolean} [patch.guestsCanStart]
   * @param {boolean} [patch.startRecordingOn]
   * @param {boolean} [patch.startTranscribingOn]
   * @param {number} [patch.endMeetingWithoutHostTimeLimit]
   * @returns {Promise<Object>}
   */
  async updateChannelMeet(channelId, patch = {}) {
    this.sdk.validateParams(
      { channelId },
      { channelId: { type: "string", required: true } },
    );
    const body = {};
    for (const key of [
      "slug",
      "password",
      "guestsCanStart",
      "startRecordingOn",
      "startTranscribingOn",
      "endMeetingWithoutHostTimeLimit",
    ]) {
      if (patch[key] !== undefined) body[key] = patch[key];
    }
    return internalRequest(
      this.sdk,
      `/chat/channels/${channelId}/meet`,
      "PATCH",
      { body },
    );
  }

  /**
   * Check whether a Meet slug is available for a channel.
   * @param {string} channelId
   * @param {string} slug
   * @returns {Promise<Object>}
   */
  async checkChannelMeetSlug(channelId, slug) {
    this.sdk.validateParams(
      { channelId, slug },
      {
        channelId: { type: "string", required: true },
        slug: { type: "string", required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/chat/channels/${channelId}/meet/slug-available`,
      "GET",
      { query: { slug } },
    );
  }

  /**
   * Regenerate the Meet room password for a channel.
   * @param {string} channelId
   * @returns {Promise<Object>}
   */
  async regenerateChannelMeetPassword(channelId) {
    this.sdk.validateParams(
      { channelId },
      { channelId: { type: "string", required: true } },
    );
    return internalRequest(
      this.sdk,
      `/chat/channels/${channelId}/meet/regenerate-password`,
      "POST",
      { body: {} },
    );
  }

  /**
   * List chat bots for the account.
   * @returns {Promise<Object>}
   */
  async listBots() {
    return internalRequest(this.sdk, "/chat/bots", "GET");
  }

  /**
   * Update a chat bot.
   * @param {string} id
   * @param {Object} [params]
   * @param {string} [params.name]
   * @returns {Promise<Object>}
   */
  async updateBot(id, { name } = {}) {
    this.sdk.validateParams(
      { id, name },
      {
        id: { type: "string", required: true },
        name: { type: "string", required: false },
      },
    );
    return internalRequest(this.sdk, `/chat/bots/${id}`, "PATCH", {
      body: { name },
    });
  }

  /**
   * Get bot memory for a channel.
   * @param {string} channelId
   * @returns {Promise<Object>}
   */
  async getBotMemory(channelId) {
    this.sdk.validateParams(
      { channelId },
      { channelId: { type: "string", required: true } },
    );
    return internalRequest(
      this.sdk,
      `/chat/channels/${channelId}/bot-memory`,
      "GET",
    );
  }

  /**
   * Reset bot memory for a channel.
   * @param {string} channelId
   * @returns {Promise<Object>}
   */
  async resetBotMemory(channelId) {
    this.sdk.validateParams(
      { channelId },
      { channelId: { type: "string", required: true } },
    );
    return internalRequest(
      this.sdk,
      `/chat/channels/${channelId}/bot-memory/reset`,
      "POST",
      { body: {} },
    );
  }

  /**
   * Compact bot memory for a channel.
   * @param {string} channelId
   * @returns {Promise<Object>}
   */
  async compactBotMemory(channelId) {
    this.sdk.validateParams(
      { channelId },
      { channelId: { type: "string", required: true } },
    );
    return internalRequest(
      this.sdk,
      `/chat/channels/${channelId}/bot-memory/compact`,
      "POST",
      { body: {} },
    );
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

  async listAdminAudit(query) {
    // legacy callers passed a bare channelId string
    return this.adminListAudit(
      typeof query === "string" ? { channelId: query } : query,
    );
  }

  async listAdminMessages(channelId, query) {
    return this.listMessages(channelId, query);
  }

  async dismissAdminReport(id) {
    return this.adminReviewReport(id, { status: "dismissed" });
  }

  async actionAdminReport(id, body = {}) {
    return this.adminReviewReport(id, {
      status: body.status || "actioned",
    });
  }

  async getAdminReport(id) {
    return this.adminGetReport(id);
  }

  async getOriginalMessage(id) {
    return this.adminGetMessage(id);
  }

  async listAdminDefaults() {
    return this.adminListDefaults();
  }

  async listAdminWebhooks() {
    return this.adminListWebhooks();
  }

  /**
   * Get the chat channel that receives status updates for a source
   * (campaign, port, etc.). Returns `{ subscription: null }` if none.
   * @param {Object} params
   * @param {string} params.sourceType
   * @param {string} params.sourceId
   * @returns {Promise<{ subscription: Object|null }>}
   */
  async getAlertSubscription({ sourceType, sourceId }) {
    this.sdk.validateParams(
      { sourceType, sourceId },
      {
        sourceType: { type: "string", required: true },
        sourceId: { type: "string", required: true },
      },
    );
    return internalRequest(this.sdk, "/chat/alert-subscriptions", "GET", {
      query: { sourceType, sourceId },
    });
  }

  /**
   * Post status updates for a source to a chat channel.
   * Pass the caller's You channel (`openDm({ userIds: [] })`) as the default.
   * @param {Object} params
   * @param {string} params.sourceType
   * @param {string} params.sourceId
   * @param {string} params.channelId
   * @returns {Promise<{ subscription: Object }>}
   */
  async setAlertSubscription({ sourceType, sourceId, channelId }) {
    this.sdk.validateParams(
      { sourceType, sourceId, channelId },
      {
        sourceType: { type: "string", required: true },
        sourceId: { type: "string", required: true },
        channelId: { type: "string", required: true },
      },
    );
    return internalRequest(this.sdk, "/chat/alert-subscriptions", "PUT", {
      body: { sourceType, sourceId, channelId },
    });
  }

  /**
   * Stop posting status updates for a source.
   * @param {Object} params
   * @param {string} params.sourceType
   * @param {string} params.sourceId
   * @returns {Promise<Object>}
   */
  async deleteAlertSubscription({ sourceType, sourceId }) {
    this.sdk.validateParams(
      { sourceType, sourceId },
      {
        sourceType: { type: "string", required: true },
        sourceId: { type: "string", required: true },
      },
    );
    return internalRequest(this.sdk, "/chat/alert-subscriptions", "DELETE", {
      query: { sourceType, sourceId },
    });
  }
}
