import { internalRequest } from '../../base.js';

// phoneNumbers/update.js :: update method :: webhook/app/record-type config for an owned number
export const updateMethods = {
  async update(
    id,
    {
      name,
      messagingWebHookUrl,
      voiceWebHookUrl,
      voiceAppExternalUrl,
      voiceAppExternalMethod,
      voiceApp,
      voiceAppMetaData,
      voiceRecordTypeId,
      messagingRecordTypeId,
      recordCalls,
      textApp,
      textAppMetaData,
      textChatVisibility,
      shakenBlockUnsigned,
      shakenMinAttestation,
    },
  ) {
    this.sdk.validateParams(
      {
        id,
        messagingWebHookUrl,
        voiceWebHookUrl,
        voiceAppExternalUrl,
        voiceAppExternalMethod,
        voiceApp,
        voiceRecordTypeId,
        messagingRecordTypeId,
        recordCalls,
        textApp,
        textAppMetaData,
        textChatVisibility,
        shakenBlockUnsigned,
        shakenMinAttestation,
      },
      {
        id: { type: 'string', required: true },
        name: { type: 'string', required: false },
        messagingWebHookUrl: { type: 'string', required: false },
        voiceWebHookUrl: { type: 'string', required: false },
        voiceAppExternalUrl: { type: 'string', required: false },
        voiceAppExternalMethod: { type: 'string', required: false },
        voiceApp: { type: 'string', required: false },
        voiceRecordTypeId: { type: 'string', required: false },
        messagingRecordTypeId: { type: 'string', required: false },
        recordCalls: { type: 'boolean', required: false },
        textApp: { type: 'string', required: false },
        textAppMetaData: { type: 'string', required: false },
        textChatVisibility: { type: 'string', required: false },
        shakenBlockUnsigned: { type: 'boolean', required: false },
        shakenMinAttestation: { type: 'string', required: false },
      },
    );

    const updateData = {};
    if (name) updateData.name = name;
    if (messagingWebHookUrl)
      updateData.messagingWebHookUrl = messagingWebHookUrl;
    if (voiceWebHookUrl) updateData.voiceWebHookUrl = voiceWebHookUrl;
    if (voiceAppExternalUrl)
      updateData.voiceAppExternalUrl = voiceAppExternalUrl;
    if (voiceAppExternalMethod)
      updateData.voiceAppExternalMethod = voiceAppExternalMethod;
    if (voiceApp) updateData.voiceApp = voiceApp;
    if (voiceAppMetaData) updateData.voiceAppMetaData = voiceAppMetaData;
    if (voiceRecordTypeId) updateData.voiceRecordTypeId = voiceRecordTypeId;
    if (messagingRecordTypeId)
      updateData.messagingRecordTypeId = messagingRecordTypeId;
    if (recordCalls !== undefined) updateData.recordCalls = recordCalls;
    if (textApp !== undefined) updateData.textApp = textApp;
    if (textAppMetaData !== undefined)
      updateData.textAppMetaData = textAppMetaData;
    if (textChatVisibility !== undefined)
      updateData.textChatVisibility = textChatVisibility;
    if (shakenBlockUnsigned !== undefined)
      updateData.shakenBlockUnsigned = shakenBlockUnsigned;
    // null clears the floor when the gate is turned off.
    if (shakenMinAttestation !== undefined)
      updateData.shakenMinAttestation = shakenMinAttestation;

    const params = {
      body: updateData,
    };

    const result = await internalRequest(this.sdk, `/phoneNumbers/${id}`, 'PUT', params);
    return result;
  },
};
