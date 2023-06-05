import { v4 } from "uuid";
import CreateIndexNode from "../createIndexNode";

const nodeSchema = {
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

beforeAll(async () => {});

describe("schema validation", () => {
  test("should accept a correct node schema", async () => {
    const myNode = new CreateIndexNode(nodeSchema);
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
      category: "createIndex",
      parameters: {
        input: {
          entity_type: { $ref: "bag.type" },
          entity_id: { $ref: "bag.id" },
        },
      },
    };

    const myNode = new CreateIndexNode(refSchema);
    const [validation, errors] = myNode.validate();
    expect(validation).toBeTruthy();
    expect(errors).toBe("null");
  });

  test("should require type", async () => {
    const schema = nodeSchema;
    delete schema.parameters.input.entity_type;

    const node = new CreateIndexNode(schema);
    const [validation, errors] = node.validate();
    expect(validation).toBeFalsy();
    expect(errors).toBeDefined();
  });

  test("should require id", async () => {
    const schema = nodeSchema;
    delete schema.parameters.input.entity_id;

    const node = new CreateIndexNode(schema);
    const [validation, errors] = node.validate();
    expect(validation).toBeFalsy();
    expect(errors).toBeDefined();
  });

  describe("run node", () => {
    const nodeExample = {
      id: "1",
      name: "index process",
      next: "END",
      type: "SystemTask",
      category: "createIndex",
      lane_id: "1",
      parameters: {
        input: {
          entity_type: "type",
          entity_id: v4(),
        }
      }
    };
  
    test("should work", async () => {
      const myNode = new CreateIndexNode(nodeExample);
      const processId = v4();
      const nodeResult = await myNode.run({
        process_id: processId,
      });
      expect(nodeResult.status).toBe("running");
      expect(nodeResult.result.id).toBeDefined();
    });

    test("shouldn't return id", async () => {
      const myNode = new CreateIndexNode(nodeExample);
      const nodeResult = await myNode.run({});
      expect(nodeResult.status).toBe("running");
      expect(nodeResult.result.errorMessage[0].message).toBe("must be string");
      expect(nodeResult.result.errorType).toBeDefined();
    });
  });
});