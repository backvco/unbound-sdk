import { internalRequest } from '../base.js';
import { FormsPublicService } from './forms/PublicService.js';
import { FormsSubmissionsService } from './forms/SubmissionsService.js';
import { FormsSettingsService } from './forms/SettingsService.js';
import { FormsHealthService } from './forms/HealthService.js';

// Forms v2 (forms-v2-plan.md §7 / forms-v2-precheck.md §5) -- `sdk.forms`.
// `public` needs no agent auth (VisitorService pattern, publicKey-scoped);
// `submissions`/`settings`/`health` are normal agent-token calls.
export class FormsService {
  constructor(sdk) {
    this.sdk = sdk;
    this.public = new FormsPublicService(sdk);
    this.submissions = new FormsSubmissionsService(sdk);
    this.settings = new FormsSettingsService(sdk);
    this.health = new FormsHealthService(sdk);
  }

  /**
   * Gap closure (task item 2, D1/D20). Mints a brand new `forms.publicKey`
   * and overwrites the old one -- every embed snippet/HTML still carrying
   * the old key stops resolving immediately (see the server route's doc
   * comment). A destructive action; callers should confirm with the user
   * before invoking (FormIdentitySettingsCard.svelte's "Regenerate" flow).
   * Server route: `POST /forms/:id/regenerate-key`
   * (app1-api/src/services/forms/controllers/regenerateFormPublicKey.js).
   * @param {string} formId
   * @returns {Promise<{publicKey:string}>}
   */
  async regeneratePublicKey(formId) {
    this.sdk.validateParams(
      { formId },
      { formId: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/forms/${encodeURIComponent(formId)}/regenerate-key`,
      'POST',
    );
  }

  /**
   * Gap closure (task item 3, D19). Mints a signed, 15-min-TTL token
   * scoped to this exact formId so a `draft`/non-`active` form's real
   * embed script can be requested via
   * `GET /f/:publicKey.js?preview=<token>` without making the form
   * publicly live. Server route: `POST /forms/:id/preview-token`
   * (app1-api/src/services/forms/controllers/mintFormPreviewToken.js);
   * verify side has been live since P2 (formEmbedPublicKey.js).
   * @param {string} formId
   * @returns {Promise<{token:string, expiresIn:number}>}
   */
  async previewToken(formId) {
    this.sdk.validateParams(
      { formId },
      { formId: { type: 'string', required: true } },
    );
    return internalRequest(
      this.sdk,
      `/forms/${encodeURIComponent(formId)}/preview-token`,
      'POST',
    );
  }
}
