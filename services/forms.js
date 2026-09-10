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
}
