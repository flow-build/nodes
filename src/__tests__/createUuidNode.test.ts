import CreateUuidNode from "../createUuidNode";

const nodeSchema = {
  id: "1",
  name: "index process",
  next: "2",
  type: "SystemTask",
  category: "createUuid",
  lane_id: "1",
  parameters: {
    input: {
      type: "uuid",
    }
  }
};

beforeAll(async () => {});

describe("schema validation", () => {
  test("should accept a correct node schema", async () => {
    const myNode = new CreateUuidNode(nodeSchema);
    const [validation, errors] = myNode.validate();
    expect(validation).toBeTruthy();
    expect(errors).toBe("null");
  });
  
  test("shouldn't accept $ref", async () => {
    const refSchema = {
      id: "1",
      name: "rightSchema",
      next: "2",
      lane_id: "any",
      type: "systemTask",
      category: "createUuid",
      parameters: {
        input: {
          type: { $ref: "bag.type" },
        },
      },
    };

    const myNode = new CreateUuidNode(refSchema);
    const [validation, errors] = myNode.validate();
    expect(validation).toBeFalsy();
    expect(errors).toBeDefined();
  });

  test("should require type", async () => {
    const schema = nodeSchema;
    delete schema.parameters.input.type;

    const node = new CreateUuidNode(schema);
    const [validation, errors] = node.validate();
    expect(validation).toBeFalsy();
    expect(errors).toBeDefined();
  });

  describe("run node", () => {
    const nodeExample = {
      id: "1",
      name: "index process",
      next: "2",
      type: "SystemTask",
      category: "createUuid",
      lane_id: "1",
      parameters: {
        input: {
          type: "uuid",
        }
      }
    };
  
    test("should return uuid", async () => {
      const myNode = new CreateUuidNode(nodeExample);
      const nodeResult = await myNode.run({});
      expect(nodeResult.status).toBe("running");
      expect(nodeResult.result.id).toBeDefined();
      expect(nodeResult.result.id.length).toBe(36);
    });

    test("should return nanoid", async () => {
      nodeExample.parameters.input.type = "nanoid";
      const myNode = new CreateUuidNode(nodeExample);
      const nodeResult = await myNode.run({});
      expect(nodeResult.status).toBe("running");
      expect(nodeResult.result.id).toBeDefined();
      expect(nodeResult.result.id.length).toBe(21);
    });
  });
});