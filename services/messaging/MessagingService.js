import { SmsService } from './SmsService.js';
import { EmailService } from './EmailService.js';
import { CampaignsService } from './CampaignsService.js';
import { PhoneService } from './PhoneService.js';

export class MessagingService {
  constructor(sdk) {
    this.sdk = sdk;
    this.sms = new SmsService(sdk);
    this.email = new EmailService(sdk);
    this.campaigns = new CampaignsService(sdk);
    this.phone = new PhoneService(sdk);
  }
}
