import { searchMethods } from './search.js';
import { orderMethods } from './order.js';
import { updateMethods } from './update.js';
import { cnamMethods } from './cnam.js';
import { portingOrderMethods } from './porting-orders.js';
import { portingActivityMethods } from './porting-activity.js';
import { PhoneNumberCarrierService } from './carrier.js';

// phoneNumbers/index.js :: PhoneNumbersService :: composes the split method modules back into one class
export class PhoneNumbersService {
  constructor(sdk) {
    this.sdk = sdk;
    this.carrier = new PhoneNumberCarrierService(sdk);
  }
}

Object.assign(
  PhoneNumbersService.prototype,
  searchMethods,
  orderMethods,
  updateMethods,
  cnamMethods,
  portingOrderMethods,
  portingActivityMethods,
);

export { PhoneNumberCarrierService };
