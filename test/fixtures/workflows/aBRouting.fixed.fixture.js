// "aBRouting-as-it-should-be" — the same real module, migrated to declare
// moduleSchemaVersion/capabilities/settingsSchema, with the live field/
// namespace bug (maps.md module-defs §4.3) actually fixed: the "Routing
// Ratio" edit field now targets `settings.abRoute.routingRatio` (matching
// both the declared `settingsSchema.namespace` and the module's own
// defaults object) instead of the orphaned `settings.points.unit`. Proves
// validateModuleSpec + lintModuleSpec both pass once the fix (and the
// declared contract) are in place — the additive migration end state.
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
  capabilities: {
    deletable: true,
    hiddenFromPicker: false,
  },
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
                  // FIXED: now writes settings.abRoute.routingRatio,
                  // matching settingsSchema.namespace + the module's own
                  // defaults — the field this module's UI edits and the
                  // key its own default state populates are finally the
                  // same subtree.
                  edit: [
                    {
                      field: 'settings.abRoute.routingRatio',
                      label: 'Routing Ratio',
                      value: 'settings.abRoute.routingRatio',
                      format: '',
                      fieldType: 'select',
                      placeholder: '',
                      fieldTypeSub: 'text',
                      select: {
                        options: [
                          { value: '1:2', name: '1 out of every 2' },
                          { value: '1:3', name: '1 out of every 3' },
                          { value: '1:4', name: '1 out of every 4' },
                          { value: '1:5', name: '1 out of every 5' },
                          { value: '1:10', name: '1 out of every 10' },
                        ],
                      },
                    },
                  ],
                  type: 'content',
                  object: 'workflowItemSettings',
                  display: {
                    type: 'varchar',
                    label: 'Routing Ratio',
                    value: 'settings.abRoute.routingRatio',
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
                      label: 'Look Back Timeframe (hours)',
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
