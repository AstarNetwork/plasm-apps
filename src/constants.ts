/* eslint-disable @typescript-eslint/camelcase */
const PAPER_CONTRACT_CODE_HASH = "0xf832bff0044c7a23bc1451c7c6f4a1c4f7648ec95d1f11ccf5e6761652f22d3f";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const PAPER_CONTRACT_ABI: any = {
  registry: {
    strings: [
      "Storage",
      "sample",
      "__ink_private",
      "__ink_storage",
      "value",
      "Value",
      "ink_core",
      "storage",
      "cell",
      "SyncCell",
      "sync_cell",
      "Key",
      "ink_primitives",
      "new",
      "init_value",
      "i32",
      "default",
      "inc",
      "by",
      "get",
    ],
    types: [
      {
        id: {
          "custom.name": 1,
          "custom.namespace": [2, 2, 3, 4],
          "custom.params": [],
        },
        def: {
          "struct.fields": [
            {
              name: 5,
              type: 2,
            },
          ],
        },
      },
      {
        id: {
          "custom.name": 6,
          "custom.namespace": [7, 8, 5],
          "custom.params": [3],
        },
        def: {
          "struct.fields": [
            {
              name: 9,
              type: 4,
            },
          ],
        },
      },
      {
        id: "i32",
        def: "builtin",
      },
      {
        id: {
          "custom.name": 10,
          "custom.namespace": [7, 8, 9, 11],
          "custom.params": [3],
        },
        def: {
          "struct.fields": [
            {
              name: 9,
              type: 5,
            },
          ],
        },
      },
      {
        id: {
          "custom.name": 12,
          "custom.namespace": [13],
          "custom.params": [],
        },
        def: {
          "tuple_struct.types": [6],
        },
      },
      {
        id: {
          "array.len": 32,
          "array.type": 7,
        },
        def: "builtin",
      },
      {
        id: "u8",
        def: "builtin",
      },
    ],
  },
  storage: {
    "struct.type": 1,
    "struct.fields": [
      {
        name: 5,
        layout: {
          "struct.type": 2,
          "struct.fields": [
            {
              name: 9,
              layout: {
                "range.offset": "0x0000000000000000000000000000000000000000000000000000000000000000",
                "range.len": 1,
                "range.elem_type": 3,
              },
            },
          ],
        },
      },
    ],
  },
  contract: {
    name: 2,
    constructors: [
      {
        name: 14,
        selector: '["0x5E","0xBD","0x88","0xD6"]',
        args: [
          {
            name: 15,
            type: {
              ty: 3,
              display_name: [16],
            },
          },
        ],
        docs: [],
      },
      {
        name: 17,
        selector: '["0x02","0x22","0xFF","0x18"]',
        args: [],
        docs: [],
      },
    ],
    messages: [
      {
        name: 18,
        selector: '["0xE7","0xD0","0x59","0x0F"]',
        mutates: true,
        args: [
          {
            name: 19,
            type: {
              ty: 3,
              display_name: [16],
            },
          },
        ],
        return_type: null,
        docs: [],
      },
      {
        name: 20,
        selector: '["0x25","0x44","0x4A","0xFE"]',
        mutates: false,
        args: [],
        return_type: {
          ty: 3,
          display_name: [16],
        },
        docs: [],
      },
    ],
    events: [],
    docs: [],
  },
};

export { PAPER_CONTRACT_CODE_HASH, PAPER_CONTRACT_ABI };
