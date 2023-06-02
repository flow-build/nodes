import BasicAuthNode from "../basicAuthNode";

const nodeSchema = {
  id: "1",
  name: "rightSchema",
  next: "2",
  lane_id: "any",
  type: "systemTask",
  category: "basicAuth",
  parameters: {
    input: {
      request: {
        "baseUrl": "https://postman-echo.com/status/200",
        "verb": "GET",
        "route": "",
        "auth": {
          "username": "test",
          "password": "password"
        }
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
        input: {
          request: {
            "baseUrl": { $ref: "bag.base" },
            "verb":{ $ref: "bag.verb" },
            "route": { $ref: "bag.route" },
            "auth": {
              "username": { $ref: "bag.test" },
              "password": { $ref: "bag.password" },
            }
          }
        },
      },
    };

    const myNode = new BasicAuthNode(refSchema);
    const [validation, errors] = myNode.validate();
    expect(validation).toBeTruthy();
    expect(errors).toBe("null");
  });
});