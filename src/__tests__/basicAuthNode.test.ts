import BasicAuthNode from "../basicAuthNode";

const nodeSchema = {
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

beforeAll(async () => {});

describe("schema validation", () => {
  test("should accept a correct node schema", async () => {
    const myNode = new BasicAuthNode(nodeSchema);
    const [validation, errors] = myNode.validate();
    expect(validation).toBeTruthy();
    expect(errors).toBe("null");
  });

  test("should accept $ref", async () => {
    const refSchema = {
      id: "1",
      name: "rightSchema",
      next: "2",
      lane_id: "any",
      type: "systemTask",
      category: "basicAuth",
      parameters: {
        input: {},
        request: {
          baseUrl: { $ref: "bag.base" },
          verb: "GET",
          route: { $ref: "bag.route" },
          auth: {
            username: { $ref: "bag.test" },
            password: { $ref: "bag.password" },
          }
        }
      },
    };

    const myNode = new BasicAuthNode(refSchema);
    const [validation, errors] = myNode.validate();
    expect(validation).toBeTruthy();
    expect(errors).toBe("null");
  });

  test("should require username", async () => {
    const schema = nodeSchema;
    schema.parameters.request.auth.username = null;

    const node = new BasicAuthNode(schema);
    const [validation, errors] = node.validate();
    expect(validation).toBeFalsy();
    expect(errors).toBeDefined();
  });

  test("should require password", async () => {
    const schema = nodeSchema;
    schema.parameters.request.auth.password = null;

    const node = new BasicAuthNode(schema);
    const [validation, errors] = node.validate();
    expect(validation).toBeFalsy();
    expect(errors).toBeDefined();
  });

  test("should require auth", async () => {
    const schema = nodeSchema;
    delete schema.parameters.request.auth;

    const node = new BasicAuthNode(schema);
    const [validation, errors] = node.validate();
    expect(validation).toBeFalsy();
    expect(errors).toBeDefined();
  });

  test("should require baseUrl", async () => {
    const schema = nodeSchema;
    delete schema.parameters.request.baseUrl;

    const node = new BasicAuthNode(schema);
    const [validation, errors] = node.validate();
    expect(validation).toBeFalsy();
    expect(errors).toBeDefined();
  });

  test("should require verb", async () => {
    const schema = nodeSchema;
    delete schema.parameters.request.verb;

    const node = new BasicAuthNode(schema);
    const [validation, errors] = node.validate();
    expect(validation).toBeFalsy();
    expect(errors).toBeDefined();
  });

  test("should require route", async () => {
    const schema = nodeSchema;
    delete schema.parameters.request.route;

    const node = new BasicAuthNode(schema);
    const [validation, errors] = node.validate();
    expect(validation).toBeFalsy();
    expect(errors).toBeDefined();
  });

  describe("run node", () => {
    const nodeExample = {
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
  
    test("should work", async () => {
      const myNode = new BasicAuthNode(nodeExample);
      const nodeResult = await myNode.run({});
      expect(nodeResult.status).toBe("running");
      expect(nodeResult.result.data).toBeDefined();
      expect(nodeResult.result.data.status).toBe(200);
    });

    test("should return error", async () => {
      nodeExample.parameters.request.baseUrl = "https://postman-echo.com/status/400";
      const myNode = new BasicAuthNode(nodeExample);
      const nodeResult = await myNode.run({});
      console.log('nodeResult', nodeResult)
      expect(nodeResult.error).toBeDefined();
      expect(nodeResult.error).toBe('AxiosError: Request failed with status code 400');
    });
    
  });
  
});