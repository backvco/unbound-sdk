/**
 * ChatService — channels, DMs, membership, unreads, and messages.
 * Backed by /chat/* on app1-api (checkApiAuth).
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

    return this.sdk._fetch('/chat/channels', 'POST', { body });
  }

  /**
   * List channels the current user is a member of.
   * @returns {Promise<Object>}
   */
  async listChannels() {
    return this.sdk._fetch('/chat/channels', 'GET');
  }

  /**
   * Browse joinable (public) channels.
   * @returns {Promise<Object>}
   */
  async browseChannels() {
    return this.sdk._fetch('/chat/channels/browse', 'GET');
  }

  /**
   * Get a channel by id.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getChannel(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return this.sdk._fetch(`/chat/channels/${id}`, 'GET');
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
  async updateChannel(id, { name, topic, settings } = {}) {
    this.sdk.validateParams(
      { id, name, topic, settings },
      {
        id: { type: 'string', required: true },
        name: { type: 'string', required: false },
        topic: { type: 'string', required: false },
        settings: { type: 'object', required: false },
      },
    );

    const body = {};
    if (name !== undefined) body.name = name;
    if (topic !== undefined) body.topic = topic;
    if (settings !== undefined) body.settings = settings;

    return this.sdk._fetch(`/chat/channels/${id}`, 'PATCH', { body });
  }

  /**
   * Archive a channel (reversible; hard delete is not supported).
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async archiveChannel(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return this.sdk._fetch(`/chat/channels/${id}/archive`, 'POST', {
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
    return this.sdk._fetch(`/chat/channels/${id}/unarchive`, 'POST', {
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
    return this.sdk._fetch(`/chat/channels/${id}/join`, 'POST', { body: {} });
  }

  /**
   * Leave a channel.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async leaveChannel(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return this.sdk._fetch(`/chat/channels/${id}/leave`, 'POST', { body: {} });
  }

  /**
   * List members of a channel.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async listMembers(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return this.sdk._fetch(`/chat/channels/${id}/members`, 'GET');
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

    return this.sdk._fetch(`/chat/channels/${id}/members`, 'POST', { body });
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
    return this.sdk._fetch(`/chat/channels/${id}/members/${userId}`, 'DELETE');
  }

  /**
   * Get group-default membership links for a channel.
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async getGroupDefaults(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return this.sdk._fetch(`/chat/channels/${id}/group-defaults`, 'GET');
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
    return this.sdk._fetch(`/chat/channels/${id}/group-defaults`, 'PUT', {
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
    return this.sdk._fetch('/chat/dms', 'POST', { body: { userIds } });
  }

  /**
   * Sidebar unread snapshot (channels + previews + counters).
   * @returns {Promise<Object>}
   */
  async getUnreads() {
    return this.sdk._fetch('/chat/unreads', 'GET');
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
    return this.sdk._fetch(`/chat/channels/${channelId}/read`, 'POST', {
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
    return this.sdk._fetch(`/chat/channels/${channelId}/unread`, 'POST', {
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
    return this.sdk._fetch(`/chat/groups/${groupId}/linked-channels`, 'GET', {
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

    return this.sdk._fetch(`/chat/channels/${channelId}/messages`, 'GET', {
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
    { message, threadRootId, alsoSendToChannel, storageIds } = {},
  ) {
    this.sdk.validateParams(
      { channelId, message, threadRootId, alsoSendToChannel, storageIds },
      {
        channelId: { type: 'string', required: true },
        message: { type: 'object', required: true },
        threadRootId: { type: 'string', required: false },
        alsoSendToChannel: { type: 'boolean', required: false },
        storageIds: { type: 'array', required: false },
      },
    );

    const body = { message };
    if (threadRootId !== undefined) body.threadRootId = threadRootId;
    if (alsoSendToChannel !== undefined) {
      body.alsoSendToChannel = alsoSendToChannel;
    }
    if (storageIds !== undefined) body.storageIds = storageIds;

    return this.sdk._fetch(`/chat/channels/${channelId}/messages`, 'POST', {
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
    return this.sdk._fetch(`/chat/messages/${id}`, 'PATCH', {
      body: { message },
    });
  }

  /**
   * Delete a message (tombstone).
   * @param {string} id
   * @returns {Promise<Object>}
   */
  async deleteMessage(id) {
    this.sdk.validateParams({ id }, { id: { type: 'string', required: true } });
    return this.sdk._fetch(`/chat/messages/${id}`, 'DELETE');
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
    return this.sdk._fetch(`/chat/messages/${id}/reactions`, 'POST', {
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
    return this.sdk._fetch(`/chat/messages/${id}/reactions`, 'DELETE', {
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
    return this.sdk._fetch(
      `/chat/channels/${channelId}/messages/${rootId}/thread`,
      'GET',
    );
  }
}
