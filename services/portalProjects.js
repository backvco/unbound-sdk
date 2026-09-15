import { internalRequest } from "../base.js";

/**
 * Portal-session visitor API for Projects (`/portal-projects/`).
 *
 * Auth is `checkPortalSessionAuth` (portal JWT), not staff `checkApiAuth`.
 * Staff enablement stays on `sdk.portals.update` (`settings.projects`);
 * staff membership stays on objects `projectUsers` / `projectPeople` plus
 * `sdk.portals.invitePerson`.
 *
 * @see app1-api#239 / app1-api#264 / client #282
 */
export class PortalProjectsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  /**
   * Lists projects visible to the signed-in portal visitor
   * (explicit membership or public-to-related people/company).
   *
   * @param {object} [params]
   * @param {string} [params.q] - Optional name search.
   * @param {number} [params.limit] - Page size (API default 25, max 100).
   * @param {number} [params.offset] - Pagination offset (API default 0).
   * @returns {Promise<{
   *   projects: Array<{
   *     id: string,
   *     name: string|null,
   *     projectTypeId: string|null,
   *     companyId: string|null,
   *     peopleId: string|null,
   *     createdAt: string|null,
   *     updatedAt: string|null,
   *     role: "owner"|"contributor"|"viewer",
   *     accessSource: "member"|"related-people"|"related-company"
   *   }>,
   *   total: number,
   *   limit: number,
   *   offset: number
   * }>}
   */
  async list({ q, limit, offset } = {}) {
    this.sdk.validateParams(
      { q, limit, offset },
      {
        q: { type: "string", required: false },
        limit: { type: "number", required: false },
        offset: { type: "number", required: false },
      },
    );

    return internalRequest(this.sdk, "/portal-projects", "GET", {
      query: { q, limit, offset },
    });
  }

  /**
   * Retrieves one visible project plus the visitor's `role` / `accessSource`.
   *
   * @param {string} id - Project id.
   * @returns {Promise<{
   *   id: string,
   *   name: string|null,
   *   projectTypeId: string|null,
   *   companyId: string|null,
   *   peopleId: string|null,
   *   createdAt: string|null,
   *   updatedAt: string|null,
   *   role: "owner"|"contributor"|"viewer",
   *   accessSource: "member"|"related-people"|"related-company"
   * }>}
   */
  async get(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: "string", required: true },
      },
    );

    return internalRequest(
      this.sdk,
      `/portal-projects/${encodeURIComponent(id)}`,
      "GET",
    );
  }

  /**
   * Lists project members (staff users + portal people). User rows never
   * include email/phone.
   *
   * @param {string} id - Project id.
   * @returns {Promise<{
   *   members: Array<
   *     | { id: string, kind: "user", userId: string, role: string, name: string|null, title: string|null }
   *     | { id: string, kind: "people", peopleId: string, role: string, name: string|null, title: string|null, email: string|null }
   *   >
   * }>}
   */
  async listMembers(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: "string", required: true },
      },
    );

    return internalRequest(
      this.sdk,
      `/portal-projects/${encodeURIComponent(id)}/members`,
      "GET",
    );
  }

  /**
   * Adds a portal person as a project member. Owner-only; `peopleId` must
   * belong to the visitor's company. Role defaults to `viewer` on the API
   * when omitted.
   *
   * @param {string} id - Project id.
   * @param {object} params
   * @param {string} params.peopleId
   * @param {"owner"|"contributor"|"viewer"} [params.role]
   * @returns {Promise<{
   *   id: string,
   *   peopleId: string,
   *   role: "owner"|"contributor"|"viewer",
   *   kind: "people"
   * }>}
   */
  async addMember(id, { peopleId, role } = {}) {
    this.sdk.validateParams(
      { id, peopleId, role },
      {
        id: { type: "string", required: true },
        peopleId: { type: "string", required: true },
        role: { type: "string", required: false },
      },
    );

    const body = { peopleId };
    if (role !== undefined) body.role = role;

    return internalRequest(
      this.sdk,
      `/portal-projects/${encodeURIComponent(id)}/members`,
      "POST",
      { body },
    );
  }

  /**
   * Removes a portal-people membership row. Owner-only.
   *
   * @param {string} id - Project id.
   * @param {string} memberId - `projectPeople` row id.
   * @returns {Promise<{ ok: true, id: string }>}
   */
  async removeMember(id, memberId) {
    this.sdk.validateParams(
      { id, memberId },
      {
        id: { type: "string", required: true },
        memberId: { type: "string", required: true },
      },
    );

    return internalRequest(
      this.sdk,
      `/portal-projects/${encodeURIComponent(id)}/members/${encodeURIComponent(memberId)}`,
      "DELETE",
    );
  }

  /**
   * Lookup-only standing Meet room for the project. Never mints a room
   * from the portal; guests join with `url` + `password`.
   *
   * @param {string} id - Project id.
   * @returns {Promise<{ meet: object|null }>}
   */
  async getMeet(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: "string", required: true },
      },
    );

    return internalRequest(
      this.sdk,
      `/portal-projects/${encodeURIComponent(id)}/meet`,
      "GET",
    );
  }
}
