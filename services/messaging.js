// Import all extracted services
import { MessagingService } from './messaging/MessagingService.js';
import { SmsService } from './messaging/SmsService.js';
import { SmsTemplatesService } from './messaging/SmsTemplatesService.js';
import { EmailService } from './messaging/EmailService.js';
import { EmailTemplatesService } from './messaging/EmailTemplatesService.js';
import { EmailDomainsService } from './messaging/EmailDomainsService.js';
import { EmailAddressesService } from './messaging/EmailAddressesService.js';
import { EmailMailboxesService } from './messaging/EmailMailboxesService.js';
import { CampaignsService } from './messaging/CampaignsService.js';
import { TollFreeCampaignsService } from './messaging/TollFreeCampaignsService.js';
import { TenDlcCampaignsService } from './messaging/TenDlcCampaignsService.js';
import { TenDlcBrandsService } from './messaging/TenDlcBrandsService.js';
import { TenDlcCampaignManagementService } from './messaging/TenDlcCampaignManagementService.js';
import { EmailAnalyticsService } from './messaging/EmailAnalyticsService.js';
import { EmailQueueService } from './messaging/EmailQueueService.js';
import { EmailSuppressionService } from './messaging/EmailSuppressionService.js';
import { PhoneService } from './messaging/PhoneService.js';

// Re-export all services - maintains exact same API
export {
  MessagingService,
  SmsService,
  SmsTemplatesService,
  EmailService,
  EmailTemplatesService,
  EmailDomainsService,
  EmailAddressesService,
  EmailMailboxesService,
  CampaignsService,
  TollFreeCampaignsService,
  TenDlcCampaignsService,
  TenDlcBrandsService,
  TenDlcCampaignManagementService,
  EmailAnalyticsService,
  EmailQueueService,
  EmailSuppressionService,
  PhoneService,
};
