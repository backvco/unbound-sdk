import { internalRequest } from '../../base.js';

/**
 * app1-simulator internal surface (simulator-plan.md §14 routes B, C, G).
 * Internal-API-key auth: the caller sets `sdk.token` to a JWT signed with
 * `JWT_INTERNAL_API_KEY` (same mechanism as `buildInternalApiAuth` /
 * `InternalAuthService.issueBotUserToken` in app1-ai-bot) before calling
 * these methods. Every route is server-side gated by `SIM_ENABLED` and,
 * for mode/dids/purge, `SIM_ALLOWED_ACCOUNTS` + sim-pattern enforcement.
 *
 * Request/response contract: services/internal/SIM_CONTRACT.md.
 */
export class InternalSimService {
  constructor(sdk) {
    this.sdk = sdk;
    this.mode = {
      /**
       * POST /internal/sim/mode -- turn on SIM MODE for an account (every
       * carrier egress for that account sinks/rejects while set).
       * @param {object} args
       * @param {string} args.accountId
       * @param {number} [args.ttlSeconds=120]
       * @returns {Promise<{accountId: string, mode: 'on', expiresAt: string}>}
       */
      set: async ({ accountId, ttlSeconds } = {}) => {
        this.sdk.validateParams(
          { accountId, ttlSeconds },
          {
            accountId: { type: 'string', required: true },
            ttlSeconds: { type: 'number', required: false },
          },
        );
        return internalRequest(this.sdk, '/internal/sim/mode', 'POST', {
          body: { accountId, ttlSeconds },
        });
      },

      /**
       * DELETE /internal/sim/mode -- clear SIM MODE for an account.
       * @param {object} args
       * @param {string} args.accountId
       * @returns {Promise<{accountId: string, mode: 'off'}>}
       */
      clear: async ({ accountId } = {}) => {
        this.sdk.validateParams(
          { accountId },
          { accountId: { type: 'string', required: true } },
        );
        return internalRequest(this.sdk, '/internal/sim/mode', 'DELETE', {
          query: { accountId },
        });
      },

      /**
       * GET /internal/sim/mode -- current SIM MODE state for an account.
       * @param {object} args
       * @param {string} args.accountId
       * @returns {Promise<{accountId: string, mode: 'on'|'off', expiresAt: string|null}>}
       */
      get: async ({ accountId } = {}) => {
        this.sdk.validateParams(
          { accountId },
          { accountId: { type: 'string', required: true } },
        );
        return internalRequest(this.sdk, '/internal/sim/mode', 'GET', {
          query: { accountId },
        });
      },
    };

    this.dids = {
      /**
       * POST /internal/sim/dids -- provision sim DIDs (pattern-enforced,
       * no Telnyx). simulator-plan.md §7.3.
       * @param {object} args
       * @param {string} args.accountId
       * @param {Array<{phoneNumber: string, voiceApp?: string, voiceAppMetaData?: string, textApp?: string, textAppMetaData?: string}>} args.numbers
       * @returns {Promise<{created: Array<object>}>}
       */
      create: async ({ accountId, numbers } = {}) => {
        this.sdk.validateParams(
          { accountId, numbers },
          {
            accountId: { type: 'string', required: true },
            numbers: { type: 'array', required: true },
          },
        );
        return internalRequest(this.sdk, '/internal/sim/dids', 'POST', {
          body: { accountId, numbers },
        });
      },

      /**
       * GET /internal/sim/dids -- list sim DIDs provisioned for an account.
       * @param {object} args
       * @param {string} args.accountId
       * @returns {Promise<{dids: Array<object>}>}
       */
      list: async ({ accountId } = {}) => {
        this.sdk.validateParams(
          { accountId },
          { accountId: { type: 'string', required: true } },
        );
        return internalRequest(this.sdk, '/internal/sim/dids', 'GET', {
          query: { accountId },
        });
      },
    };
  }

  /**
   * POST /internal/sim/purge -- tear down everything a run created, pattern-
   * and run-scoped only (simulator-plan.md §7.1, §8).
   * @param {object} args
   * @param {string} args.accountId
   * @param {string} [args.runId]
   * @param {boolean} [args.dryRun=false]
   * @returns {Promise<{dryRun: boolean, counts: Object<string, number>, leaks?: Array<object>}>}
   */
  async purge({ accountId, runId, dryRun } = {}) {
    this.sdk.validateParams(
      { accountId, runId, dryRun },
      {
        accountId: { type: 'string', required: true },
        runId: { type: 'string', required: false },
        dryRun: { type: 'boolean', required: false },
      },
    );
    return internalRequest(this.sdk, '/internal/sim/purge', 'POST', {
      body: { accountId, runId, dryRun },
    });
  }

  /**
   * POST /internal/auth/sim-user-token -- agent bearer token without a
   * password/email (clone of bot-user-token, simulator-plan.md §14-B).
   * @param {object} args
   * @param {string} args.userId
   * @param {string} args.accountId
   * @returns {Promise<{token: string, expiresAt?: string}>}
   */
  async userToken({ userId, accountId } = {}) {
    this.sdk.validateParams(
      { userId, accountId },
      {
        userId: { type: 'string', required: true },
        accountId: { type: 'string', required: true },
      },
    );
    return internalRequest(this.sdk, '/internal/auth/sim-user-token', 'POST', {
      body: { userId, accountId },
    });
  }

  /**
   * POST /internal/sms/sim-inbound -- inject an inbound SMS/MMS through the
   * real `inboundSmsMms` routine (never the unverified public webhook).
   * `to` must be a `carrier='sim'` DID; `from` must match `SIM_NUMBER_RE`.
   * @param {object} args
   * @param {string} args.to
   * @param {string} args.from
   * @param {string} [args.text]
   * @param {string[]} [args.mediaUrls]
   * @returns {Promise<{taskId?: string, messageId: string}>}
   */
  async smsInbound({ to, from, text, mediaUrls } = {}) {
    this.sdk.validateParams(
      { to, from, text, mediaUrls },
      {
        to: { type: 'string', required: true },
        from: { type: 'string', required: true },
        text: { type: 'string', required: false },
        mediaUrls: { type: 'array', required: false },
      },
    );
    return internalRequest(this.sdk, '/internal/sms/sim-inbound', 'POST', {
      body: { to, from, text, mediaUrls },
    });
  }

  /**
   * POST /internal/email/sim-inbound -- inject an inbound email through
   * `ingestRawEmail` (real thread/attachments/body). `receivedAddress` must
   * be a sim DID's mailbox; the sender in `rawMime` must be `@sim.invalid`.
   * @param {object} args
   * @param {string} args.receivedAddress
   * @param {string} args.rawMime
   * @returns {Promise<{taskId?: string, messageId: string}>}
   */
  async emailInbound({ receivedAddress, rawMime } = {}) {
    this.sdk.validateParams(
      { receivedAddress, rawMime },
      {
        receivedAddress: { type: 'string', required: true },
        rawMime: { type: 'string', required: true },
      },
    );
    return internalRequest(this.sdk, '/internal/email/sim-inbound', 'POST', {
      body: { receivedAddress, rawMime },
    });
  }
}

export default InternalSimService;
