export const minimal: any = {
  id: "ID",
  type: "type",
  name: "basic node",
  next: "NEXT",
  lane_id: "1",
  parameters: {},
};

export const invalidNamespace: unknown = {
  id: "2",
  type: "SystemTask",
  name: "System  Task Node",
  next: "3",
  lane_id: "1",
  parameters: {
    input: {
      key: { $ref: "invalid.node_data" },
    },
  },
};

export const basicAuth: any = {
  id: "1",
  name: "rightSchema",
  next: "2",
  lane_id: "any",
  type: "systemTask",
  category: "basicAuth",
  parameters: {
    input: {},
    request: {
      baseUrl: "https://postman-echo.com/status/200",
      verb: "GET",
      route: "",
      auth: {
        username: "test",
        password: "password"
      }
    },
  },
};

export const index: any = {
  id: "1",
  name: "index process",
  next: "2",
  type: "SystemTask",
  category: "createIndex",
  lane_id: "1",
  parameters: {
    input: {
      entity_type: "entity",
      entity_id: "id"
    }
  }
};

export const createUuidNodeExample: any = {
  id: "CREATE-UUID",
  name: "create uuid node",
  next: "END",
  type: "systemtask",
  category: "createuuid",
  lane_id: "1",
  parameters: {
    input: {
      type: "uuid",
    }
  }
}