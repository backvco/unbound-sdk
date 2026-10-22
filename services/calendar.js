import { internalRequest } from '../base.js';

// Native calendar. Office 365 is a later provider on the same sync-link API.
export class CalendarService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async listCalendars() {
    return internalRequest(this.sdk, '/calendar/calendars', 'GET', {});
  }

  async createCalendar(body) {
    this.sdk.validateParams(
      { body },
      { body: { type: 'object', required: true } },
    );
    return internalRequest(this.sdk, '/calendar/calendars', 'POST', { body });
  }

  async updateCalendar(id, body) {
    this.sdk.validateParams(
      { id, body },
      {
        id: { type: 'string', required: true },
        body: { type: 'object', required: true },
      },
    );
    return internalRequest(this.sdk, `/calendar/calendars/${id}`, 'PUT', {
      body,
    });
  }

  async deleteCalendar(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );
    return internalRequest(this.sdk, `/calendar/calendars/${id}`, 'DELETE', {});
  }

  async listShares(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/calendar/calendars/${id}/shares`,
      'GET',
      {},
    );
  }

  async replaceShares(id, shares) {
    this.sdk.validateParams(
      { id, shares },
      {
        id: { type: 'string', required: true },
        shares: { type: 'array', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/calendar/calendars/${id}/shares`,
      'PUT',
      { body: { shares } },
    );
  }

  async mintFeed(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/calendar/calendars/${id}/feed`,
      'POST',
      {},
    );
  }

  async revokeFeed(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/calendar/calendars/${id}/feed`,
      'DELETE',
      {},
    );
  }

  async listEvents({ calendarIds, from, to, expand, q } = {}) {
    const query = {};
    if (calendarIds) {
      query.calendarIds = Array.isArray(calendarIds)
        ? calendarIds.join(',')
        : calendarIds;
    }
    if (from) query.from = from;
    if (to) query.to = to;
    if (expand != null) query.expand = expand ? '1' : '0';
    if (q) query.q = q;
    return internalRequest(this.sdk, '/calendar/events', 'GET', { query });
  }

  async getEvent(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );
    return internalRequest(this.sdk, `/calendar/events/${id}`, 'GET', {});
  }

  async createEvent(body) {
    this.sdk.validateParams(
      { body },
      { body: { type: 'object', required: true } },
    );
    return internalRequest(this.sdk, '/calendar/events', 'POST', { body });
  }

  async updateEvent(id, body) {
    this.sdk.validateParams(
      { id, body },
      {
        id: { type: 'string', required: true },
        body: { type: 'object', required: true },
      },
    );
    return internalRequest(this.sdk, `/calendar/events/${id}`, 'PUT', { body });
  }

  async deleteEvent(id, scope, { occurrenceStart, recurrenceId } = {}) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );
    const query = {};
    if (scope) query.scope = scope;
    if (occurrenceStart) query.occurrenceStart = occurrenceStart;
    if (recurrenceId) query.recurrenceId = recurrenceId;
    return internalRequest(this.sdk, `/calendar/events/${id}`, 'DELETE', {
      query,
    });
  }

  async rsvp(id, { partstat, comment, scope } = {}) {
    this.sdk.validateParams(
      { id, partstat },
      {
        id: { type: 'string', required: true },
        partstat: { type: 'string', required: true },
      },
    );
    return internalRequest(this.sdk, `/calendar/events/${id}/rsvp`, 'POST', {
      body: { partstat, comment, scope },
    });
  }

  async proposeTime(id, body) {
    this.sdk.validateParams(
      { id, body },
      {
        id: { type: 'string', required: true },
        body: { type: 'object', required: true },
      },
    );
    return internalRequest(
      this.sdk,
      `/calendar/events/${id}/propose-time`,
      'POST',
      { body },
    );
  }

  async forwardEvent(id, { emails } = {}) {
    this.sdk.validateParams(
      { id, emails },
      {
        id: { type: 'string', required: true },
        emails: { type: 'array', required: true },
      },
    );
    return internalRequest(this.sdk, `/calendar/events/${id}/forward`, 'POST', {
      body: { emails },
    });
  }

  async freebusy(body) {
    this.sdk.validateParams(
      { body },
      { body: { type: 'object', required: true } },
    );
    return internalRequest(this.sdk, '/calendar/freebusy', 'POST', { body });
  }

  async suggestTime(body) {
    this.sdk.validateParams(
      { body },
      { body: { type: 'object', required: true } },
    );
    return internalRequest(this.sdk, '/calendar/suggest-time', 'POST', { body });
  }

  async importIcs({ calendarId, ics } = {}) {
    this.sdk.validateParams(
      { calendarId, ics },
      {
        calendarId: { type: 'string', required: true },
        ics: { type: 'string', required: true },
      },
    );
    return internalRequest(this.sdk, '/calendar/import', 'POST', {
      body: { calendarId, ics },
    });
  }

  async exportIcs(calendarId) {
    this.sdk.validateParams(
      { calendarId },
      { calendarId: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/calendar/calendars/${calendarId}/export.ics`,
      'GET',
      {},
    );
  }

  async getSettings() {
    return internalRequest(this.sdk, '/calendar/settings', 'GET', {});
  }

  async updateSettings(body) {
    this.sdk.validateParams(
      { body },
      { body: { type: 'object', required: true } },
    );
    return internalRequest(this.sdk, '/calendar/settings', 'PUT', { body });
  }

  async getAdminSettings() {
    return internalRequest(this.sdk, '/calendar/admin/settings', 'GET', {});
  }

  async updateAdminSettings(body) {
    this.sdk.validateParams(
      { body },
      { body: { type: 'object', required: true } },
    );
    return internalRequest(this.sdk, '/calendar/admin/settings', 'PUT', { body });
  }

  async listAppPasswords() {
    return internalRequest(this.sdk, '/calendar/app-passwords', 'GET', {});
  }

  async createAppPassword({ label } = {}) {
    this.sdk.validateParams(
      { label },
      { label: { type: 'string', required: true } },
    );
    return internalRequest(this.sdk, '/calendar/app-passwords', 'POST', {
      body: { label },
    });
  }

  async deleteAppPassword(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/calendar/app-passwords/${id}`,
      'DELETE',
      {},
    );
  }

  async listSyncLinks() {
    return internalRequest(this.sdk, '/calendar/sync-links', 'GET', {});
  }

  async listGoogleCalendars(oauthConnectionId) {
    this.sdk.validateParams(
      { oauthConnectionId },
      { oauthConnectionId: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      '/calendar/sync-links/google/calendars',
      'GET',
      { query: { oauthConnectionId } },
    );
  }

  async createSyncLink(body) {
    this.sdk.validateParams(
      { body },
      { body: { type: 'object', required: true } },
    );
    return internalRequest(this.sdk, '/calendar/sync-links', 'POST', { body });
  }

  async updateSyncLink(id, body) {
    this.sdk.validateParams(
      { id, body },
      {
        id: { type: 'string', required: true },
        body: { type: 'object', required: true },
      },
    );
    return internalRequest(this.sdk, `/calendar/sync-links/${id}`, 'PUT', {
      body,
    });
  }

  async deleteSyncLink(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );
    return internalRequest(this.sdk, `/calendar/sync-links/${id}`, 'DELETE', {});
  }

  async resync(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/calendar/sync-links/${id}/resync`,
      'POST',
      {},
    );
  }

  async inviteFromEmail(emailId, { action, partstat, ics } = {}) {
    this.sdk.validateParams(
      { emailId, action },
      {
        emailId: { type: 'string', required: true },
        action: { type: 'string', required: true },
      },
    );
    const body = { action, partstat };
    if (ics) body.ics = ics;
    return internalRequest(
      this.sdk,
      `/calendar/invites/from-email/${emailId}`,
      'POST',
      { body },
    );
  }

  async listResources() {
    return internalRequest(this.sdk, '/calendar/resources', 'GET', {});
  }

  async createResource(body) {
    this.sdk.validateParams(
      { body },
      { body: { type: 'object', required: true } },
    );
    return internalRequest(this.sdk, '/calendar/resources', 'POST', { body });
  }

  async updateResource(id, body) {
    this.sdk.validateParams(
      { id, body },
      {
        id: { type: 'string', required: true },
        body: { type: 'object', required: true },
      },
    );
    return internalRequest(this.sdk, `/calendar/resources/${id}`, 'PUT', {
      body,
    });
  }

  async deleteResource(id) {
    this.sdk.validateParams(
      { id },
      { id: { type: 'string', required: true } },
    );
    return internalRequest(this.sdk, `/calendar/resources/${id}`, 'DELETE', {});
  }
}
