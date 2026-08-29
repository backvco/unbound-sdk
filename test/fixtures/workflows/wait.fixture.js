// Copied verbatim from
// app1-api/src/services/objects/constants/workflows/wait.js — a live,
// executing, unmigrated module (no capabilities/settingsSchema/
// moduleSchemaVersion). Proves validateModuleSpec accepts real,
// currently-shipping module constants completely unchanged.
export default {
  type: 'wait',
  category: 'actions',
  label: 'Wait',
  labelBgColor: '#f9e8db',
  labelTextColor: '#000',
  description: 'Wait for a specified duration',
  descriptionTextColor: '#000',
  descriptionBgColor: '#fff',
  icon: '<i class="fa-solid fa-hourglass-half"></i>',
  iconBgColor: '#B2692C',
  iconTextColor: '#FFF',
  position: { x: 300, y: 300 },
  ports: [
    {
      direction: 'out',
      isHidden: false,
      label: 'Continue',
      bgColor: '#B2692C',
      textColor: '#ffffff',
    },
    { direction: 'in', isHidden: false },
  ],
  settings: {
    layout: {
      sections: [
        {
          id: 'description',
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
          id: 'wait',
          label: 'Wait',
          info: {
            type: 'info',
            message:
              'Live voice calls are limited to a maximum wait of 5 minutes. Hold music will play to the caller during the wait. For non-voice workflows, longer durations are supported and the session will automatically resume when the wait completes.',
          },
          rows: [
            {
              columns: [
                {
                  type: 'content',
                  object: 'workflowItemSettings',
                  display: {
                    type: 'varchar',
                    label: 'Value',
                    value: 'settings.wait.value',
                    format: '',
                    fieldType: 'input',
                  },
                  edit: [
                    {
                      field: 'settings.wait.value',
                      label: 'Value',
                      value: 'settings.wait.value',
                      format: '',
                      fieldType: 'input',
                      placeholder: '',
                      fieldTypeSub: 'text',
                    },
                  ],
                },
                {
                  edit: [
                    {
                      field: 'settings.wait.unit',
                      label: 'Time Unit',
                      value: 'settings.wait.unit',
                      format: '',
                      fieldType: 'select',
                      placeholder: '',
                      fieldTypeSub: 'text',
                      select: {
                        options: [
                          { value: 'seconds', name: 'Seconds' },
                          { value: 'minutes', name: 'Minutes' },
                          { value: 'hours', name: 'Hours' },
                          { value: 'days', name: 'Days' },
                          { value: 'weeks', name: 'Weeks' },
                        ],
                      },
                    },
                  ],
                  type: 'content',
                  object: 'workflowItemSettings',
                  display: {
                    type: 'varchar',
                    label: 'Time Unit',
                    value: 'settings.wait.unit',
                    format: '',
                    fieldType: 'input',
                  },
                },
              ],
            },
          ],
        },
      ],
    },
    wait: {
      unit: 'seconds',
      value: 10,
    },
  },
};
