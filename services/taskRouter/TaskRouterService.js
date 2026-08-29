import { WorkerService } from './WorkerService.js';
import { TaskService } from './TaskService.js';
import { MetricsService } from './MetricsService.js';
import { CCService } from './CCService.js';

export class TaskRouterService {
  constructor(sdk) {
    this.sdk = sdk;
    this.worker = new WorkerService(sdk);
    this.task = new TaskService(sdk);
    this.metrics = new MetricsService(sdk);
    this.cc = new CCService(sdk);
  }
}
