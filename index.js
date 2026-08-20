/* eslint-disable indent */
/* eslint-disable prettier/prettier */

import { BaseSDK } from './base.js';
import { LoginService } from './services/login.js';
import { ObjectsService } from './services/objects.js';
import { MessagingService } from './services/messaging/MessagingService.js';
import { VideoService } from './services/video.js';
import { VoiceService } from './services/voice.js';
import { AIService } from './services/ai.js';
import { LookupService } from './services/lookup.js';
import { LayoutsService } from './services/layouts.js';
import { SubscriptionsService } from './services/subscriptions.js';
import { WorkflowsService } from './services/workflows.js';
import { NotesService } from './services/notes.js';
import { StorageService } from './services/storage.js';
import { VerificationService } from './services/verification.js';
import { PortalsService } from './services/portals.js';
import { SipEndpointsService } from './services/sipEndpoints.js';
import { ExternalOAuthService } from './services/externalOAuth.js';
import { GoogleCalendarService } from './services/googleCalendar.js';
import { EnrollService } from './services/enroll.js';
import { PhoneNumbersService } from './services/phoneNumbers.js';
import { RecordTypesService } from './services/recordTypes.js';
import { GenerateIdService } from './services/generateId.js';
import { EngagementMetricsService } from './services/engagementMetrics.js';
import { TaskRouterService } from './services/taskRouter.js';
import { KnowledgeBaseService } from './services/knowledgeBase.js';
import { FaxService } from './services/fax.js';
import { DocumentsService } from './services/documents.js';
import { PermissionsService } from './services/permissions.js';
import { TriggersService } from './services/triggers.js';
import { InboxService } from './services/inbox.js';
import { SearchService } from './services/search.js';
import { DirectoryService } from './services/directory.js';
import { ChatService } from './services/chat.js';

class UnboundSDK extends BaseSDK {
  constructor(options = {}) {
    // Support both object and legacy positional parameters for backwards compatibility
    if (typeof options === 'string') {
      // Legacy positional parameters: (namespace, callId, token, fwRequestId, url, socketStore)
      const namespace = options;
      const callId = arguments[1];
      const token = arguments[2];
      const fwRequestId = arguments[3];
      const url = arguments[4];
      const socketStore = arguments[5];

      super({ namespace, callId, token, fwRequestId });

      // Handle client-side specific parameters
      if (url) {
        this.baseUrl = url;
        this._initializeEnvironment();
      }

      if (socketStore) {
        this.socketStore = socketStore;
      }
    } else {
      // New object-based parameters
      const { namespace, callId, token, fwRequestId, url, socketStore } =
        options;

      super({ namespace, callId, token, fwRequestId });

      // Handle client-side specific parameters
      if (url) {
        this.baseUrl = url;
        this._initializeEnvironment();
      }

      if (socketStore) {
        this.socketStore = socketStore;
      }
    }

    // Initialize all service modules
    this.login = new LoginService(this);
    this.objects = new ObjectsService(this);
    this.messaging = new MessagingService(this);
    this.video = new VideoService(this);
    this.voice = new VoiceService(this);
    this.ai = new AIService(this);
    this.lookup = new LookupService(this);
    this.layouts = new LayoutsService(this);
    this.subscriptions = new SubscriptionsService(this);
    this.workflows = new WorkflowsService(this);
    this.notes = new NotesService(this);
    this.storage = new StorageService(this);
    this.verification = new VerificationService(this);
    this.portals = new PortalsService(this);
    this.sipEndpoints = new SipEndpointsService(this);
    this.externalOAuth = new ExternalOAuthService(this);
    this.googleCalendar = new GoogleCalendarService(this);
    this.enroll = new EnrollService(this);
    this.phoneNumbers = new PhoneNumbersService(this);
    this.recordTypes = new RecordTypesService(this);
    this.generateId = new GenerateIdService(this);
    this.engagementMetrics = new EngagementMetricsService(this);
    this.taskRouter = new TaskRouterService(this);
    this.knowledgeBase = new KnowledgeBaseService(this);
    this.fax = new FaxService(this);
    this.documents = new DocumentsService(this);
    this.permissions = new PermissionsService(this);
    this.triggers = new TriggersService(this);
    this.inbox = new InboxService(this);
    this.search = new SearchService(this);
    this.directory = new DirectoryService(this);
    this.chat = new ChatService(this);

    // Add additional services that might be missing
    this._initializeAdditionalServices();
  }

  _initializeAdditionalServices() {
    // Placeholder for additional services that might be discovered
    // This will be populated as we find missing APIs
  }

  // Extension method for plugins (internal SDK, transport plugins, etc.)
  use(plugin) {
    if (typeof plugin === 'function') {
      plugin(this);
    } else if (plugin && typeof plugin.install === 'function') {
      plugin.install(this);
    } else {
      throw new Error('Plugin must be a function or have an install method');
    }
    return this;
  }

  extend(extension) {
    if (typeof extension === 'function') {
      // Extension is a class constructor
      const instance = new extension(this);

      // Merge extension methods/properties into this SDK
      for (const key in instance) {
        if (
          instance.hasOwnProperty(key) &&
          typeof instance[key] !== 'undefined'
        ) {
          this[key] = instance[key];
        }
      }
    } else if (typeof extension === 'object') {
      // Extension is an object with methods
      Object.assign(this, extension);
    } else {
      throw new Error('Extension must be a class constructor or object');
    }
    return this;
  }

  // Transport plugin methods
  addTransport(transport) {
    super.addTransport(transport);
    return this;
  }

  removeTransport(name) {
    super.removeTransport(name);
    return this;
  }

  // Backwards compatibility helper methods
  async buildMasterAuth({ namespace, accountId, userId }) {
    // This method should only be available in Node.js environment
    // and will be added via internal SDK extension
    throw new Error(
      'buildMasterAuth is only available with the internal SDK extension. Please use: sdk.use(InternalExtension)',
    );
  }

  /**
   * Check SDK configuration and API connectivity
   * Calls the /health endpoint to verify SDK setup
   *
   * @returns {Promise<Object>} Health check result with:
   *   - healthy: boolean - If API is reachable
   *   - hasAuthorization: boolean - If auth credentials were received by API
   *   - authType: string|null - Type of auth detected by API ('bearer', 'cookie', or 'bearer+cookie')
   *   - namespace: string - Current namespace
   *   - environment: string - 'node' or 'browser'
   *   - transport: string - Transport method used ('HTTP', 'WebSocket', etc.)
   */
  async status() {
    try {
      const response = await this._fetch('/health', 'GET', {
        returnRawResponse: true,
      });

      // Parse response
      let healthData;
      try {
        if (typeof response.json === 'function') {
          healthData = await response.json();
        } else if (response.body) {
          healthData =
            typeof response.body === 'string'
              ? JSON.parse(response.body)
              : response.body;
        } else {
          healthData = {};
        }
      } catch (e) {
        healthData = {};
      }

      return {
        healthy: response.ok || response.status === 200,
        hasAuthorization: healthData.hasAuthorization || false,
        authType: healthData.authType || null,
        namespace: this.namespace,
        environment: this.environment,
        transport: healthData.transport || 'unknown',
        timestamp: healthData.timestamp,
        url: healthData.url || null,
        statusCode: response.status,
      };
    } catch (error) {
      return {
        healthy: false,
        hasAuthorization: false,
        authType: null,
        namespace: this.namespace,
        environment: this.environment,
        error: error.message,
        statusCode: error.status || null,
      };
    }
  }

  /**
   * Get the client's IP address
   * Always uses fetch transport (never WebSocket or other transports)
   *
   * @returns {Promise<Object>} Response with:
   *   - ip: string - The client's IP address
   */
  async getIp() {
    // Force fetch transport (pass true as forceFetch parameter)
    return await this._fetch('/get-ip', 'GET', {}, true);
  }
}

// Export both the class and a factory function for convenience
export default UnboundSDK;
export { UnboundSDK };

// Factory function for common usage patterns
export function createSDK(options = {}) {
  return new UnboundSDK(options);
}

// Re-export service classes for advanced usage
export { LoginService } from './services/login.js';
export { ObjectsService } from './services/objects.js';
export { MessagingService } from './services/messaging.js';
export { VideoService } from './services/video.js';
export { VoiceService } from './services/voice.js';
export { AIService } from './services/ai.js';
export { LookupService } from './services/lookup.js';
export { LayoutsService } from './services/layouts.js';
export { SubscriptionsService } from './services/subscriptions.js';
export { WorkflowsService } from './services/workflows.js';
export { NotesService } from './services/notes.js';
export { StorageService } from './services/storage.js';
export { VerificationService } from './services/verification.js';
export { PortalsService } from './services/portals.js';
export { SipEndpointsService } from './services/sipEndpoints.js';
export { ExternalOAuthService } from './services/externalOAuth.js';
export { GoogleCalendarService } from './services/googleCalendar.js';
export { EnrollService } from './services/enroll.js';
export {
  PhoneNumbersService,
  PhoneNumberCarrierService,
} from './services/phoneNumbers.js';
export {
  RecordTypesService,
  UserRecordTypeDefaultsService,
} from './services/recordTypes.js';
export { GenerateIdService } from './services/generateId.js';
export { EngagementMetricsService } from './services/engagementMetrics.js';
export { TaskRouterService } from './services/taskRouter.js';
export { WorkerService } from './services/taskRouter/WorkerService.js';
export { KnowledgeBaseService } from './services/knowledgeBase.js';
export { FaxService } from './services/fax.js';
export { PermissionsService } from './services/permissions.js';
export { InboxService } from './services/inbox.js';
export { SearchService } from './services/search.js';
export { DirectoryService } from './services/directory.js';
export { ChatService } from './services/chat.js';
export { BaseSDK } from './base.js';
