import { InternalSimService } from './SimService.js';

/**
 * `sdk.internal` namespace on the main @unboundcx/sdk instance.
 *
 * Distinct from the separate `@unboundcx/sdk-internal` package (master
 * auth, SIP/voice/email internal routes for app1-ai-bot etc.): this is a
 * small, self-contained surface for the app1-simulator controller, which
 * already holds a signed-in admin SDK instance and just needs to swap in
 * an internal-API-key token for these specific calls.
 */
export class InternalService {
  constructor(sdk) {
    this.sdk = sdk;
    this.sim = new InternalSimService(sdk);
  }
}

export default InternalService;
