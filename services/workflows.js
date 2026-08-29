import { internalRequest } from '../base.js';
export class WorkflowsService {
  constructor(sdk) {
    this.sdk = sdk;
    this.items = new WorkflowItemsService(sdk);
    this.connections = new WorkflowConnectionsService(sdk);
    this.sessions = new WorkflowSessionsService(sdk);
  }

  async getSettings(type) {
    this.sdk.validateParams(
      { type },
      {
        type: { type: 'string', required: true },
      },
    );

    const params = {
      query: { type },
    };

    const result = await internalRequest(this.sdk, '/workflows/settings', 'GET', params);
    return result;
  }

  async listModules() {
    const params = {
      query: {},
    };

    const result = await internalRequest(this.sdk, '/workflows/modules', 'GET', params);
    return result;
  }

  async listFormulaFunctions() {
    const result = await internalRequest(this.sdk, 
      '/workflows/formula-functions',
      'GET',
    );
    return result;
  }

  async getAvailableHolidaySets() {
    const result = await internalRequest(this.sdk, 
      '/workflows/holiday-sets',
      'GET',
    );
    return result;
  }

  async simulateWebhook(webhookSettings) {
    this.sdk.validateParams(
      { webhookSettings },
      {
        webhookSettings: { type: 'object', required: true },
      },
    );

    const params = {
      body: { webhookSettings },
    };

    const result = await internalRequest(this.sdk, 
      '/workflows/webhook/simulate',
      'POST',
      params,
    );
    return result;
  }

  async simulateLookup(lookupSettings) {
    this.sdk.validateParams(
      { lookupSettings },
      {
        lookupSettings: { type: 'object', required: true },
      },
    );

    const params = {
      body: { lookupSettings },
    };

    const result = await internalRequest(this.sdk, 
      '/workflows/lookup/simulate',
      'POST',
      params,
    );
    return result;
  }

  async simulateTimeControl(timeControlSettings, testDateTime = null) {
    this.sdk.validateParams(
      { timeControlSettings },
      {
        timeControlSettings: { type: 'object', required: true },
      },
    );

    const params = {
      body: { timeControlSettings, testDateTime },
    };

    const result = await internalRequest(this.sdk, 
      '/workflows/timeControl/simulate',
      'POST',
      params,
    );
    return result;
  }
}

export class WorkflowItemsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async delete(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    const params = {
      body: {
        where: {
          id,
        },
      },
    };

    const result = await internalRequest(this.sdk, 
      '/object/workflowItems',
      'DELETE',
      params,
    );
    return result;
  }

  async list(workflowVersionId) {
    this.sdk.validateParams(
      { workflowVersionId },
      {
        workflowVersionId: { type: 'string', required: true },
      },
    );

    const params = {
      query: {
        expandDetails: true,
        workflowVersionId,
      },
    };

    const result = await internalRequest(this.sdk, 
      '/object/workflowItems',
      'GET',
      params,
    );
    return result;
  }

  async get(id) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
      },
    );

    return this.sdk.objects.byId({
      object: 'workflowItems',
      id,
    });
  }

  async create({
    workflowVersionId,
    category,
    type,
    description,
    position,
    settings,
  }) {
    this.sdk.validateParams(
      { workflowVersionId, category, type },
      {
        workflowVersionId: { type: 'string', required: true },
        category: { type: 'string', required: true },
        type: { type: 'string', required: true },
        description: { type: 'string', required: false },
        position: { type: 'object', required: false },
        settings: { type: 'object', required: false },
      },
    );

    const params = {
      body: {
        workflowVersionId,
        category,
        type,
        description,
        position,
        settings,
      },
    };

    const result = await internalRequest(this.sdk, 
      '/object/workflowItems',
      'POST',
      params,
    );
    return result;
  }

  async update({
    id,
    description,
    label,
    labelBgColor,
    labelTextColor,
    descriptionBgColor,
    descriptionTextColor,
    icon,
    iconBgColor,
    iconTextColor,
    ports,
    connections,
    position,
    settings,
  }) {
    this.sdk.validateParams(
      { id },
      {
        id: { type: 'string', required: true },
        description: { type: 'string', required: false },
        label: { type: 'string', required: false },
        labelBgColor: { type: 'string', required: false },
        labelTextColor: { type: 'string', required: false },
        descriptionBgColor: { type: 'string', required: false },
        descriptionTextColor: { type: 'string', required: false },
        icon: { type: 'string', required: false },
        iconBgColor: { type: 'string', required: false },
        iconTextColor: { type: 'string', required: false },
        ports: { type: 'array', required: false },
        connections: { type: 'object', required: false },
        position: { type: 'object', required: false },
        settings: { type: 'object', required: false },
      },
    );

    const updateData = {};
    if (description !== undefined) updateData.description = description;
    if (label !== undefined) updateData.label = label;
    if (labelBgColor !== undefined) updateData.labelBgColor = labelBgColor;
    if (labelTextColor !== undefined)
      updateData.labelTextColor = labelTextColor;
    if (descriptionBgColor !== undefined)
      updateData.descriptionBgColor = descriptionBgColor;
    if (descriptionTextColor !== undefined)
      updateData.descriptionTextColor = descriptionTextColor;
    if (icon !== undefined) updateData.icon = icon;
    if (iconBgColor !== undefined) updateData.iconBgColor = iconBgColor;
    if (iconTextColor !== undefined) updateData.iconTextColor = iconTextColor;
    if (ports !== undefined) updateData.ports = ports;
    if (position !== undefined) updateData.position = position;
    if (settings !== undefined) updateData.settings = settings;

    const params = {
      body: {
        where: {
          id,
        },
        update: updateData,
      },
    };

    const result = await internalRequest(this.sdk, 
      '/object/workflowItems',
      'PUT',
      params,
    );
    return result;
  }
}

export class WorkflowConnectionsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async delete(
    workflowItemId,
    workflowItemPortId,
    inWorkflowItemId,
    inWorkflowItemPortId,
  ) {
    this.sdk.validateParams(
      {
        workflowItemId,
        workflowItemPortId,
        inWorkflowItemId,
        inWorkflowItemPortId,
      },
      {
        workflowItemId: { type: 'string', required: true },
        workflowItemPortId: { type: 'string', required: true },
        inWorkflowItemId: { type: 'string', required: true },
        inWorkflowItemPortId: { type: 'string', required: true },
      },
    );

    const params = {
      body: {
        where: {
          workflowItemId,
          workflowItemPortId,
          inWorkflowItemId,
          inWorkflowItemPortId,
        },
      },
    };

    const result = await internalRequest(this.sdk, 
      '/object/workflowItemConnections',
      'DELETE',
      params,
    );
    return result;
  }

  async create({
    workflowItemPortId,
    workflowItemId,
    inWorkflowItemId,
    inWorkflowItemPortId,
  }) {
    this.sdk.validateParams(
      {
        workflowItemPortId,
        workflowItemId,
        inWorkflowItemId,
        inWorkflowItemPortId,
      },
      {
        workflowItemPortId: { type: 'string', required: true },
        workflowItemId: { type: 'string', required: true },
        inWorkflowItemId: { type: 'string', required: true },
        inWorkflowItemPortId: { type: 'string', required: true },
      },
    );

    const params = {
      body: {
        workflowItemPortId,
        workflowItemId,
        inWorkflowItemId,
        inWorkflowItemPortId,
      },
    };

    const result = await internalRequest(this.sdk, 
      '/object/workflowItemConnections',
      'POST',
      params,
    );
    return result;
  }
}

export class WorkflowSessionsService {
  constructor(sdk) {
    this.sdk = sdk;
  }

  async create(workflowVersionId, sessionData) {
    this.sdk.validateParams(
      { workflowVersionId, sessionData },
      {
        workflowVersionId: { type: 'string', required: true },
        sessionData: { type: 'object', required: false },
      },
    );

    const params = {
      body: sessionData,
    };

    const result = await internalRequest(this.sdk, 
      `/workflows/session/${workflowVersionId}`,
      'POST',
      params,
    );
    return result;
  }

  async get(sessionId) {
    this.sdk.validateParams(
      { sessionId },
      {
        sessionId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/workflows/sessions/${sessionId}`,
      'GET',
    );
    return result;
  }

  async update(sessionId, updateData) {
    this.sdk.validateParams(
      { sessionId, updateData },
      {
        sessionId: { type: 'string', required: true },
        updateData: { type: 'object', required: false },
      },
    );

    const params = {
      body: updateData,
    };

    const result = await internalRequest(this.sdk, 
      `/workflows/session/${sessionId}`,
      'PUT',
      params,
    );
    return result;
  }

  async complete(sessionId) {
    this.sdk.validateParams(
      { sessionId },
      {
        sessionId: { type: 'string', required: true },
      },
    );

    const params = {};

    const result = await internalRequest(this.sdk, 
      `/workflows/session/${sessionId}/complete`,
      'PUT',
      params,
    );
    return result;
  }

  async delete(sessionId) {
    this.sdk.validateParams(
      { sessionId },
      {
        sessionId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/workflows/sessions/${sessionId}`,
      'DELETE',
    );
    return result;
  }

  async logTranscript(sessionId, transcriptData) {
    this.sdk.validateParams(
      { sessionId },
      {
        sessionId: { type: 'string', required: true },
      },
    );

    const params = {
      body: transcriptData,
    };

    const result = await internalRequest(this.sdk, 
      `/workflows/session/${sessionId}/transcript`,
      'POST',
      params,
    );
    return result;
  }

  async replay(sessionId) {
    this.sdk.validateParams(
      { sessionId },
      {
        sessionId: { type: 'string', required: true },
      },
    );

    const result = await internalRequest(this.sdk, 
      `/workflows/session/${sessionId}/replay`,
      'GET',
    );
    return result;
  }

  async analytics(workflowVersionId, { startDate, endDate } = {}) {
    this.sdk.validateParams(
      { workflowVersionId, startDate, endDate },
      {
        workflowVersionId: { type: 'string', required: true },
        startDate: { type: 'string', required: true },
        endDate: { type: 'string', required: true },
      },
    );

    const params = {
      query: { startDate, endDate },
    };

    const result = await internalRequest(this.sdk, 
      `/workflows/${workflowVersionId}/analytics`,
      'GET',
      params,
    );
    return result;
  }
}
