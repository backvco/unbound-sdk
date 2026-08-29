// Real content of app1-api/.../constants/workflows/aBRouting.js (maps.md
// module-defs §4.3's live "silent no-op" bug: the "Routing Ratio" edit
// field is `settings.points.unit` — copy-pasted from modifyTaskPoints.js —
// while the module's own default state is `settings.abRoute.*`), with a
// `settingsSchema` retrofitted on top declaring the CORRECT namespace
// (`abRoute`, matching the real defaults object at the bottom of the file)
// so lintModuleSpec's settings-namespace-match rule has something to check
// against. Proves lint catches the exact bug class it was built for.
export default {
  type: 'aBRouting',
  category: 'routing',
  label: 'A/B Routing',
  labelBgColor: '#ede6ef',
  labelTextColor: '#000',
  description: 'A/B Routing',
  descriptionTextColor: '#000',
  descriptionBgColor: '#fff',
  icon: '<i class="fa-solid fa-gears"></i>',
  iconBgColor: '#5C3B65',
  iconTextColor: '#FFF',
  position: { x: 300, y: 300 },
  moduleSchemaVersion: 1,
  settingsSchema: {
    namespace: 'abRoute',
    defaults: { routingRatio: '1:6', value: 72 },
  },
  ports: [
    {
      direction: 'out',
      isHidden: false,
      label: 'Continue',
      bgColor: '#5C3B65',
      textColor: '#FFF',
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
          id: 'abRoute',
          label: 'A/B Routing',
          rows: [
            {
              columns: [
                {
                  // BUG (unfixed): writes settings.points.unit — nothing
                  // reads this; the field/namespace mismatch this fixture
                  // exists to prove lint catches.
                  edit: [
                    {
                      field: 'settings.points.unit',
                      label: 'Routing Ratio',
                      value: 'settings.points.unit',
                      format: '',
                      fieldType: 'select',
                      placeholder: '',
                      fieldTypeSub: 'text',
                      select: {
                        options: [
                          { value: '1:2', name: '1 our of every 2' },
                          { value: '1:3', name: '1 our of every 3' },
                          { value: '1:4', name: '1 our of every 4' },
                          { value: '1:5', name: '1 our of every 5' },
                          { value: '1:10', name: '1 our of every 10' },
                        ],
                      },
                    },
                  ],
                  type: 'content',
                  object: 'workflowItemSettings',
                  display: {
                    type: 'varchar',
                    label: 'Routing Ratio',
                    value: 'settings.points.unit',
                    format: '',
                    fieldType: 'input',
                  },
                },
                {
                  type: 'content',
                  object: 'workflowItemSettings',
                  display: {
                    type: 'varchar',
                    label: 'Look Back Timeframe (hours)',
                    value: 'settings.abRoute.value',
                    format: '',
                    fieldType: 'input',
                  },
                  edit: [
                    {
                      field: 'settings.abRoute.value',
                      label: 'Timegram',
                      value: 'settings.abRoute.value',
                      format: '',
                      fieldType: 'input',
                      placeholder: '',
                      fieldTypeSub: 'text',
                    },
                  ],
                },
              ],
            },
          ],
        },
      ],
    },
    abRoute: {
      routingRatio: '1:6',
      value: 72,
    },
  },
};
