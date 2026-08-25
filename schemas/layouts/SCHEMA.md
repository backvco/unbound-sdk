<!-- GENERATED FILE — do not hand-edit. Run `npm run docs:layouts` to regenerate. -->
# Dynamic Layouts v2 — Schema Reference
## LayoutDoc

Root document for type:list|detail layouts.

| property | type | required | default |
|---|---|---|---|
| `schemaVersion` | number | no | 2 |
| `objectName` | string | yes |  |
| `type` | string | yes |  |
| `tabName` | string | no | {{objectName}} |
| `tabIcon` | string | no | fa-database |
| `sections` | array | no |  |
| `feeds` | object | no |  |
| `notes` | union/enum — see JSON schema below | no |  |
| `aiInsights` | union/enum — see JSON schema below | no |  |
| `aiGoals` | union/enum — see JSON schema below | no |  |
| `googleDrive` | object | no |  |
| `filterPanel` | object | no |  |
| `actions` | array | no |  |

<details><summary>Full JSON schema</summary>

```json
{
  "$ref": "#/definitions/LayoutDoc",
  "definitions": {
    "LayoutDoc": {
      "type": "object",
      "properties": {
        "schemaVersion": {
          "type": "number",
          "const": 2,
          "default": 2
        },
        "objectName": {
          "type": "string",
          "minLength": 1
        },
        "type": {
          "type": "string",
          "enum": [
            "list",
            "detail"
          ]
        },
        "tabName": {
          "type": "string",
          "minLength": 1,
          "default": "{{objectName}}"
        },
        "tabIcon": {
          "type": "string",
          "default": "fa-database"
        },
        "sections": {
          "type": "array",
          "items": {
            "anyOf": [
              {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string",
                    "minLength": 1
                  },
                  "header": {
                    "type": "object",
                    "properties": {
                      "value": {
                        "type": "string",
                        "default": ""
                      },
                      "collapsedValue": {
                        "type": "string"
                      },
                      "hidden": {
                        "type": "boolean",
                        "default": false
                      },
                      "size": {
                        "type": "string",
                        "enum": [
                          "xs",
                          "sm",
                          "base",
                          "lg",
                          "xl",
                          "2xl",
                          "3xl"
                        ]
                      },
                      "weight": {
                        "type": "string",
                        "enum": [
                          "thin",
                          "light",
                          "normal",
                          "medium",
                          "semibold",
                          "bold",
                          "black"
                        ]
                      },
                      "icon": {
                        "type": "string"
                      },
                      "level": {
                        "type": "string",
                        "enum": [
                          "1",
                          "2",
                          "3",
                          "4",
                          "5",
                          "6"
                        ]
                      },
                      "collapsible": {
                        "type": "boolean"
                      }
                    },
                    "additionalProperties": false,
                    "default": {}
                  },
                  "editable": {
                    "type": "boolean",
                    "default": true
                  },
                  "hideOnCreate": {
                    "type": "boolean",
                    "default": false
                  },
                  "autoCollapse": {
                    "type": "boolean",
                    "default": false
                  },
                  "showCollapse": {
                    "type": "boolean",
                    "default": false
                  },
                  "conditions": {
                    "type": "object",
                    "properties": {
                      "field": {
                        "type": "string",
                        "minLength": 1
                      },
                      "operator": {
                        "type": "string",
                        "enum": [
                          "eq",
                          "neq",
                          "contains",
                          "startsWith",
                          "endsWith",
                          "gt",
                          "gte",
                          "lt",
                          "lte",
                          "isNull",
                          "isNotNull"
                        ],
                        "default": "eq"
                      },
                      "value": {
                        "type": [
                          "string",
                          "number",
                          "boolean",
                          "null"
                        ]
                      }
                    },
                    "required": [
                      "field"
                    ],
                    "additionalProperties": false
                  },
                  "type": {
                    "type": "string",
                    "const": "content"
                  },
                  "rows": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string",
                          "minLength": 1
                        },
                        "columns": {
                          "type": "array",
                          "items": {
                            "type": "object",
                            "properties": {
                              "id": {
                                "type": "string",
                                "minLength": 1
                              },
                              "type": {
                                "type": "string",
                                "enum": [
                                  "content",
                                  "component",
                                  "empty"
                                ]
                              },
                              "object": {
                                "type": "string"
                              },
                              "hideOnCreate": {
                                "type": "boolean",
                                "default": false
                              },
                              "conditions": {
                                "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/conditions"
                              },
                              "join": {
                                "type": "object",
                                "properties": {
                                  "childField": {
                                    "type": "string",
                                    "minLength": 1,
                                    "description": "FK column on the child/related object that stores the parent id (legacy: table/component join.column, kanban join.childField)"
                                  },
                                  "parentField": {
                                    "type": "string",
                                    "minLength": 1,
                                    "default": "id",
                                    "description": "Field read off the parent record to match (legacy: kanban join.parentField; table/component join.value as \"{{parentField}}\")"
                                  }
                                },
                                "required": [
                                  "childField"
                                ],
                                "additionalProperties": false
                              },
                              "component": {
                                "type": "string"
                              },
                              "componentConfig": {
                                "type": "object",
                                "additionalProperties": {}
                              },
                              "display": {
                                "type": "object",
                                "properties": {
                                  "label": {
                                    "type": "string",
                                    "default": ""
                                  },
                                  "value": {
                                    "type": "string",
                                    "minLength": 1
                                  },
                                  "fieldType": {
                                    "type": "string",
                                    "enum": [
                                      "input",
                                      "textArea",
                                      "code",
                                      "readOnly",
                                      "spacer",
                                      "composite",
                                      "select",
                                      "selectDynamic",
                                      "securityBlurHover",
                                      "securityBlurAlways",
                                      "securityLastX",
                                      "securityFirstX",
                                      "securityFirstLastX"
                                    ]
                                  },
                                  "formatType": {
                                    "type": "string",
                                    "enum": [
                                      "timestamp",
                                      "phone",
                                      "currency",
                                      "number",
                                      "percentage",
                                      "boolean",
                                      "user",
                                      "securityBlurHover",
                                      "securityBlurAlways",
                                      "securityLastX",
                                      "securityFirstX",
                                      "securityFirstLastX",
                                      "none"
                                    ]
                                  },
                                  "format": {
                                    "type": "string"
                                  },
                                  "relatedKey": {
                                    "type": "string"
                                  },
                                  "relatedObject": {
                                    "type": "string"
                                  },
                                  "code": {
                                    "type": "object",
                                    "properties": {
                                      "language": {
                                        "type": "string",
                                        "default": "plaintext"
                                      },
                                      "width": {
                                        "type": "string"
                                      },
                                      "height": {
                                        "type": "string"
                                      }
                                    },
                                    "additionalProperties": false
                                  },
                                  "securityConfig": {
                                    "type": "object",
                                    "properties": {
                                      "editWithoutValue": {
                                        "type": "boolean",
                                        "default": false
                                      },
                                      "readOnly": {
                                        "type": "boolean",
                                        "default": false
                                      },
                                      "showChars": {
                                        "type": "integer",
                                        "minimum": 0
                                      },
                                      "hideLength": {
                                        "type": "boolean",
                                        "default": false
                                      }
                                    },
                                    "additionalProperties": false
                                  },
                                  "link": {
                                    "type": "object",
                                    "properties": {
                                      "path": {
                                        "$ref": "#/definitions/LayoutDoc/properties/tabName"
                                      },
                                      "tabName": {
                                        "type": "string"
                                      },
                                      "tabIcon": {
                                        "type": "string"
                                      }
                                    },
                                    "required": [
                                      "path"
                                    ],
                                    "additionalProperties": false
                                  }
                                },
                                "required": [
                                  "value",
                                  "fieldType"
                                ],
                                "additionalProperties": false
                              },
                              "edit": {
                                "anyOf": [
                                  {
                                    "type": "object",
                                    "properties": {
                                      "field": {
                                        "type": "string",
                                        "minLength": 1
                                      },
                                      "label": {
                                        "type": "string"
                                      },
                                      "required": {
                                        "type": "boolean",
                                        "default": false
                                      },
                                      "editableOnCreateOnly": {
                                        "type": "boolean",
                                        "default": false
                                      },
                                      "hiddenOnCreate": {
                                        "type": "boolean",
                                        "default": false
                                      },
                                      "fieldType": {
                                        "type": "string",
                                        "enum": [
                                          "input",
                                          "select",
                                          "selectDynamic",
                                          "textArea",
                                          "code",
                                          "spacer"
                                        ]
                                      },
                                      "fieldTypeSub": {
                                        "type": "string",
                                        "enum": [
                                          "text",
                                          "email",
                                          "tel",
                                          "url",
                                          "number",
                                          "date",
                                          "datetime-local",
                                          "time"
                                        ]
                                      },
                                      "placeholder": {
                                        "type": "string"
                                      },
                                      "textArea": {
                                        "type": "object",
                                        "properties": {
                                          "rows": {
                                            "type": "integer",
                                            "exclusiveMinimum": 0,
                                            "default": 4
                                          }
                                        },
                                        "additionalProperties": false
                                      },
                                      "code": {
                                        "type": "object",
                                        "properties": {
                                          "language": {
                                            "type": "string",
                                            "default": "plaintext"
                                          }
                                        },
                                        "additionalProperties": false
                                      },
                                      "select": {
                                        "anyOf": [
                                          {
                                            "type": "object",
                                            "properties": {
                                              "options": {
                                                "type": "array",
                                                "items": {
                                                  "type": "object",
                                                  "properties": {
                                                    "name": {
                                                      "type": "string"
                                                    },
                                                    "value": {
                                                      "type": "string"
                                                    }
                                                  },
                                                  "required": [
                                                    "name",
                                                    "value"
                                                  ],
                                                  "additionalProperties": false
                                                }
                                              },
                                              "optionSource": {
                                                "type": "string"
                                              }
                                            },
                                            "additionalProperties": false
                                          },
                                          {
                                            "type": "object",
                                            "properties": {
                                              "queryConfig": {
                                                "type": "object",
                                                "properties": {
                                                  "object": {
                                                    "type": "string",
                                                    "minLength": 1
                                                  },
                                                  "select": {
                                                    "type": "array",
                                                    "items": {
                                                      "type": "string"
                                                    },
                                                    "default": [
                                                      "id",
                                                      "name"
                                                    ]
                                                  },
                                                  "searchField": {
                                                    "type": "string",
                                                    "default": "name"
                                                  },
                                                  "searchOperator": {
                                                    "type": "string",
                                                    "enum": [
                                                      "contains",
                                                      "startsWith",
                                                      "endsWith",
                                                      "eq"
                                                    ],
                                                    "default": "contains"
                                                  },
                                                  "valueField": {
                                                    "type": "string",
                                                    "default": "id"
                                                  },
                                                  "displayTemplate": {
                                                    "$ref": "#/definitions/LayoutDoc/properties/tabName",
                                                    "default": "{{name}}"
                                                  },
                                                  "limit": {
                                                    "type": "integer",
                                                    "exclusiveMinimum": 0,
                                                    "maximum": 200,
                                                    "default": 25
                                                  },
                                                  "additionalWhere": {
                                                    "type": "object",
                                                    "additionalProperties": {
                                                      "type": "string"
                                                    }
                                                  },
                                                  "orderByField": {
                                                    "type": "string"
                                                  },
                                                  "orderByDirection": {
                                                    "type": "string",
                                                    "enum": [
                                                      "asc",
                                                      "desc"
                                                    ],
                                                    "default": "asc"
                                                  }
                                                },
                                                "required": [
                                                  "object"
                                                ],
                                                "additionalProperties": false
                                              },
                                              "responseMapping": {
                                                "type": "object",
                                                "properties": {
                                                  "name": {
                                                    "type": "string",
                                                    "minLength": 1
                                                  },
                                                  "value": {
                                                    "type": "string",
                                                    "minLength": 1
                                                  }
                                                },
                                                "required": [
                                                  "name",
                                                  "value"
                                                ],
                                                "additionalProperties": false,
                                                "default": {
                                                  "name": "name",
                                                  "value": "id"
                                                }
                                              },
                                              "multiple": {
                                                "type": "boolean",
                                                "default": false
                                              },
                                              "clearable": {
                                                "type": "boolean",
                                                "default": true
                                              },
                                              "searchable": {
                                                "type": "boolean",
                                                "default": true
                                              },
                                              "preloadOptions": {
                                                "type": "boolean",
                                                "default": false
                                              },
                                              "initialSearchQuery": {
                                                "type": "string"
                                              },
                                              "initialLoadLimit": {
                                                "type": "integer",
                                                "exclusiveMinimum": 0
                                              },
                                              "fetchOptions": {
                                                "type": "object",
                                                "properties": {
                                                  "credentials": {
                                                    "type": "string"
                                                  }
                                                },
                                                "additionalProperties": false
                                              }
                                            },
                                            "required": [
                                              "queryConfig"
                                            ],
                                            "additionalProperties": false
                                          }
                                        ]
                                      }
                                    },
                                    "required": [
                                      "field",
                                      "fieldType"
                                    ],
                                    "additionalProperties": false
                                  },
                                  {
                                    "type": "array",
                                    "items": {
                                      "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/rows/items/properties/columns/items/properties/edit/anyOf/0"
                                    }
                                  }
                                ]
                              }
                            },
                            "required": [
                              "id",
                              "type"
                            ],
                            "additionalProperties": false
                          }
                        }
                      },
                      "required": [
                        "id",
                        "columns"
                      ],
                      "additionalProperties": false
                    },
                    "default": []
                  }
                },
                "required": [
                  "id",
                  "type"
                ],
                "additionalProperties": false
              },
              {
                "type": "object",
                "properties": {
                  "id": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/id"
                  },
                  "header": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/header"
                  },
                  "editable": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/editable"
                  },
                  "hideOnCreate": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/hideOnCreate"
                  },
                  "autoCollapse": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/autoCollapse"
                  },
                  "showCollapse": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/showCollapse"
                  },
                  "conditions": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/conditions"
                  },
                  "type": {
                    "type": "string",
                    "const": "table"
                  },
                  "tableLayout": {
                    "type": "string",
                    "enum": [
                      "full-width",
                      "two-columns"
                    ],
                    "default": "full-width"
                  },
                  "tables": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string",
                          "minLength": 1
                        },
                        "object": {
                          "type": "string",
                          "minLength": 1
                        },
                        "join": {
                          "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/rows/items/properties/columns/items/properties/join"
                        },
                        "fields": {
                          "type": "array",
                          "items": {
                            "type": "object",
                            "properties": {
                              "field": {
                                "type": "string",
                                "minLength": 1
                              },
                              "display": {
                                "type": "string",
                                "default": ""
                              },
                              "hidden": {
                                "type": "boolean",
                                "default": false
                              },
                              "sortable": {
                                "type": "boolean",
                                "default": true
                              },
                              "type": {
                                "type": "string",
                                "enum": [
                                  "link"
                                ]
                              },
                              "link": {
                                "type": "string"
                              },
                              "linkField": {
                                "type": "string"
                              },
                              "linkObject": {
                                "type": "string"
                              },
                              "formatType": {
                                "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/rows/items/properties/columns/items/properties/display/properties/formatType"
                              },
                              "format": {
                                "type": "string"
                              },
                              "relatedKey": {
                                "type": "string"
                              },
                              "relatedObject": {
                                "type": "string"
                              }
                            },
                            "required": [
                              "field"
                            ],
                            "additionalProperties": false
                          },
                          "default": []
                        },
                        "header": {
                          "type": "object",
                          "properties": {
                            "value": {
                              "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/header/properties/value"
                            },
                            "collapsedValue": {
                              "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/header/properties/collapsedValue"
                            },
                            "hidden": {
                              "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/header/properties/hidden"
                            },
                            "size": {
                              "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/header/properties/size"
                            },
                            "weight": {
                              "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/header/properties/weight"
                            },
                            "icon": {
                              "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/header/properties/icon"
                            },
                            "level": {
                              "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/header/properties/level"
                            },
                            "collapsible": {
                              "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/header/properties/collapsible"
                            }
                          },
                          "additionalProperties": false
                        },
                        "actions": {
                          "type": "object",
                          "properties": {
                            "edit": {
                              "type": "boolean",
                              "default": true
                            },
                            "create": {
                              "type": "boolean",
                              "default": false
                            },
                            "delete": {
                              "type": "boolean",
                              "default": false
                            },
                            "hideOnCreate": {
                              "type": "boolean",
                              "default": false
                            },
                            "cardClick": {
                              "type": "string",
                              "enum": [
                                "tab",
                                "modal"
                              ],
                              "default": "tab"
                            }
                          },
                          "additionalProperties": false,
                          "default": {}
                        },
                        "orderBy": {
                          "anyOf": [
                            {
                              "type": "object",
                              "properties": {
                                "field": {
                                  "type": "string",
                                  "minLength": 1
                                },
                                "direction": {
                                  "type": "string",
                                  "enum": [
                                    "asc",
                                    "desc"
                                  ],
                                  "default": "asc"
                                }
                              },
                              "required": [
                                "field"
                              ],
                              "additionalProperties": false
                            },
                            {
                              "type": "array",
                              "items": {
                                "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/1/properties/tables/items/properties/orderBy/anyOf/0"
                              }
                            }
                          ]
                        },
                        "additionalWhere": {
                          "type": "object",
                          "additionalProperties": {
                            "type": "string"
                          }
                        },
                        "hideOnCreate": {
                          "type": "boolean",
                          "default": false
                        }
                      },
                      "required": [
                        "id",
                        "object"
                      ],
                      "additionalProperties": false
                    },
                    "minItems": 1
                  },
                  "relatedLists": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string",
                          "minLength": 1
                        },
                        "object": {
                          "type": "string",
                          "minLength": 1
                        },
                        "relationship": {
                          "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/rows/items/properties/columns/items/properties/join"
                        },
                        "columns": {
                          "anyOf": [
                            {
                              "type": "object",
                              "properties": {
                                "compactLayoutRef": {
                                  "type": "string",
                                  "minLength": 1
                                }
                              },
                              "required": [
                                "compactLayoutRef"
                              ],
                              "additionalProperties": false
                            },
                            {
                              "type": "object",
                              "properties": {
                                "inline": {
                                  "type": "array",
                                  "items": {
                                    "type": "object",
                                    "properties": {
                                      "field": {
                                        "type": "string",
                                        "minLength": 1
                                      },
                                      "display": {
                                        "type": "string"
                                      },
                                      "formatType": {
                                        "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/rows/items/properties/columns/items/properties/display/properties/formatType"
                                      },
                                      "format": {
                                        "type": "string"
                                      }
                                    },
                                    "required": [
                                      "field"
                                    ],
                                    "additionalProperties": false
                                  },
                                  "minItems": 1
                                }
                              },
                              "required": [
                                "inline"
                              ],
                              "additionalProperties": false
                            }
                          ]
                        },
                        "rowActions": {
                          "type": "object",
                          "properties": {
                            "open": {
                              "type": "string",
                              "enum": [
                                "tab",
                                "modal",
                                "peek"
                              ],
                              "default": "modal"
                            },
                            "quickEdit": {
                              "type": "string",
                              "enum": [
                                "inline",
                                "modal"
                              ]
                            },
                            "delete": {
                              "type": "boolean",
                              "default": false
                            },
                            "custom": {
                              "type": "array",
                              "items": {
                                "type": "object",
                                "properties": {
                                  "label": {
                                    "type": "string",
                                    "minLength": 1
                                  },
                                  "icon": {
                                    "type": "string"
                                  },
                                  "action": {
                                    "type": "string",
                                    "enum": [
                                      "open",
                                      "edit",
                                      "delete",
                                      "custom"
                                    ]
                                  },
                                  "target": {
                                    "type": "string"
                                  }
                                },
                                "required": [
                                  "label",
                                  "action"
                                ],
                                "additionalProperties": false
                              },
                              "default": []
                            }
                          },
                          "additionalProperties": false,
                          "default": {
                            "open": "modal",
                            "delete": false,
                            "custom": []
                          }
                        },
                        "emptyState": {
                          "type": "object",
                          "properties": {
                            "message": {
                              "type": "string"
                            },
                            "icon": {
                              "type": "string"
                            }
                          },
                          "additionalProperties": false
                        },
                        "defaultSort": {
                          "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/1/properties/tables/items/properties/orderBy/anyOf/0"
                        },
                        "filters": {
                          "type": "object",
                          "additionalProperties": {
                            "type": "string"
                          }
                        },
                        "pageSize": {
                          "type": "integer",
                          "exclusiveMinimum": 0,
                          "maximum": 200,
                          "default": 25
                        }
                      },
                      "required": [
                        "id",
                        "object",
                        "relationship",
                        "columns"
                      ],
                      "additionalProperties": false
                    },
                    "default": []
                  }
                },
                "required": [
                  "id",
                  "type",
                  "tables"
                ],
                "additionalProperties": false
              },
              {
                "type": "object",
                "properties": {
                  "id": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/id"
                  },
                  "header": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/header"
                  },
                  "editable": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/editable"
                  },
                  "hideOnCreate": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/hideOnCreate"
                  },
                  "autoCollapse": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/autoCollapse"
                  },
                  "showCollapse": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/showCollapse"
                  },
                  "conditions": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/conditions"
                  },
                  "type": {
                    "type": "string",
                    "const": "kanban"
                  },
                  "kanban": {
                    "anyOf": [
                      {
                        "allOf": [
                          {
                            "type": "object",
                            "properties": {
                              "compactLayoutId": {
                                "type": "string"
                              },
                              "cardFields": {
                                "type": "array",
                                "items": {
                                  "type": "object",
                                  "properties": {
                                    "field": {
                                      "type": "string",
                                      "minLength": 1
                                    },
                                    "display": {
                                      "type": "string"
                                    },
                                    "formatType": {
                                      "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/rows/items/properties/columns/items/properties/display/properties/formatType"
                                    },
                                    "format": {
                                      "type": "string"
                                    },
                                    "type": {
                                      "type": "string",
                                      "enum": [
                                        "link"
                                      ]
                                    },
                                    "linkObject": {
                                      "type": "string"
                                    },
                                    "linkField": {
                                      "type": "string"
                                    }
                                  },
                                  "required": [
                                    "field"
                                  ],
                                  "additionalProperties": false
                                }
                              }
                            }
                          },
                          {
                            "type": "object",
                            "properties": {
                              "summaries": {
                                "type": "array",
                                "items": {
                                  "type": "object",
                                  "properties": {
                                    "type": {
                                      "type": "string",
                                      "enum": [
                                        "count",
                                        "sum",
                                        "avg",
                                        "min",
                                        "max"
                                      ]
                                    },
                                    "field": {
                                      "type": "string"
                                    },
                                    "enabled": {
                                      "type": "boolean",
                                      "default": true
                                    },
                                    "formatType": {
                                      "type": "string",
                                      "enum": [
                                        "currency",
                                        "number"
                                      ]
                                    },
                                    "format": {
                                      "type": "string"
                                    }
                                  },
                                  "required": [
                                    "type"
                                  ],
                                  "additionalProperties": false
                                },
                                "default": []
                              },
                              "actions": {
                                "type": "object",
                                "properties": {
                                  "create": {
                                    "type": "boolean",
                                    "default": false
                                  },
                                  "edit": {
                                    "type": "boolean",
                                    "default": true
                                  },
                                  "delete": {
                                    "type": "boolean",
                                    "default": false
                                  },
                                  "cardClick": {
                                    "type": "string",
                                    "enum": [
                                      "tab",
                                      "modal",
                                      "none"
                                    ],
                                    "default": "modal"
                                  }
                                },
                                "additionalProperties": false,
                                "default": {}
                              }
                            }
                          },
                          {
                            "type": "object",
                            "properties": {
                              "mode": {
                                "type": "string",
                                "const": "simple"
                              },
                              "columnField": {
                                "type": "string",
                                "minLength": 1
                              },
                              "columnSort": {
                                "type": "string",
                                "enum": [
                                  "asc",
                                  "desc"
                                ],
                                "default": "asc"
                              }
                            },
                            "required": [
                              "mode",
                              "columnField"
                            ]
                          }
                        ]
                      },
                      {
                        "allOf": [
                          {
                            "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/2/properties/kanban/anyOf/0/allOf/0/allOf/0"
                          },
                          {
                            "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/2/properties/kanban/anyOf/0/allOf/0/allOf/1"
                          },
                          {
                            "type": "object",
                            "properties": {
                              "mode": {
                                "type": "string",
                                "const": "related"
                              },
                              "configObject": {
                                "type": "string",
                                "minLength": 1
                              },
                              "configObjectField": {
                                "type": "string",
                                "minLength": 1
                              },
                              "stagesObject": {
                                "type": "string",
                                "minLength": 1
                              },
                              "stagesColumnField": {
                                "type": "string",
                                "minLength": 1
                              },
                              "stagesOrderField": {
                                "type": "string"
                              },
                              "stagesSortDirection": {
                                "type": "string",
                                "enum": [
                                  "asc",
                                  "desc"
                                ],
                                "default": "asc"
                              },
                              "relationship": {
                                "type": "object",
                                "properties": {
                                  "configToStages": {
                                    "type": "object",
                                    "properties": {
                                      "field": {
                                        "type": "string",
                                        "minLength": 1
                                      },
                                      "relatedField": {
                                        "type": "string",
                                        "minLength": 1
                                      }
                                    },
                                    "required": [
                                      "field",
                                      "relatedField"
                                    ],
                                    "additionalProperties": false
                                  },
                                  "mainToConfig": {
                                    "type": "object",
                                    "properties": {
                                      "field": {
                                        "type": "string",
                                        "minLength": 1
                                      },
                                      "relatedField": {
                                        "type": "string",
                                        "minLength": 1
                                      }
                                    },
                                    "required": [
                                      "field",
                                      "relatedField"
                                    ],
                                    "additionalProperties": false
                                  }
                                },
                                "required": [
                                  "configToStages",
                                  "mainToConfig"
                                ],
                                "additionalProperties": false
                              },
                              "stageMapping": {
                                "type": "object",
                                "properties": {
                                  "mainField": {
                                    "type": "string",
                                    "minLength": 1
                                  },
                                  "stageField": {
                                    "type": "string",
                                    "minLength": 1
                                  }
                                },
                                "required": [
                                  "mainField",
                                  "stageField"
                                ],
                                "additionalProperties": false
                              },
                              "autoSelect": {
                                "type": "object",
                                "properties": {
                                  "enabled": {
                                    "type": "boolean",
                                    "default": false
                                  },
                                  "field": {
                                    "type": "string"
                                  },
                                  "value": {
                                    "type": "string"
                                  }
                                },
                                "additionalProperties": false,
                                "default": {
                                  "enabled": false
                                }
                              }
                            },
                            "required": [
                              "mode",
                              "configObject",
                              "configObjectField",
                              "stagesObject",
                              "stagesColumnField",
                              "relationship",
                              "stageMapping"
                            ]
                          }
                        ]
                      },
                      {
                        "allOf": [
                          {
                            "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/2/properties/kanban/anyOf/0/allOf/0/allOf/0"
                          },
                          {
                            "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/2/properties/kanban/anyOf/0/allOf/0/allOf/1"
                          },
                          {
                            "type": "object",
                            "properties": {
                              "mode": {
                                "type": "string",
                                "const": "child-records"
                              },
                              "childObject": {
                                "type": "string",
                                "minLength": 1
                              },
                              "join": {
                                "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/rows/items/properties/columns/items/properties/join"
                              },
                              "stageMapping": {
                                "type": "object",
                                "properties": {
                                  "field": {
                                    "type": "string",
                                    "minLength": 1
                                  },
                                  "lookupObject": {
                                    "type": "string"
                                  },
                                  "lookupDisplayField": {
                                    "type": "string"
                                  },
                                  "lookupOrderField": {
                                    "type": "string"
                                  },
                                  "filterByParent": {
                                    "type": "boolean",
                                    "default": false
                                  },
                                  "stageParentField": {
                                    "type": "string"
                                  },
                                  "parentRecordField": {
                                    "type": "string"
                                  }
                                },
                                "required": [
                                  "field"
                                ],
                                "additionalProperties": false
                              }
                            },
                            "required": [
                              "mode",
                              "childObject",
                              "join",
                              "stageMapping"
                            ]
                          }
                        ]
                      }
                    ]
                  }
                },
                "required": [
                  "id",
                  "type",
                  "kanban"
                ],
                "additionalProperties": false
              },
              {
                "type": "object",
                "properties": {
                  "id": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/id"
                  },
                  "header": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/header"
                  },
                  "editable": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/editable"
                  },
                  "hideOnCreate": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/hideOnCreate"
                  },
                  "autoCollapse": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/autoCollapse"
                  },
                  "showCollapse": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/showCollapse"
                  },
                  "conditions": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/conditions"
                  },
                  "type": {
                    "type": "string",
                    "const": "table-kanban"
                  },
                  "defaultView": {
                    "type": "string",
                    "enum": [
                      "table",
                      "kanban"
                    ],
                    "default": "table"
                  },
                  "tableLayout": {
                    "type": "string",
                    "enum": [
                      "full-width",
                      "two-columns"
                    ],
                    "default": "full-width"
                  },
                  "tables": {
                    "type": "array",
                    "items": {
                      "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/1/properties/tables/items"
                    },
                    "minItems": 1
                  },
                  "kanban": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/2/properties/kanban"
                  },
                  "relatedLists": {
                    "type": "array",
                    "items": {
                      "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/1/properties/relatedLists/items"
                    },
                    "default": []
                  }
                },
                "required": [
                  "id",
                  "type",
                  "tables",
                  "kanban"
                ],
                "additionalProperties": false
              },
              {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string",
                    "minLength": 1
                  },
                  "type": {
                    "type": "string",
                    "const": "widget"
                  },
                  "widgetId": {
                    "type": "string",
                    "minLength": 1
                  },
                  "x": {
                    "type": "integer",
                    "minimum": 0,
                    "maximum": 11
                  },
                  "y": {
                    "type": "integer",
                    "minimum": 0
                  },
                  "w": {
                    "type": "integer",
                    "minimum": 1,
                    "maximum": 12
                  },
                  "h": {
                    "type": "integer",
                    "minimum": 1,
                    "maximum": 8
                  },
                  "title": {
                    "type": "string"
                  },
                  "settings": {
                    "type": "object",
                    "additionalProperties": {},
                    "default": {}
                  }
                },
                "required": [
                  "id",
                  "type",
                  "widgetId",
                  "x",
                  "y",
                  "w",
                  "h"
                ],
                "additionalProperties": false
              },
              {
                "type": "object",
                "properties": {
                  "id": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/id"
                  },
                  "header": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/header"
                  },
                  "editable": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/editable"
                  },
                  "hideOnCreate": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/hideOnCreate"
                  },
                  "autoCollapse": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/autoCollapse"
                  },
                  "showCollapse": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/showCollapse"
                  },
                  "conditions": {
                    "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/conditions"
                  },
                  "type": {
                    "type": "string",
                    "const": "timeline"
                  },
                  "sources": {
                    "type": "array",
                    "items": {
                      "type": "string",
                      "enum": [
                        "web",
                        "ads",
                        "form",
                        "email",
                        "sms",
                        "call",
                        "ticket",
                        "note",
                        "score",
                        "program",
                        "file"
                      ]
                    },
                    "default": [
                      "web",
                      "ads",
                      "form",
                      "email",
                      "sms",
                      "call",
                      "ticket",
                      "note",
                      "score",
                      "program",
                      "file"
                    ]
                  },
                  "limit": {
                    "type": "integer",
                    "exclusiveMinimum": 0,
                    "default": 50
                  },
                  "showFilters": {
                    "type": "boolean",
                    "default": true
                  }
                },
                "required": [
                  "id",
                  "type"
                ],
                "additionalProperties": false
              }
            ]
          },
          "default": []
        },
        "feeds": {
          "type": "object",
          "properties": {
            "enabled": {
              "type": "boolean",
              "default": false
            },
            "hideOnCreate": {
              "type": "boolean",
              "default": false
            }
          },
          "additionalProperties": false
        },
        "notes": {
          "$ref": "#/definitions/LayoutDoc/properties/feeds"
        },
        "aiInsights": {
          "$ref": "#/definitions/LayoutDoc/properties/feeds"
        },
        "aiGoals": {
          "$ref": "#/definitions/LayoutDoc/properties/feeds"
        },
        "googleDrive": {
          "type": "object",
          "properties": {
            "enabled": {
              "type": "boolean",
              "default": false
            },
            "hideOnCreate": {
              "type": "boolean",
              "default": false
            },
            "sharedDriveId": {
              "type": "string"
            },
            "folderPath": {
              "type": "string"
            }
          },
          "additionalProperties": false
        },
        "filterPanel": {
          "type": "object",
          "properties": {
            "enabled": {
              "type": "boolean",
              "default": true
            },
            "defaultCollapsed": {
              "type": "boolean",
              "default": false
            }
          },
          "additionalProperties": false
        },
        "actions": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "minLength": 1
              },
              "type": {
                "type": "string",
                "enum": [
                  "create",
                  "edit",
                  "delete",
                  "custom"
                ]
              },
              "label": {
                "type": "string"
              },
              "target": {
                "type": "string"
              },
              "mode": {
                "type": "string",
                "enum": [
                  "modal",
                  "tab",
                  "inline"
                ],
                "default": "modal"
              },
              "layout": {
                "type": "string"
              },
              "placement": {
                "type": "string",
                "enum": [
                  "header",
                  "section",
                  "row",
                  "card"
                ]
              },
              "visibility": {
                "$ref": "#/definitions/LayoutDoc/properties/sections/items/anyOf/0/properties/conditions"
              },
              "prefill": {
                "type": "object",
                "additionalProperties": {
                  "$ref": "#/definitions/LayoutDoc/properties/tabName"
                }
              }
            },
            "required": [
              "id",
              "type",
              "placement"
            ],
            "additionalProperties": false
          },
          "default": []
        }
      },
      "required": [
        "objectName",
        "type"
      ],
      "additionalProperties": false
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```
</details>

## CompactLayoutDoc

Root document for type:compact layouts — capped flat field list.

| property | type | required | default |
|---|---|---|---|
| `schemaVersion` | number | no | 2 |
| `objectName` | string | yes |  |
| `fields` | array | yes |  |

<details><summary>Full JSON schema</summary>

```json
{
  "$ref": "#/definitions/CompactLayoutDoc",
  "definitions": {
    "CompactLayoutDoc": {
      "type": "object",
      "properties": {
        "schemaVersion": {
          "type": "number",
          "const": 2,
          "default": 2
        },
        "objectName": {
          "type": "string",
          "minLength": 1
        },
        "fields": {
          "type": "array",
          "items": {
            "type": "object",
            "properties": {
              "id": {
                "type": "string",
                "minLength": 1
              },
              "type": {
                "type": "string",
                "enum": [
                  "content",
                  "component",
                  "empty"
                ]
              },
              "object": {
                "type": "string"
              },
              "hideOnCreate": {
                "type": "boolean",
                "default": false
              },
              "conditions": {
                "type": "object",
                "properties": {
                  "field": {
                    "type": "string",
                    "minLength": 1
                  },
                  "operator": {
                    "type": "string",
                    "enum": [
                      "eq",
                      "neq",
                      "contains",
                      "startsWith",
                      "endsWith",
                      "gt",
                      "gte",
                      "lt",
                      "lte",
                      "isNull",
                      "isNotNull"
                    ],
                    "default": "eq"
                  },
                  "value": {
                    "type": [
                      "string",
                      "number",
                      "boolean",
                      "null"
                    ]
                  }
                },
                "required": [
                  "field"
                ],
                "additionalProperties": false
              },
              "join": {
                "type": "object",
                "properties": {
                  "childField": {
                    "type": "string",
                    "minLength": 1,
                    "description": "FK column on the child/related object that stores the parent id (legacy: table/component join.column, kanban join.childField)"
                  },
                  "parentField": {
                    "type": "string",
                    "minLength": 1,
                    "default": "id",
                    "description": "Field read off the parent record to match (legacy: kanban join.parentField; table/component join.value as \"{{parentField}}\")"
                  }
                },
                "required": [
                  "childField"
                ],
                "additionalProperties": false
              },
              "component": {
                "type": "string"
              },
              "componentConfig": {
                "type": "object",
                "additionalProperties": {}
              },
              "display": {
                "type": "object",
                "properties": {
                  "label": {
                    "type": "string",
                    "default": ""
                  },
                  "value": {
                    "type": "string",
                    "minLength": 1
                  },
                  "fieldType": {
                    "type": "string",
                    "enum": [
                      "input",
                      "textArea",
                      "code",
                      "readOnly",
                      "spacer",
                      "composite",
                      "select",
                      "selectDynamic",
                      "securityBlurHover",
                      "securityBlurAlways",
                      "securityLastX",
                      "securityFirstX",
                      "securityFirstLastX"
                    ]
                  },
                  "formatType": {
                    "type": "string",
                    "enum": [
                      "timestamp",
                      "phone",
                      "currency",
                      "number",
                      "percentage",
                      "boolean",
                      "user",
                      "securityBlurHover",
                      "securityBlurAlways",
                      "securityLastX",
                      "securityFirstX",
                      "securityFirstLastX",
                      "none"
                    ]
                  },
                  "format": {
                    "type": "string"
                  },
                  "relatedKey": {
                    "type": "string"
                  },
                  "relatedObject": {
                    "type": "string"
                  },
                  "code": {
                    "type": "object",
                    "properties": {
                      "language": {
                        "type": "string",
                        "default": "plaintext"
                      },
                      "width": {
                        "type": "string"
                      },
                      "height": {
                        "type": "string"
                      }
                    },
                    "additionalProperties": false
                  },
                  "securityConfig": {
                    "type": "object",
                    "properties": {
                      "editWithoutValue": {
                        "type": "boolean",
                        "default": false
                      },
                      "readOnly": {
                        "type": "boolean",
                        "default": false
                      },
                      "showChars": {
                        "type": "integer",
                        "minimum": 0
                      },
                      "hideLength": {
                        "type": "boolean",
                        "default": false
                      }
                    },
                    "additionalProperties": false
                  },
                  "link": {
                    "type": "object",
                    "properties": {
                      "path": {
                        "type": "string",
                        "minLength": 1
                      },
                      "tabName": {
                        "type": "string"
                      },
                      "tabIcon": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "path"
                    ],
                    "additionalProperties": false
                  }
                },
                "required": [
                  "value",
                  "fieldType"
                ],
                "additionalProperties": false
              },
              "edit": {
                "anyOf": [
                  {
                    "type": "object",
                    "properties": {
                      "field": {
                        "type": "string",
                        "minLength": 1
                      },
                      "label": {
                        "type": "string"
                      },
                      "required": {
                        "type": "boolean",
                        "default": false
                      },
                      "editableOnCreateOnly": {
                        "type": "boolean",
                        "default": false
                      },
                      "hiddenOnCreate": {
                        "type": "boolean",
                        "default": false
                      },
                      "fieldType": {
                        "type": "string",
                        "enum": [
                          "input",
                          "select",
                          "selectDynamic",
                          "textArea",
                          "code",
                          "spacer"
                        ]
                      },
                      "fieldTypeSub": {
                        "type": "string",
                        "enum": [
                          "text",
                          "email",
                          "tel",
                          "url",
                          "number",
                          "date",
                          "datetime-local",
                          "time"
                        ]
                      },
                      "placeholder": {
                        "type": "string"
                      },
                      "textArea": {
                        "type": "object",
                        "properties": {
                          "rows": {
                            "type": "integer",
                            "exclusiveMinimum": 0,
                            "default": 4
                          }
                        },
                        "additionalProperties": false
                      },
                      "code": {
                        "type": "object",
                        "properties": {
                          "language": {
                            "type": "string",
                            "default": "plaintext"
                          }
                        },
                        "additionalProperties": false
                      },
                      "select": {
                        "anyOf": [
                          {
                            "type": "object",
                            "properties": {
                              "options": {
                                "type": "array",
                                "items": {
                                  "type": "object",
                                  "properties": {
                                    "name": {
                                      "type": "string"
                                    },
                                    "value": {
                                      "type": "string"
                                    }
                                  },
                                  "required": [
                                    "name",
                                    "value"
                                  ],
                                  "additionalProperties": false
                                }
                              },
                              "optionSource": {
                                "type": "string"
                              }
                            },
                            "additionalProperties": false
                          },
                          {
                            "type": "object",
                            "properties": {
                              "queryConfig": {
                                "type": "object",
                                "properties": {
                                  "object": {
                                    "type": "string",
                                    "minLength": 1
                                  },
                                  "select": {
                                    "type": "array",
                                    "items": {
                                      "type": "string"
                                    },
                                    "default": [
                                      "id",
                                      "name"
                                    ]
                                  },
                                  "searchField": {
                                    "type": "string",
                                    "default": "name"
                                  },
                                  "searchOperator": {
                                    "type": "string",
                                    "enum": [
                                      "contains",
                                      "startsWith",
                                      "endsWith",
                                      "eq"
                                    ],
                                    "default": "contains"
                                  },
                                  "valueField": {
                                    "type": "string",
                                    "default": "id"
                                  },
                                  "displayTemplate": {
                                    "$ref": "#/definitions/CompactLayoutDoc/properties/fields/items/properties/display/properties/link/properties/path",
                                    "default": "{{name}}"
                                  },
                                  "limit": {
                                    "type": "integer",
                                    "exclusiveMinimum": 0,
                                    "maximum": 200,
                                    "default": 25
                                  },
                                  "additionalWhere": {
                                    "type": "object",
                                    "additionalProperties": {
                                      "type": "string"
                                    }
                                  },
                                  "orderByField": {
                                    "type": "string"
                                  },
                                  "orderByDirection": {
                                    "type": "string",
                                    "enum": [
                                      "asc",
                                      "desc"
                                    ],
                                    "default": "asc"
                                  }
                                },
                                "required": [
                                  "object"
                                ],
                                "additionalProperties": false
                              },
                              "responseMapping": {
                                "type": "object",
                                "properties": {
                                  "name": {
                                    "type": "string",
                                    "minLength": 1
                                  },
                                  "value": {
                                    "type": "string",
                                    "minLength": 1
                                  }
                                },
                                "required": [
                                  "name",
                                  "value"
                                ],
                                "additionalProperties": false,
                                "default": {
                                  "name": "name",
                                  "value": "id"
                                }
                              },
                              "multiple": {
                                "type": "boolean",
                                "default": false
                              },
                              "clearable": {
                                "type": "boolean",
                                "default": true
                              },
                              "searchable": {
                                "type": "boolean",
                                "default": true
                              },
                              "preloadOptions": {
                                "type": "boolean",
                                "default": false
                              },
                              "initialSearchQuery": {
                                "type": "string"
                              },
                              "initialLoadLimit": {
                                "type": "integer",
                                "exclusiveMinimum": 0
                              },
                              "fetchOptions": {
                                "type": "object",
                                "properties": {
                                  "credentials": {
                                    "type": "string"
                                  }
                                },
                                "additionalProperties": false
                              }
                            },
                            "required": [
                              "queryConfig"
                            ],
                            "additionalProperties": false
                          }
                        ]
                      }
                    },
                    "required": [
                      "field",
                      "fieldType"
                    ],
                    "additionalProperties": false
                  },
                  {
                    "type": "array",
                    "items": {
                      "$ref": "#/definitions/CompactLayoutDoc/properties/fields/items/properties/edit/anyOf/0"
                    }
                  }
                ]
              }
            },
            "required": [
              "id",
              "type"
            ],
            "additionalProperties": false
          },
          "minItems": 1,
          "maxItems": 12
        }
      },
      "required": [
        "objectName",
        "fields"
      ],
      "additionalProperties": false
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```
</details>

## SectionSpec

One section: content | table | kanban | table-kanban.

| property | type | required | default |
|---|---|---|---|

<details><summary>Full JSON schema</summary>

```json
{
  "$ref": "#/definitions/SectionSpec",
  "definitions": {
    "SectionSpec": {
      "anyOf": [
        {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "minLength": 1
            },
            "header": {
              "type": "object",
              "properties": {
                "value": {
                  "type": "string",
                  "default": ""
                },
                "collapsedValue": {
                  "type": "string"
                },
                "hidden": {
                  "type": "boolean",
                  "default": false
                },
                "size": {
                  "type": "string",
                  "enum": [
                    "xs",
                    "sm",
                    "base",
                    "lg",
                    "xl",
                    "2xl",
                    "3xl"
                  ]
                },
                "weight": {
                  "type": "string",
                  "enum": [
                    "thin",
                    "light",
                    "normal",
                    "medium",
                    "semibold",
                    "bold",
                    "black"
                  ]
                },
                "icon": {
                  "type": "string"
                },
                "level": {
                  "type": "string",
                  "enum": [
                    "1",
                    "2",
                    "3",
                    "4",
                    "5",
                    "6"
                  ]
                },
                "collapsible": {
                  "type": "boolean"
                }
              },
              "additionalProperties": false,
              "default": {}
            },
            "editable": {
              "type": "boolean",
              "default": true
            },
            "hideOnCreate": {
              "type": "boolean",
              "default": false
            },
            "autoCollapse": {
              "type": "boolean",
              "default": false
            },
            "showCollapse": {
              "type": "boolean",
              "default": false
            },
            "conditions": {
              "type": "object",
              "properties": {
                "field": {
                  "type": "string",
                  "minLength": 1
                },
                "operator": {
                  "type": "string",
                  "enum": [
                    "eq",
                    "neq",
                    "contains",
                    "startsWith",
                    "endsWith",
                    "gt",
                    "gte",
                    "lt",
                    "lte",
                    "isNull",
                    "isNotNull"
                  ],
                  "default": "eq"
                },
                "value": {
                  "type": [
                    "string",
                    "number",
                    "boolean",
                    "null"
                  ]
                }
              },
              "required": [
                "field"
              ],
              "additionalProperties": false
            },
            "type": {
              "type": "string",
              "const": "content"
            },
            "rows": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string",
                    "minLength": 1
                  },
                  "columns": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "id": {
                          "type": "string",
                          "minLength": 1
                        },
                        "type": {
                          "type": "string",
                          "enum": [
                            "content",
                            "component",
                            "empty"
                          ]
                        },
                        "object": {
                          "type": "string"
                        },
                        "hideOnCreate": {
                          "type": "boolean",
                          "default": false
                        },
                        "conditions": {
                          "$ref": "#/definitions/SectionSpec/anyOf/0/properties/conditions"
                        },
                        "join": {
                          "type": "object",
                          "properties": {
                            "childField": {
                              "type": "string",
                              "minLength": 1,
                              "description": "FK column on the child/related object that stores the parent id (legacy: table/component join.column, kanban join.childField)"
                            },
                            "parentField": {
                              "type": "string",
                              "minLength": 1,
                              "default": "id",
                              "description": "Field read off the parent record to match (legacy: kanban join.parentField; table/component join.value as \"{{parentField}}\")"
                            }
                          },
                          "required": [
                            "childField"
                          ],
                          "additionalProperties": false
                        },
                        "component": {
                          "type": "string"
                        },
                        "componentConfig": {
                          "type": "object",
                          "additionalProperties": {}
                        },
                        "display": {
                          "type": "object",
                          "properties": {
                            "label": {
                              "type": "string",
                              "default": ""
                            },
                            "value": {
                              "type": "string",
                              "minLength": 1
                            },
                            "fieldType": {
                              "type": "string",
                              "enum": [
                                "input",
                                "textArea",
                                "code",
                                "readOnly",
                                "spacer",
                                "composite",
                                "select",
                                "selectDynamic",
                                "securityBlurHover",
                                "securityBlurAlways",
                                "securityLastX",
                                "securityFirstX",
                                "securityFirstLastX"
                              ]
                            },
                            "formatType": {
                              "type": "string",
                              "enum": [
                                "timestamp",
                                "phone",
                                "currency",
                                "number",
                                "percentage",
                                "boolean",
                                "user",
                                "securityBlurHover",
                                "securityBlurAlways",
                                "securityLastX",
                                "securityFirstX",
                                "securityFirstLastX",
                                "none"
                              ]
                            },
                            "format": {
                              "type": "string"
                            },
                            "relatedKey": {
                              "type": "string"
                            },
                            "relatedObject": {
                              "type": "string"
                            },
                            "code": {
                              "type": "object",
                              "properties": {
                                "language": {
                                  "type": "string",
                                  "default": "plaintext"
                                },
                                "width": {
                                  "type": "string"
                                },
                                "height": {
                                  "type": "string"
                                }
                              },
                              "additionalProperties": false
                            },
                            "securityConfig": {
                              "type": "object",
                              "properties": {
                                "editWithoutValue": {
                                  "type": "boolean",
                                  "default": false
                                },
                                "readOnly": {
                                  "type": "boolean",
                                  "default": false
                                },
                                "showChars": {
                                  "type": "integer",
                                  "minimum": 0
                                },
                                "hideLength": {
                                  "type": "boolean",
                                  "default": false
                                }
                              },
                              "additionalProperties": false
                            },
                            "link": {
                              "type": "object",
                              "properties": {
                                "path": {
                                  "type": "string",
                                  "minLength": 1
                                },
                                "tabName": {
                                  "type": "string"
                                },
                                "tabIcon": {
                                  "type": "string"
                                }
                              },
                              "required": [
                                "path"
                              ],
                              "additionalProperties": false
                            }
                          },
                          "required": [
                            "value",
                            "fieldType"
                          ],
                          "additionalProperties": false
                        },
                        "edit": {
                          "anyOf": [
                            {
                              "type": "object",
                              "properties": {
                                "field": {
                                  "type": "string",
                                  "minLength": 1
                                },
                                "label": {
                                  "type": "string"
                                },
                                "required": {
                                  "type": "boolean",
                                  "default": false
                                },
                                "editableOnCreateOnly": {
                                  "type": "boolean",
                                  "default": false
                                },
                                "hiddenOnCreate": {
                                  "type": "boolean",
                                  "default": false
                                },
                                "fieldType": {
                                  "type": "string",
                                  "enum": [
                                    "input",
                                    "select",
                                    "selectDynamic",
                                    "textArea",
                                    "code",
                                    "spacer"
                                  ]
                                },
                                "fieldTypeSub": {
                                  "type": "string",
                                  "enum": [
                                    "text",
                                    "email",
                                    "tel",
                                    "url",
                                    "number",
                                    "date",
                                    "datetime-local",
                                    "time"
                                  ]
                                },
                                "placeholder": {
                                  "type": "string"
                                },
                                "textArea": {
                                  "type": "object",
                                  "properties": {
                                    "rows": {
                                      "type": "integer",
                                      "exclusiveMinimum": 0,
                                      "default": 4
                                    }
                                  },
                                  "additionalProperties": false
                                },
                                "code": {
                                  "type": "object",
                                  "properties": {
                                    "language": {
                                      "type": "string",
                                      "default": "plaintext"
                                    }
                                  },
                                  "additionalProperties": false
                                },
                                "select": {
                                  "anyOf": [
                                    {
                                      "type": "object",
                                      "properties": {
                                        "options": {
                                          "type": "array",
                                          "items": {
                                            "type": "object",
                                            "properties": {
                                              "name": {
                                                "type": "string"
                                              },
                                              "value": {
                                                "type": "string"
                                              }
                                            },
                                            "required": [
                                              "name",
                                              "value"
                                            ],
                                            "additionalProperties": false
                                          }
                                        },
                                        "optionSource": {
                                          "type": "string"
                                        }
                                      },
                                      "additionalProperties": false
                                    },
                                    {
                                      "type": "object",
                                      "properties": {
                                        "queryConfig": {
                                          "type": "object",
                                          "properties": {
                                            "object": {
                                              "type": "string",
                                              "minLength": 1
                                            },
                                            "select": {
                                              "type": "array",
                                              "items": {
                                                "type": "string"
                                              },
                                              "default": [
                                                "id",
                                                "name"
                                              ]
                                            },
                                            "searchField": {
                                              "type": "string",
                                              "default": "name"
                                            },
                                            "searchOperator": {
                                              "type": "string",
                                              "enum": [
                                                "contains",
                                                "startsWith",
                                                "endsWith",
                                                "eq"
                                              ],
                                              "default": "contains"
                                            },
                                            "valueField": {
                                              "type": "string",
                                              "default": "id"
                                            },
                                            "displayTemplate": {
                                              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/rows/items/properties/columns/items/properties/display/properties/link/properties/path",
                                              "default": "{{name}}"
                                            },
                                            "limit": {
                                              "type": "integer",
                                              "exclusiveMinimum": 0,
                                              "maximum": 200,
                                              "default": 25
                                            },
                                            "additionalWhere": {
                                              "type": "object",
                                              "additionalProperties": {
                                                "type": "string"
                                              }
                                            },
                                            "orderByField": {
                                              "type": "string"
                                            },
                                            "orderByDirection": {
                                              "type": "string",
                                              "enum": [
                                                "asc",
                                                "desc"
                                              ],
                                              "default": "asc"
                                            }
                                          },
                                          "required": [
                                            "object"
                                          ],
                                          "additionalProperties": false
                                        },
                                        "responseMapping": {
                                          "type": "object",
                                          "properties": {
                                            "name": {
                                              "type": "string",
                                              "minLength": 1
                                            },
                                            "value": {
                                              "type": "string",
                                              "minLength": 1
                                            }
                                          },
                                          "required": [
                                            "name",
                                            "value"
                                          ],
                                          "additionalProperties": false,
                                          "default": {
                                            "name": "name",
                                            "value": "id"
                                          }
                                        },
                                        "multiple": {
                                          "type": "boolean",
                                          "default": false
                                        },
                                        "clearable": {
                                          "type": "boolean",
                                          "default": true
                                        },
                                        "searchable": {
                                          "type": "boolean",
                                          "default": true
                                        },
                                        "preloadOptions": {
                                          "type": "boolean",
                                          "default": false
                                        },
                                        "initialSearchQuery": {
                                          "type": "string"
                                        },
                                        "initialLoadLimit": {
                                          "type": "integer",
                                          "exclusiveMinimum": 0
                                        },
                                        "fetchOptions": {
                                          "type": "object",
                                          "properties": {
                                            "credentials": {
                                              "type": "string"
                                            }
                                          },
                                          "additionalProperties": false
                                        }
                                      },
                                      "required": [
                                        "queryConfig"
                                      ],
                                      "additionalProperties": false
                                    }
                                  ]
                                }
                              },
                              "required": [
                                "field",
                                "fieldType"
                              ],
                              "additionalProperties": false
                            },
                            {
                              "type": "array",
                              "items": {
                                "$ref": "#/definitions/SectionSpec/anyOf/0/properties/rows/items/properties/columns/items/properties/edit/anyOf/0"
                              }
                            }
                          ]
                        }
                      },
                      "required": [
                        "id",
                        "type"
                      ],
                      "additionalProperties": false
                    }
                  }
                },
                "required": [
                  "id",
                  "columns"
                ],
                "additionalProperties": false
              },
              "default": []
            }
          },
          "required": [
            "id",
            "type"
          ],
          "additionalProperties": false
        },
        {
          "type": "object",
          "properties": {
            "id": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/id"
            },
            "header": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/header"
            },
            "editable": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/editable"
            },
            "hideOnCreate": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/hideOnCreate"
            },
            "autoCollapse": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/autoCollapse"
            },
            "showCollapse": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/showCollapse"
            },
            "conditions": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/conditions"
            },
            "type": {
              "type": "string",
              "const": "table"
            },
            "tableLayout": {
              "type": "string",
              "enum": [
                "full-width",
                "two-columns"
              ],
              "default": "full-width"
            },
            "tables": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string",
                    "minLength": 1
                  },
                  "object": {
                    "type": "string",
                    "minLength": 1
                  },
                  "join": {
                    "$ref": "#/definitions/SectionSpec/anyOf/0/properties/rows/items/properties/columns/items/properties/join"
                  },
                  "fields": {
                    "type": "array",
                    "items": {
                      "type": "object",
                      "properties": {
                        "field": {
                          "type": "string",
                          "minLength": 1
                        },
                        "display": {
                          "type": "string",
                          "default": ""
                        },
                        "hidden": {
                          "type": "boolean",
                          "default": false
                        },
                        "sortable": {
                          "type": "boolean",
                          "default": true
                        },
                        "type": {
                          "type": "string",
                          "enum": [
                            "link"
                          ]
                        },
                        "link": {
                          "type": "string"
                        },
                        "linkField": {
                          "type": "string"
                        },
                        "linkObject": {
                          "type": "string"
                        },
                        "formatType": {
                          "$ref": "#/definitions/SectionSpec/anyOf/0/properties/rows/items/properties/columns/items/properties/display/properties/formatType"
                        },
                        "format": {
                          "type": "string"
                        },
                        "relatedKey": {
                          "type": "string"
                        },
                        "relatedObject": {
                          "type": "string"
                        }
                      },
                      "required": [
                        "field"
                      ],
                      "additionalProperties": false
                    },
                    "default": []
                  },
                  "header": {
                    "type": "object",
                    "properties": {
                      "value": {
                        "$ref": "#/definitions/SectionSpec/anyOf/0/properties/header/properties/value"
                      },
                      "collapsedValue": {
                        "$ref": "#/definitions/SectionSpec/anyOf/0/properties/header/properties/collapsedValue"
                      },
                      "hidden": {
                        "$ref": "#/definitions/SectionSpec/anyOf/0/properties/header/properties/hidden"
                      },
                      "size": {
                        "$ref": "#/definitions/SectionSpec/anyOf/0/properties/header/properties/size"
                      },
                      "weight": {
                        "$ref": "#/definitions/SectionSpec/anyOf/0/properties/header/properties/weight"
                      },
                      "icon": {
                        "$ref": "#/definitions/SectionSpec/anyOf/0/properties/header/properties/icon"
                      },
                      "level": {
                        "$ref": "#/definitions/SectionSpec/anyOf/0/properties/header/properties/level"
                      },
                      "collapsible": {
                        "$ref": "#/definitions/SectionSpec/anyOf/0/properties/header/properties/collapsible"
                      }
                    },
                    "additionalProperties": false
                  },
                  "actions": {
                    "type": "object",
                    "properties": {
                      "edit": {
                        "type": "boolean",
                        "default": true
                      },
                      "create": {
                        "type": "boolean",
                        "default": false
                      },
                      "delete": {
                        "type": "boolean",
                        "default": false
                      },
                      "hideOnCreate": {
                        "type": "boolean",
                        "default": false
                      },
                      "cardClick": {
                        "type": "string",
                        "enum": [
                          "tab",
                          "modal"
                        ],
                        "default": "tab"
                      }
                    },
                    "additionalProperties": false,
                    "default": {}
                  },
                  "orderBy": {
                    "anyOf": [
                      {
                        "type": "object",
                        "properties": {
                          "field": {
                            "type": "string",
                            "minLength": 1
                          },
                          "direction": {
                            "type": "string",
                            "enum": [
                              "asc",
                              "desc"
                            ],
                            "default": "asc"
                          }
                        },
                        "required": [
                          "field"
                        ],
                        "additionalProperties": false
                      },
                      {
                        "type": "array",
                        "items": {
                          "$ref": "#/definitions/SectionSpec/anyOf/1/properties/tables/items/properties/orderBy/anyOf/0"
                        }
                      }
                    ]
                  },
                  "additionalWhere": {
                    "type": "object",
                    "additionalProperties": {
                      "type": "string"
                    }
                  },
                  "hideOnCreate": {
                    "type": "boolean",
                    "default": false
                  }
                },
                "required": [
                  "id",
                  "object"
                ],
                "additionalProperties": false
              },
              "minItems": 1
            },
            "relatedLists": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "id": {
                    "type": "string",
                    "minLength": 1
                  },
                  "object": {
                    "type": "string",
                    "minLength": 1
                  },
                  "relationship": {
                    "$ref": "#/definitions/SectionSpec/anyOf/0/properties/rows/items/properties/columns/items/properties/join"
                  },
                  "columns": {
                    "anyOf": [
                      {
                        "type": "object",
                        "properties": {
                          "compactLayoutRef": {
                            "type": "string",
                            "minLength": 1
                          }
                        },
                        "required": [
                          "compactLayoutRef"
                        ],
                        "additionalProperties": false
                      },
                      {
                        "type": "object",
                        "properties": {
                          "inline": {
                            "type": "array",
                            "items": {
                              "type": "object",
                              "properties": {
                                "field": {
                                  "type": "string",
                                  "minLength": 1
                                },
                                "display": {
                                  "type": "string"
                                },
                                "formatType": {
                                  "$ref": "#/definitions/SectionSpec/anyOf/0/properties/rows/items/properties/columns/items/properties/display/properties/formatType"
                                },
                                "format": {
                                  "type": "string"
                                }
                              },
                              "required": [
                                "field"
                              ],
                              "additionalProperties": false
                            },
                            "minItems": 1
                          }
                        },
                        "required": [
                          "inline"
                        ],
                        "additionalProperties": false
                      }
                    ]
                  },
                  "rowActions": {
                    "type": "object",
                    "properties": {
                      "open": {
                        "type": "string",
                        "enum": [
                          "tab",
                          "modal",
                          "peek"
                        ],
                        "default": "modal"
                      },
                      "quickEdit": {
                        "type": "string",
                        "enum": [
                          "inline",
                          "modal"
                        ]
                      },
                      "delete": {
                        "type": "boolean",
                        "default": false
                      },
                      "custom": {
                        "type": "array",
                        "items": {
                          "type": "object",
                          "properties": {
                            "label": {
                              "type": "string",
                              "minLength": 1
                            },
                            "icon": {
                              "type": "string"
                            },
                            "action": {
                              "type": "string",
                              "enum": [
                                "open",
                                "edit",
                                "delete",
                                "custom"
                              ]
                            },
                            "target": {
                              "type": "string"
                            }
                          },
                          "required": [
                            "label",
                            "action"
                          ],
                          "additionalProperties": false
                        },
                        "default": []
                      }
                    },
                    "additionalProperties": false,
                    "default": {
                      "open": "modal",
                      "delete": false,
                      "custom": []
                    }
                  },
                  "emptyState": {
                    "type": "object",
                    "properties": {
                      "message": {
                        "type": "string"
                      },
                      "icon": {
                        "type": "string"
                      }
                    },
                    "additionalProperties": false
                  },
                  "defaultSort": {
                    "$ref": "#/definitions/SectionSpec/anyOf/1/properties/tables/items/properties/orderBy/anyOf/0"
                  },
                  "filters": {
                    "type": "object",
                    "additionalProperties": {
                      "type": "string"
                    }
                  },
                  "pageSize": {
                    "type": "integer",
                    "exclusiveMinimum": 0,
                    "maximum": 200,
                    "default": 25
                  }
                },
                "required": [
                  "id",
                  "object",
                  "relationship",
                  "columns"
                ],
                "additionalProperties": false
              },
              "default": []
            }
          },
          "required": [
            "id",
            "type",
            "tables"
          ],
          "additionalProperties": false
        },
        {
          "type": "object",
          "properties": {
            "id": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/id"
            },
            "header": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/header"
            },
            "editable": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/editable"
            },
            "hideOnCreate": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/hideOnCreate"
            },
            "autoCollapse": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/autoCollapse"
            },
            "showCollapse": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/showCollapse"
            },
            "conditions": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/conditions"
            },
            "type": {
              "type": "string",
              "const": "kanban"
            },
            "kanban": {
              "anyOf": [
                {
                  "allOf": [
                    {
                      "type": "object",
                      "properties": {
                        "compactLayoutId": {
                          "type": "string"
                        },
                        "cardFields": {
                          "type": "array",
                          "items": {
                            "type": "object",
                            "properties": {
                              "field": {
                                "type": "string",
                                "minLength": 1
                              },
                              "display": {
                                "type": "string"
                              },
                              "formatType": {
                                "$ref": "#/definitions/SectionSpec/anyOf/0/properties/rows/items/properties/columns/items/properties/display/properties/formatType"
                              },
                              "format": {
                                "type": "string"
                              },
                              "type": {
                                "type": "string",
                                "enum": [
                                  "link"
                                ]
                              },
                              "linkObject": {
                                "type": "string"
                              },
                              "linkField": {
                                "type": "string"
                              }
                            },
                            "required": [
                              "field"
                            ],
                            "additionalProperties": false
                          }
                        }
                      }
                    },
                    {
                      "type": "object",
                      "properties": {
                        "summaries": {
                          "type": "array",
                          "items": {
                            "type": "object",
                            "properties": {
                              "type": {
                                "type": "string",
                                "enum": [
                                  "count",
                                  "sum",
                                  "avg",
                                  "min",
                                  "max"
                                ]
                              },
                              "field": {
                                "type": "string"
                              },
                              "enabled": {
                                "type": "boolean",
                                "default": true
                              },
                              "formatType": {
                                "type": "string",
                                "enum": [
                                  "currency",
                                  "number"
                                ]
                              },
                              "format": {
                                "type": "string"
                              }
                            },
                            "required": [
                              "type"
                            ],
                            "additionalProperties": false
                          },
                          "default": []
                        },
                        "actions": {
                          "type": "object",
                          "properties": {
                            "create": {
                              "type": "boolean",
                              "default": false
                            },
                            "edit": {
                              "type": "boolean",
                              "default": true
                            },
                            "delete": {
                              "type": "boolean",
                              "default": false
                            },
                            "cardClick": {
                              "type": "string",
                              "enum": [
                                "tab",
                                "modal",
                                "none"
                              ],
                              "default": "modal"
                            }
                          },
                          "additionalProperties": false,
                          "default": {}
                        }
                      }
                    },
                    {
                      "type": "object",
                      "properties": {
                        "mode": {
                          "type": "string",
                          "const": "simple"
                        },
                        "columnField": {
                          "type": "string",
                          "minLength": 1
                        },
                        "columnSort": {
                          "type": "string",
                          "enum": [
                            "asc",
                            "desc"
                          ],
                          "default": "asc"
                        }
                      },
                      "required": [
                        "mode",
                        "columnField"
                      ]
                    }
                  ]
                },
                {
                  "allOf": [
                    {
                      "$ref": "#/definitions/SectionSpec/anyOf/2/properties/kanban/anyOf/0/allOf/0/allOf/0"
                    },
                    {
                      "$ref": "#/definitions/SectionSpec/anyOf/2/properties/kanban/anyOf/0/allOf/0/allOf/1"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "mode": {
                          "type": "string",
                          "const": "related"
                        },
                        "configObject": {
                          "type": "string",
                          "minLength": 1
                        },
                        "configObjectField": {
                          "type": "string",
                          "minLength": 1
                        },
                        "stagesObject": {
                          "type": "string",
                          "minLength": 1
                        },
                        "stagesColumnField": {
                          "type": "string",
                          "minLength": 1
                        },
                        "stagesOrderField": {
                          "type": "string"
                        },
                        "stagesSortDirection": {
                          "type": "string",
                          "enum": [
                            "asc",
                            "desc"
                          ],
                          "default": "asc"
                        },
                        "relationship": {
                          "type": "object",
                          "properties": {
                            "configToStages": {
                              "type": "object",
                              "properties": {
                                "field": {
                                  "type": "string",
                                  "minLength": 1
                                },
                                "relatedField": {
                                  "type": "string",
                                  "minLength": 1
                                }
                              },
                              "required": [
                                "field",
                                "relatedField"
                              ],
                              "additionalProperties": false
                            },
                            "mainToConfig": {
                              "type": "object",
                              "properties": {
                                "field": {
                                  "type": "string",
                                  "minLength": 1
                                },
                                "relatedField": {
                                  "type": "string",
                                  "minLength": 1
                                }
                              },
                              "required": [
                                "field",
                                "relatedField"
                              ],
                              "additionalProperties": false
                            }
                          },
                          "required": [
                            "configToStages",
                            "mainToConfig"
                          ],
                          "additionalProperties": false
                        },
                        "stageMapping": {
                          "type": "object",
                          "properties": {
                            "mainField": {
                              "type": "string",
                              "minLength": 1
                            },
                            "stageField": {
                              "type": "string",
                              "minLength": 1
                            }
                          },
                          "required": [
                            "mainField",
                            "stageField"
                          ],
                          "additionalProperties": false
                        },
                        "autoSelect": {
                          "type": "object",
                          "properties": {
                            "enabled": {
                              "type": "boolean",
                              "default": false
                            },
                            "field": {
                              "type": "string"
                            },
                            "value": {
                              "type": "string"
                            }
                          },
                          "additionalProperties": false,
                          "default": {
                            "enabled": false
                          }
                        }
                      },
                      "required": [
                        "mode",
                        "configObject",
                        "configObjectField",
                        "stagesObject",
                        "stagesColumnField",
                        "relationship",
                        "stageMapping"
                      ]
                    }
                  ]
                },
                {
                  "allOf": [
                    {
                      "$ref": "#/definitions/SectionSpec/anyOf/2/properties/kanban/anyOf/0/allOf/0/allOf/0"
                    },
                    {
                      "$ref": "#/definitions/SectionSpec/anyOf/2/properties/kanban/anyOf/0/allOf/0/allOf/1"
                    },
                    {
                      "type": "object",
                      "properties": {
                        "mode": {
                          "type": "string",
                          "const": "child-records"
                        },
                        "childObject": {
                          "type": "string",
                          "minLength": 1
                        },
                        "join": {
                          "$ref": "#/definitions/SectionSpec/anyOf/0/properties/rows/items/properties/columns/items/properties/join"
                        },
                        "stageMapping": {
                          "type": "object",
                          "properties": {
                            "field": {
                              "type": "string",
                              "minLength": 1
                            },
                            "lookupObject": {
                              "type": "string"
                            },
                            "lookupDisplayField": {
                              "type": "string"
                            },
                            "lookupOrderField": {
                              "type": "string"
                            },
                            "filterByParent": {
                              "type": "boolean",
                              "default": false
                            },
                            "stageParentField": {
                              "type": "string"
                            },
                            "parentRecordField": {
                              "type": "string"
                            }
                          },
                          "required": [
                            "field"
                          ],
                          "additionalProperties": false
                        }
                      },
                      "required": [
                        "mode",
                        "childObject",
                        "join",
                        "stageMapping"
                      ]
                    }
                  ]
                }
              ]
            }
          },
          "required": [
            "id",
            "type",
            "kanban"
          ],
          "additionalProperties": false
        },
        {
          "type": "object",
          "properties": {
            "id": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/id"
            },
            "header": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/header"
            },
            "editable": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/editable"
            },
            "hideOnCreate": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/hideOnCreate"
            },
            "autoCollapse": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/autoCollapse"
            },
            "showCollapse": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/showCollapse"
            },
            "conditions": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/conditions"
            },
            "type": {
              "type": "string",
              "const": "table-kanban"
            },
            "defaultView": {
              "type": "string",
              "enum": [
                "table",
                "kanban"
              ],
              "default": "table"
            },
            "tableLayout": {
              "type": "string",
              "enum": [
                "full-width",
                "two-columns"
              ],
              "default": "full-width"
            },
            "tables": {
              "type": "array",
              "items": {
                "$ref": "#/definitions/SectionSpec/anyOf/1/properties/tables/items"
              },
              "minItems": 1
            },
            "kanban": {
              "$ref": "#/definitions/SectionSpec/anyOf/2/properties/kanban"
            },
            "relatedLists": {
              "type": "array",
              "items": {
                "$ref": "#/definitions/SectionSpec/anyOf/1/properties/relatedLists/items"
              },
              "default": []
            }
          },
          "required": [
            "id",
            "type",
            "tables",
            "kanban"
          ],
          "additionalProperties": false
        },
        {
          "type": "object",
          "properties": {
            "id": {
              "type": "string",
              "minLength": 1
            },
            "type": {
              "type": "string",
              "const": "widget"
            },
            "widgetId": {
              "type": "string",
              "minLength": 1
            },
            "x": {
              "type": "integer",
              "minimum": 0,
              "maximum": 11
            },
            "y": {
              "type": "integer",
              "minimum": 0
            },
            "w": {
              "type": "integer",
              "minimum": 1,
              "maximum": 12
            },
            "h": {
              "type": "integer",
              "minimum": 1,
              "maximum": 8
            },
            "title": {
              "type": "string"
            },
            "settings": {
              "type": "object",
              "additionalProperties": {},
              "default": {}
            }
          },
          "required": [
            "id",
            "type",
            "widgetId",
            "x",
            "y",
            "w",
            "h"
          ],
          "additionalProperties": false
        },
        {
          "type": "object",
          "properties": {
            "id": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/id"
            },
            "header": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/header"
            },
            "editable": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/editable"
            },
            "hideOnCreate": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/hideOnCreate"
            },
            "autoCollapse": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/autoCollapse"
            },
            "showCollapse": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/showCollapse"
            },
            "conditions": {
              "$ref": "#/definitions/SectionSpec/anyOf/0/properties/conditions"
            },
            "type": {
              "type": "string",
              "const": "timeline"
            },
            "sources": {
              "type": "array",
              "items": {
                "type": "string",
                "enum": [
                  "web",
                  "ads",
                  "form",
                  "email",
                  "sms",
                  "call",
                  "ticket",
                  "note",
                  "score",
                  "program",
                  "file"
                ]
              },
              "default": [
                "web",
                "ads",
                "form",
                "email",
                "sms",
                "call",
                "ticket",
                "note",
                "score",
                "program",
                "file"
              ]
            },
            "limit": {
              "type": "integer",
              "exclusiveMinimum": 0,
              "default": 50
            },
            "showFilters": {
              "type": "boolean",
              "default": true
            }
          },
          "required": [
            "id",
            "type"
          ],
          "additionalProperties": false
        }
      ]
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```
</details>

## FieldSpec

One content-row column / component slot.

| property | type | required | default |
|---|---|---|---|
| `id` | string | yes |  |
| `type` | string | yes |  |
| `object` | string | no |  |
| `hideOnCreate` | boolean | no | false |
| `conditions` | object | no |  |
| `join` | object | no |  |
| `component` | string | no |  |
| `componentConfig` | object | no |  |
| `display` | object | no |  |
| `edit` | union/enum — see JSON schema below | no |  |

<details><summary>Full JSON schema</summary>

```json
{
  "$ref": "#/definitions/FieldSpec",
  "definitions": {
    "FieldSpec": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "minLength": 1
        },
        "type": {
          "type": "string",
          "enum": [
            "content",
            "component",
            "empty"
          ]
        },
        "object": {
          "type": "string"
        },
        "hideOnCreate": {
          "type": "boolean",
          "default": false
        },
        "conditions": {
          "type": "object",
          "properties": {
            "field": {
              "type": "string",
              "minLength": 1
            },
            "operator": {
              "type": "string",
              "enum": [
                "eq",
                "neq",
                "contains",
                "startsWith",
                "endsWith",
                "gt",
                "gte",
                "lt",
                "lte",
                "isNull",
                "isNotNull"
              ],
              "default": "eq"
            },
            "value": {
              "type": [
                "string",
                "number",
                "boolean",
                "null"
              ]
            }
          },
          "required": [
            "field"
          ],
          "additionalProperties": false
        },
        "join": {
          "type": "object",
          "properties": {
            "childField": {
              "type": "string",
              "minLength": 1,
              "description": "FK column on the child/related object that stores the parent id (legacy: table/component join.column, kanban join.childField)"
            },
            "parentField": {
              "type": "string",
              "minLength": 1,
              "default": "id",
              "description": "Field read off the parent record to match (legacy: kanban join.parentField; table/component join.value as \"{{parentField}}\")"
            }
          },
          "required": [
            "childField"
          ],
          "additionalProperties": false
        },
        "component": {
          "type": "string"
        },
        "componentConfig": {
          "type": "object",
          "additionalProperties": {}
        },
        "display": {
          "type": "object",
          "properties": {
            "label": {
              "type": "string",
              "default": ""
            },
            "value": {
              "type": "string",
              "minLength": 1
            },
            "fieldType": {
              "type": "string",
              "enum": [
                "input",
                "textArea",
                "code",
                "readOnly",
                "spacer",
                "composite",
                "select",
                "selectDynamic",
                "securityBlurHover",
                "securityBlurAlways",
                "securityLastX",
                "securityFirstX",
                "securityFirstLastX"
              ]
            },
            "formatType": {
              "type": "string",
              "enum": [
                "timestamp",
                "phone",
                "currency",
                "number",
                "percentage",
                "boolean",
                "user",
                "securityBlurHover",
                "securityBlurAlways",
                "securityLastX",
                "securityFirstX",
                "securityFirstLastX",
                "none"
              ]
            },
            "format": {
              "type": "string"
            },
            "relatedKey": {
              "type": "string"
            },
            "relatedObject": {
              "type": "string"
            },
            "code": {
              "type": "object",
              "properties": {
                "language": {
                  "type": "string",
                  "default": "plaintext"
                },
                "width": {
                  "type": "string"
                },
                "height": {
                  "type": "string"
                }
              },
              "additionalProperties": false
            },
            "securityConfig": {
              "type": "object",
              "properties": {
                "editWithoutValue": {
                  "type": "boolean",
                  "default": false
                },
                "readOnly": {
                  "type": "boolean",
                  "default": false
                },
                "showChars": {
                  "type": "integer",
                  "minimum": 0
                },
                "hideLength": {
                  "type": "boolean",
                  "default": false
                }
              },
              "additionalProperties": false
            },
            "link": {
              "type": "object",
              "properties": {
                "path": {
                  "type": "string",
                  "minLength": 1
                },
                "tabName": {
                  "type": "string"
                },
                "tabIcon": {
                  "type": "string"
                }
              },
              "required": [
                "path"
              ],
              "additionalProperties": false
            }
          },
          "required": [
            "value",
            "fieldType"
          ],
          "additionalProperties": false
        },
        "edit": {
          "anyOf": [
            {
              "type": "object",
              "properties": {
                "field": {
                  "type": "string",
                  "minLength": 1
                },
                "label": {
                  "type": "string"
                },
                "required": {
                  "type": "boolean",
                  "default": false
                },
                "editableOnCreateOnly": {
                  "type": "boolean",
                  "default": false
                },
                "hiddenOnCreate": {
                  "type": "boolean",
                  "default": false
                },
                "fieldType": {
                  "type": "string",
                  "enum": [
                    "input",
                    "select",
                    "selectDynamic",
                    "textArea",
                    "code",
                    "spacer"
                  ]
                },
                "fieldTypeSub": {
                  "type": "string",
                  "enum": [
                    "text",
                    "email",
                    "tel",
                    "url",
                    "number",
                    "date",
                    "datetime-local",
                    "time"
                  ]
                },
                "placeholder": {
                  "type": "string"
                },
                "textArea": {
                  "type": "object",
                  "properties": {
                    "rows": {
                      "type": "integer",
                      "exclusiveMinimum": 0,
                      "default": 4
                    }
                  },
                  "additionalProperties": false
                },
                "code": {
                  "type": "object",
                  "properties": {
                    "language": {
                      "type": "string",
                      "default": "plaintext"
                    }
                  },
                  "additionalProperties": false
                },
                "select": {
                  "anyOf": [
                    {
                      "type": "object",
                      "properties": {
                        "options": {
                          "type": "array",
                          "items": {
                            "type": "object",
                            "properties": {
                              "name": {
                                "type": "string"
                              },
                              "value": {
                                "type": "string"
                              }
                            },
                            "required": [
                              "name",
                              "value"
                            ],
                            "additionalProperties": false
                          }
                        },
                        "optionSource": {
                          "type": "string"
                        }
                      },
                      "additionalProperties": false
                    },
                    {
                      "type": "object",
                      "properties": {
                        "queryConfig": {
                          "type": "object",
                          "properties": {
                            "object": {
                              "type": "string",
                              "minLength": 1
                            },
                            "select": {
                              "type": "array",
                              "items": {
                                "type": "string"
                              },
                              "default": [
                                "id",
                                "name"
                              ]
                            },
                            "searchField": {
                              "type": "string",
                              "default": "name"
                            },
                            "searchOperator": {
                              "type": "string",
                              "enum": [
                                "contains",
                                "startsWith",
                                "endsWith",
                                "eq"
                              ],
                              "default": "contains"
                            },
                            "valueField": {
                              "type": "string",
                              "default": "id"
                            },
                            "displayTemplate": {
                              "$ref": "#/definitions/FieldSpec/properties/display/properties/link/properties/path",
                              "default": "{{name}}"
                            },
                            "limit": {
                              "type": "integer",
                              "exclusiveMinimum": 0,
                              "maximum": 200,
                              "default": 25
                            },
                            "additionalWhere": {
                              "type": "object",
                              "additionalProperties": {
                                "type": "string"
                              }
                            },
                            "orderByField": {
                              "type": "string"
                            },
                            "orderByDirection": {
                              "type": "string",
                              "enum": [
                                "asc",
                                "desc"
                              ],
                              "default": "asc"
                            }
                          },
                          "required": [
                            "object"
                          ],
                          "additionalProperties": false
                        },
                        "responseMapping": {
                          "type": "object",
                          "properties": {
                            "name": {
                              "type": "string",
                              "minLength": 1
                            },
                            "value": {
                              "type": "string",
                              "minLength": 1
                            }
                          },
                          "required": [
                            "name",
                            "value"
                          ],
                          "additionalProperties": false,
                          "default": {
                            "name": "name",
                            "value": "id"
                          }
                        },
                        "multiple": {
                          "type": "boolean",
                          "default": false
                        },
                        "clearable": {
                          "type": "boolean",
                          "default": true
                        },
                        "searchable": {
                          "type": "boolean",
                          "default": true
                        },
                        "preloadOptions": {
                          "type": "boolean",
                          "default": false
                        },
                        "initialSearchQuery": {
                          "type": "string"
                        },
                        "initialLoadLimit": {
                          "type": "integer",
                          "exclusiveMinimum": 0
                        },
                        "fetchOptions": {
                          "type": "object",
                          "properties": {
                            "credentials": {
                              "type": "string"
                            }
                          },
                          "additionalProperties": false
                        }
                      },
                      "required": [
                        "queryConfig"
                      ],
                      "additionalProperties": false
                    }
                  ]
                }
              },
              "required": [
                "field",
                "fieldType"
              ],
              "additionalProperties": false
            },
            {
              "type": "array",
              "items": {
                "$ref": "#/definitions/FieldSpec/properties/edit/anyOf/0"
              }
            }
          ]
        }
      },
      "required": [
        "id",
        "type"
      ],
      "additionalProperties": false
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```
</details>

## FormatSpec

Display formatting for a field or table column.

| property | type | required | default |
|---|---|---|---|
| `formatType` | string | yes |  |
| `format` | string | no |  |

<details><summary>Full JSON schema</summary>

```json
{
  "$ref": "#/definitions/FormatSpec",
  "definitions": {
    "FormatSpec": {
      "type": "object",
      "properties": {
        "formatType": {
          "type": "string",
          "enum": [
            "timestamp",
            "phone",
            "currency",
            "number",
            "percentage",
            "boolean",
            "user",
            "securityBlurHover",
            "securityBlurAlways",
            "securityLastX",
            "securityFirstX",
            "securityFirstLastX",
            "none"
          ]
        },
        "format": {
          "type": "string"
        }
      },
      "required": [
        "formatType"
      ],
      "additionalProperties": false
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```
</details>

## JoinSpec

Canonical parent/child record link (one shape, one meaning).

| property | type | required | default |
|---|---|---|---|
| `childField` | string | yes |  |
| `parentField` | string | no | id |

<details><summary>Full JSON schema</summary>

```json
{
  "$ref": "#/definitions/JoinSpec",
  "definitions": {
    "JoinSpec": {
      "type": "object",
      "properties": {
        "childField": {
          "type": "string",
          "minLength": 1,
          "description": "FK column on the child/related object that stores the parent id (legacy: table/component join.column, kanban join.childField)"
        },
        "parentField": {
          "type": "string",
          "minLength": 1,
          "default": "id",
          "description": "Field read off the parent record to match (legacy: kanban join.parentField; table/component join.value as \"{{parentField}}\")"
        }
      },
      "required": [
        "childField"
      ],
      "additionalProperties": false
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```
</details>

## SelectDynamicSpec

Server-backed async select/typeahead config.

| property | type | required | default |
|---|---|---|---|
| `queryConfig` | object | yes |  |
| `responseMapping` | object | no | [object Object] |
| `multiple` | boolean | no | false |
| `clearable` | boolean | no | true |
| `searchable` | boolean | no | true |
| `preloadOptions` | boolean | no | false |
| `initialSearchQuery` | string | no |  |
| `initialLoadLimit` | integer | no |  |
| `fetchOptions` | object | no |  |

<details><summary>Full JSON schema</summary>

```json
{
  "$ref": "#/definitions/SelectDynamicSpec",
  "definitions": {
    "SelectDynamicSpec": {
      "type": "object",
      "properties": {
        "queryConfig": {
          "type": "object",
          "properties": {
            "object": {
              "type": "string",
              "minLength": 1
            },
            "select": {
              "type": "array",
              "items": {
                "type": "string"
              },
              "default": [
                "id",
                "name"
              ]
            },
            "searchField": {
              "type": "string",
              "default": "name"
            },
            "searchOperator": {
              "type": "string",
              "enum": [
                "contains",
                "startsWith",
                "endsWith",
                "eq"
              ],
              "default": "contains"
            },
            "valueField": {
              "type": "string",
              "default": "id"
            },
            "displayTemplate": {
              "type": "string",
              "minLength": 1,
              "default": "{{name}}"
            },
            "limit": {
              "type": "integer",
              "exclusiveMinimum": 0,
              "maximum": 200,
              "default": 25
            },
            "additionalWhere": {
              "type": "object",
              "additionalProperties": {
                "type": "string"
              }
            },
            "orderByField": {
              "type": "string"
            },
            "orderByDirection": {
              "type": "string",
              "enum": [
                "asc",
                "desc"
              ],
              "default": "asc"
            }
          },
          "required": [
            "object"
          ],
          "additionalProperties": false
        },
        "responseMapping": {
          "type": "object",
          "properties": {
            "name": {
              "type": "string",
              "minLength": 1
            },
            "value": {
              "type": "string",
              "minLength": 1
            }
          },
          "required": [
            "name",
            "value"
          ],
          "additionalProperties": false,
          "default": {
            "name": "name",
            "value": "id"
          }
        },
        "multiple": {
          "type": "boolean",
          "default": false
        },
        "clearable": {
          "type": "boolean",
          "default": true
        },
        "searchable": {
          "type": "boolean",
          "default": true
        },
        "preloadOptions": {
          "type": "boolean",
          "default": false
        },
        "initialSearchQuery": {
          "type": "string"
        },
        "initialLoadLimit": {
          "type": "integer",
          "exclusiveMinimum": 0
        },
        "fetchOptions": {
          "type": "object",
          "properties": {
            "credentials": {
              "type": "string"
            }
          },
          "additionalProperties": false
        }
      },
      "required": [
        "queryConfig"
      ],
      "additionalProperties": false
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```
</details>

## KanbanConfigSpec

Kanban board config — simple | related | child-records.

| property | type | required | default |
|---|---|---|---|

<details><summary>Full JSON schema</summary>

```json
{
  "$ref": "#/definitions/KanbanConfigSpec",
  "definitions": {
    "KanbanConfigSpec": {
      "anyOf": [
        {
          "allOf": [
            {
              "type": "object",
              "properties": {
                "compactLayoutId": {
                  "type": "string"
                },
                "cardFields": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "field": {
                        "type": "string",
                        "minLength": 1
                      },
                      "display": {
                        "type": "string"
                      },
                      "formatType": {
                        "type": "string",
                        "enum": [
                          "timestamp",
                          "phone",
                          "currency",
                          "number",
                          "percentage",
                          "boolean",
                          "user",
                          "securityBlurHover",
                          "securityBlurAlways",
                          "securityLastX",
                          "securityFirstX",
                          "securityFirstLastX",
                          "none"
                        ]
                      },
                      "format": {
                        "type": "string"
                      },
                      "type": {
                        "type": "string",
                        "enum": [
                          "link"
                        ]
                      },
                      "linkObject": {
                        "type": "string"
                      },
                      "linkField": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "field"
                    ],
                    "additionalProperties": false
                  }
                }
              }
            },
            {
              "type": "object",
              "properties": {
                "summaries": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "type": {
                        "type": "string",
                        "enum": [
                          "count",
                          "sum",
                          "avg",
                          "min",
                          "max"
                        ]
                      },
                      "field": {
                        "type": "string"
                      },
                      "enabled": {
                        "type": "boolean",
                        "default": true
                      },
                      "formatType": {
                        "type": "string",
                        "enum": [
                          "currency",
                          "number"
                        ]
                      },
                      "format": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "type"
                    ],
                    "additionalProperties": false
                  },
                  "default": []
                },
                "actions": {
                  "type": "object",
                  "properties": {
                    "create": {
                      "type": "boolean",
                      "default": false
                    },
                    "edit": {
                      "type": "boolean",
                      "default": true
                    },
                    "delete": {
                      "type": "boolean",
                      "default": false
                    },
                    "cardClick": {
                      "type": "string",
                      "enum": [
                        "tab",
                        "modal",
                        "none"
                      ],
                      "default": "modal"
                    }
                  },
                  "additionalProperties": false,
                  "default": {}
                }
              }
            },
            {
              "type": "object",
              "properties": {
                "mode": {
                  "type": "string",
                  "const": "simple"
                },
                "columnField": {
                  "type": "string",
                  "minLength": 1
                },
                "columnSort": {
                  "type": "string",
                  "enum": [
                    "asc",
                    "desc"
                  ],
                  "default": "asc"
                }
              },
              "required": [
                "mode",
                "columnField"
              ]
            }
          ]
        },
        {
          "allOf": [
            {
              "$ref": "#/definitions/KanbanConfigSpec/anyOf/0/allOf/0/allOf/0"
            },
            {
              "$ref": "#/definitions/KanbanConfigSpec/anyOf/0/allOf/0/allOf/1"
            },
            {
              "type": "object",
              "properties": {
                "mode": {
                  "type": "string",
                  "const": "related"
                },
                "configObject": {
                  "type": "string",
                  "minLength": 1
                },
                "configObjectField": {
                  "type": "string",
                  "minLength": 1
                },
                "stagesObject": {
                  "type": "string",
                  "minLength": 1
                },
                "stagesColumnField": {
                  "type": "string",
                  "minLength": 1
                },
                "stagesOrderField": {
                  "type": "string"
                },
                "stagesSortDirection": {
                  "type": "string",
                  "enum": [
                    "asc",
                    "desc"
                  ],
                  "default": "asc"
                },
                "relationship": {
                  "type": "object",
                  "properties": {
                    "configToStages": {
                      "type": "object",
                      "properties": {
                        "field": {
                          "type": "string",
                          "minLength": 1
                        },
                        "relatedField": {
                          "type": "string",
                          "minLength": 1
                        }
                      },
                      "required": [
                        "field",
                        "relatedField"
                      ],
                      "additionalProperties": false
                    },
                    "mainToConfig": {
                      "type": "object",
                      "properties": {
                        "field": {
                          "type": "string",
                          "minLength": 1
                        },
                        "relatedField": {
                          "type": "string",
                          "minLength": 1
                        }
                      },
                      "required": [
                        "field",
                        "relatedField"
                      ],
                      "additionalProperties": false
                    }
                  },
                  "required": [
                    "configToStages",
                    "mainToConfig"
                  ],
                  "additionalProperties": false
                },
                "stageMapping": {
                  "type": "object",
                  "properties": {
                    "mainField": {
                      "type": "string",
                      "minLength": 1
                    },
                    "stageField": {
                      "type": "string",
                      "minLength": 1
                    }
                  },
                  "required": [
                    "mainField",
                    "stageField"
                  ],
                  "additionalProperties": false
                },
                "autoSelect": {
                  "type": "object",
                  "properties": {
                    "enabled": {
                      "type": "boolean",
                      "default": false
                    },
                    "field": {
                      "type": "string"
                    },
                    "value": {
                      "type": "string"
                    }
                  },
                  "additionalProperties": false,
                  "default": {
                    "enabled": false
                  }
                }
              },
              "required": [
                "mode",
                "configObject",
                "configObjectField",
                "stagesObject",
                "stagesColumnField",
                "relationship",
                "stageMapping"
              ]
            }
          ]
        },
        {
          "allOf": [
            {
              "$ref": "#/definitions/KanbanConfigSpec/anyOf/0/allOf/0/allOf/0"
            },
            {
              "$ref": "#/definitions/KanbanConfigSpec/anyOf/0/allOf/0/allOf/1"
            },
            {
              "type": "object",
              "properties": {
                "mode": {
                  "type": "string",
                  "const": "child-records"
                },
                "childObject": {
                  "type": "string",
                  "minLength": 1
                },
                "join": {
                  "type": "object",
                  "properties": {
                    "childField": {
                      "type": "string",
                      "minLength": 1,
                      "description": "FK column on the child/related object that stores the parent id (legacy: table/component join.column, kanban join.childField)"
                    },
                    "parentField": {
                      "type": "string",
                      "minLength": 1,
                      "default": "id",
                      "description": "Field read off the parent record to match (legacy: kanban join.parentField; table/component join.value as \"{{parentField}}\")"
                    }
                  },
                  "required": [
                    "childField"
                  ],
                  "additionalProperties": false
                },
                "stageMapping": {
                  "type": "object",
                  "properties": {
                    "field": {
                      "type": "string",
                      "minLength": 1
                    },
                    "lookupObject": {
                      "type": "string"
                    },
                    "lookupDisplayField": {
                      "type": "string"
                    },
                    "lookupOrderField": {
                      "type": "string"
                    },
                    "filterByParent": {
                      "type": "boolean",
                      "default": false
                    },
                    "stageParentField": {
                      "type": "string"
                    },
                    "parentRecordField": {
                      "type": "string"
                    }
                  },
                  "required": [
                    "field"
                  ],
                  "additionalProperties": false
                }
              },
              "required": [
                "mode",
                "childObject",
                "join",
                "stageMapping"
              ]
            }
          ]
        }
      ]
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```
</details>

## RelatedListSpec

Child-object list embedded in a detail view.

| property | type | required | default |
|---|---|---|---|
| `id` | string | yes |  |
| `object` | string | yes |  |
| `relationship` | object | yes |  |
| `columns` | union/enum — see JSON schema below | yes |  |
| `rowActions` | object | no | [object Object] |
| `emptyState` | object | no |  |
| `defaultSort` | object | no |  |
| `filters` | object | no |  |
| `pageSize` | integer | no | 25 |

<details><summary>Full JSON schema</summary>

```json
{
  "$ref": "#/definitions/RelatedListSpec",
  "definitions": {
    "RelatedListSpec": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "minLength": 1
        },
        "object": {
          "type": "string",
          "minLength": 1
        },
        "relationship": {
          "type": "object",
          "properties": {
            "childField": {
              "type": "string",
              "minLength": 1,
              "description": "FK column on the child/related object that stores the parent id (legacy: table/component join.column, kanban join.childField)"
            },
            "parentField": {
              "type": "string",
              "minLength": 1,
              "default": "id",
              "description": "Field read off the parent record to match (legacy: kanban join.parentField; table/component join.value as \"{{parentField}}\")"
            }
          },
          "required": [
            "childField"
          ],
          "additionalProperties": false
        },
        "columns": {
          "anyOf": [
            {
              "type": "object",
              "properties": {
                "compactLayoutRef": {
                  "type": "string",
                  "minLength": 1
                }
              },
              "required": [
                "compactLayoutRef"
              ],
              "additionalProperties": false
            },
            {
              "type": "object",
              "properties": {
                "inline": {
                  "type": "array",
                  "items": {
                    "type": "object",
                    "properties": {
                      "field": {
                        "type": "string",
                        "minLength": 1
                      },
                      "display": {
                        "type": "string"
                      },
                      "formatType": {
                        "type": "string",
                        "enum": [
                          "timestamp",
                          "phone",
                          "currency",
                          "number",
                          "percentage",
                          "boolean",
                          "user",
                          "securityBlurHover",
                          "securityBlurAlways",
                          "securityLastX",
                          "securityFirstX",
                          "securityFirstLastX",
                          "none"
                        ]
                      },
                      "format": {
                        "type": "string"
                      }
                    },
                    "required": [
                      "field"
                    ],
                    "additionalProperties": false
                  },
                  "minItems": 1
                }
              },
              "required": [
                "inline"
              ],
              "additionalProperties": false
            }
          ]
        },
        "rowActions": {
          "type": "object",
          "properties": {
            "open": {
              "type": "string",
              "enum": [
                "tab",
                "modal",
                "peek"
              ],
              "default": "modal"
            },
            "quickEdit": {
              "type": "string",
              "enum": [
                "inline",
                "modal"
              ]
            },
            "delete": {
              "type": "boolean",
              "default": false
            },
            "custom": {
              "type": "array",
              "items": {
                "type": "object",
                "properties": {
                  "label": {
                    "type": "string",
                    "minLength": 1
                  },
                  "icon": {
                    "type": "string"
                  },
                  "action": {
                    "type": "string",
                    "enum": [
                      "open",
                      "edit",
                      "delete",
                      "custom"
                    ]
                  },
                  "target": {
                    "type": "string"
                  }
                },
                "required": [
                  "label",
                  "action"
                ],
                "additionalProperties": false
              },
              "default": []
            }
          },
          "additionalProperties": false,
          "default": {
            "open": "modal",
            "delete": false,
            "custom": []
          }
        },
        "emptyState": {
          "type": "object",
          "properties": {
            "message": {
              "type": "string"
            },
            "icon": {
              "type": "string"
            }
          },
          "additionalProperties": false
        },
        "defaultSort": {
          "type": "object",
          "properties": {
            "field": {
              "type": "string",
              "minLength": 1
            },
            "direction": {
              "type": "string",
              "enum": [
                "asc",
                "desc"
              ],
              "default": "asc"
            }
          },
          "required": [
            "field"
          ],
          "additionalProperties": false
        },
        "filters": {
          "type": "object",
          "additionalProperties": {
            "type": "string"
          }
        },
        "pageSize": {
          "type": "integer",
          "exclusiveMinimum": 0,
          "maximum": 200,
          "default": 25
        }
      },
      "required": [
        "id",
        "object",
        "relationship",
        "columns"
      ],
      "additionalProperties": false
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```
</details>

## ActionSpec

A create/edit/delete/custom action attached to a layout, section, or related list.

| property | type | required | default |
|---|---|---|---|
| `id` | string | yes |  |
| `type` | string | yes |  |
| `label` | string | no |  |
| `target` | string | no |  |
| `mode` | string | no | modal |
| `layout` | string | no |  |
| `placement` | string | yes |  |
| `visibility` | object | no |  |
| `prefill` | object | no |  |

<details><summary>Full JSON schema</summary>

```json
{
  "$ref": "#/definitions/ActionSpec",
  "definitions": {
    "ActionSpec": {
      "type": "object",
      "properties": {
        "id": {
          "type": "string",
          "minLength": 1
        },
        "type": {
          "type": "string",
          "enum": [
            "create",
            "edit",
            "delete",
            "custom"
          ]
        },
        "label": {
          "type": "string"
        },
        "target": {
          "type": "string"
        },
        "mode": {
          "type": "string",
          "enum": [
            "modal",
            "tab",
            "inline"
          ],
          "default": "modal"
        },
        "layout": {
          "type": "string"
        },
        "placement": {
          "type": "string",
          "enum": [
            "header",
            "section",
            "row",
            "card"
          ]
        },
        "visibility": {
          "type": "object",
          "properties": {
            "field": {
              "type": "string",
              "minLength": 1
            },
            "operator": {
              "type": "string",
              "enum": [
                "eq",
                "neq",
                "contains",
                "startsWith",
                "endsWith",
                "gt",
                "gte",
                "lt",
                "lte",
                "isNull",
                "isNotNull"
              ],
              "default": "eq"
            },
            "value": {
              "type": [
                "string",
                "number",
                "boolean",
                "null"
              ]
            }
          },
          "required": [
            "field"
          ],
          "additionalProperties": false
        },
        "prefill": {
          "type": "object",
          "additionalProperties": {
            "type": "string",
            "minLength": 1
          }
        }
      },
      "required": [
        "id",
        "type",
        "placement"
      ],
      "additionalProperties": false
    }
  },
  "$schema": "http://json-schema.org/draft-07/schema#"
}
```
</details>
