// Copied verbatim from
// app1-api/src/services/objects/constants/workflows/say.js — a live,
// executing, unmigrated module using the phone/messaging dual-addressing
// channel (no `settings.say` key at all). Proves validateModuleSpec
// accepts the dual-channel shape unchanged, and that phone.*/messaging.*
// fields are exempt from lintModuleSpec's settings-namespace-match rule.
export default {
  type: 'say',
  category: 'engagement',
  label: 'Say',
  labelBgColor: '#e8f2e3',
  labelTextColor: '#000',
  description: 'Testing Say',
  descriptionTextColor: '#000',
  descriptionBgColor: '#fff',
  icon: '<i class="fa-solid fa-microphone-lines"></i>',
  iconBgColor: '#4F7339',
  iconTextColor: '#FFF',
  position: { x: 100, y: 100 },
  ports: [
    {
      direction: 'out',
      isHidden: false,
      label: 'Continue',
      bgColor: '#4F7339',
      textColor: '#FFF',
    },
    { direction: 'in', isHidden: false },
  ],
  settings: {
    layout: {
      sections: [
        {
          id: 'description',
          header: {
            icon: 'circle-info',
            size: 'sm',
            level: '6',
            value: 'Description',
          },
          rows: [
            {
              columns: [
                {
                  edit: [
                    {
                      field: 'description',
                      label: 'Description',
                      value: 'description',
                      format: '',
                      fieldType: 'input',
                      placeholder: '',
                      fieldTypeSub: 'text',
                    },
                  ],
                  type: 'content',
                  object: 'workflowItems',
                  display: {
                    type: 'varchar',
                    label: 'Description',
                    value: 'description',
                    format: '',
                    fieldType: 'input',
                  },
                },
              ],
            },
          ],
        },
        {
          id: 'phone',
          label: 'Phone',
          header: {
            icon: 'phone',
            size: 'sm',
            level: '6',
            value: 'Phone Settings',
          },
          rows: [
            {
              columns: [
                {
                  edit: [
                    {
                      field: 'phone.playback.type',
                      label: 'Playback Type',
                      value: 'phone.playback.type',
                      format: '',
                      fieldType: 'select',
                      placeholder: '',
                      fieldTypeSub: 'text',
                      select: {
                        options: [
                          { value: 'text', name: 'Text' },
                          { value: 'file', name: 'File' },
                        ],
                      },
                    },
                  ],
                  type: 'content',
                  object: 'workflowItemSettings',
                  display: {
                    type: 'varchar',
                    label: 'Playback Type',
                    value: 'phone.playback.type',
                    format: '',
                    fieldType: 'input',
                  },
                },
              ],
            },
            {
              columns: [
                {
                  conditional: {
                    field: 'phone.playback.type',
                    value: 'text',
                  },
                  type: 'content',
                  object: 'workflowItemSettings',
                  display: {
                    type: 'varchar',
                    label: 'Message',
                    value: 'phone.playback.message',
                    format: '',
                    fieldType: 'input',
                  },
                  edit: [
                    {
                      field: 'phone.playback.message',
                      label: 'Playback Message',
                      value: 'phone.playback.message',
                      format: '',
                      fieldType: 'textArea',
                      placeholder: '',
                      fieldTypeSub: 'text',
                    },
                  ],
                },
                {
                  conditional: {
                    field: 'phone.playback.type',
                    value: 'file',
                  },
                  type: 'content',
                  object: 'workflowItemSettings',
                  display: {
                    type: 'varchar',
                    label: 'Playback File',
                    value: 'phone.playback.storageId',
                    format: '',
                    fieldType: 'input',
                  },
                  edit: [
                    {
                      field: 'phone.playback.storageId',
                      label: 'Playback File',
                      value: 'phone.playback.storageId',
                      format: '',
                      fieldType: 'select',
                      placeholder: '',
                      fieldTypeSub: 'text',
                      select: {
                        options: [],
                      },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          id: 'messaging',
          label: 'Messaging',
          header: {
            icon: 'message',
            size: 'sm',
            level: '6',
            value: 'Messaging Settings',
          },
          rows: [
            {
              columns: [
                {
                  type: 'content',
                  object: 'workflowItemSettings',
                  display: {
                    type: 'varchar',
                    label: 'Message',
                    value: 'messaging.text.message',
                    format: '',
                    fieldType: 'input',
                  },
                  edit: [
                    {
                      field: 'messaging.text.message',
                      label: 'Playback Message',
                      value: 'messaging.text.message',
                      format: '',
                      fieldType: 'textArea',
                      placeholder: '',
                      fieldTypeSub: 'text',
                      emojiPicker: true,
                      textArea: { rows: 5 },
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    phone: {
      playback: {
        type: 'text',
        message: 'What is your account number?',
        language: 'en-us',
        voice: 'main',
      },
    },
    messaging: {
      text: {
        message: 'Thank you for your message',
      },
    },
  },
};
