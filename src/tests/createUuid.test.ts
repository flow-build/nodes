import { CreateUuidNode } from "../createUuidNode";
import { createUuidNodeExample } from '../examples/nodes';
import * as _ from 'lodash';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';

const myExample = _.cloneDeep(createUuidNodeExample);

describe("schema validation", () => {
  test("should accept a correct node schema", async () => {
    const myNode = new CreateUuidNode(myExample);
    const [validation, errors] = myNode.validate();
    expect(validation).toBeTruthy();
    expect(errors).toBe("null");
  });

  test("shouldn't accept $ref", async () => {
    let mySpec = _.cloneDeep(createUuidNodeExample);
    mySpec.parameters.input.type = { $ref: "bag.type" };
    const myNode = new CreateUuidNode(mySpec);
    const [validation, errors] = myNode.validate();
    expect(validation).toBeFalsy();
    expect(errors).toBeDefined();
  });

  test("should require type", async () => {
    let mySpec = _.cloneDeep(createUuidNodeExample);
    delete mySpec.parameters.input.type;
    const node = new CreateUuidNode(mySpec);
    const [validation, errors] = node.validate();
    expect(validation).toBeFalsy();
    expect(errors).toBeDefined();
  });

  describe("run node", () => {
    test("should return a v1 uuid", async () => {
      let testExample = _.cloneDeep(createUuidNodeExample);
      testExample.parameters.input.type = "v1";
      const myNode = new CreateUuidNode(testExample);
      const nodeResult = await myNode.run({});
      expect(nodeResult.status).toBe("running");
      expect(nodeResult.result.id).toBeDefined();
      expect(uuidValidate(nodeResult.result.id)).toBeTruthy();
      expect(uuidVersion(nodeResult.result.id)).toBe(1);
    });

    test("should return a v4 uuid", async () => {
      let testExample = _.cloneDeep(createUuidNodeExample);
      testExample.parameters.input.type = "v4";
      const myNode = new CreateUuidNode(testExample);
      const nodeResult = await myNode.run({});
      expect(nodeResult.status).toBe("running");
      expect(nodeResult.result.id).toBeDefined();
      expect(uuidValidate(nodeResult.result.id)).toBeTruthy();
      expect(uuidVersion(nodeResult.result.id)).toBe(4);
    });

    test("should return nanoid", async () => {
      let testExample = _.cloneDeep(createUuidNodeExample);
      testExample.parameters.input.type = "nanoid";
      const myNode = new CreateUuidNode(testExample);
      const nodeResult = await myNode.run({});
      expect(nodeResult.status).toBe("running");
      expect(nodeResult.result.id).toBeDefined();
      expect(nodeResult.result.id.length).toBe(21);
    });

    test("nanoid size should work", async () => {
      let testExample = _.cloneDeep(createUuidNodeExample);
      testExample.parameters.input.type = "nanoid";
      testExample.parameters.input.options = { size: 8 };
      const myNode = new CreateUuidNode(testExample);
      const nodeResult = await myNode.run({});
      expect(nodeResult.status).toBe("running");
      expect(nodeResult.result.id).toBeDefined();
      expect(nodeResult.result.id.length).toBe(8);
    });

    test("should return a v1 uuid for an random type", async () => {
      let testExample = _.cloneDeep(createUuidNodeExample);
      testExample.parameters.input.type = "anything";
      const myNode = new CreateUuidNode(testExample);
      const nodeResult = await myNode.run({});
      expect(nodeResult.status).toBe("running");
      expect(nodeResult.result.id).toBeDefined();
      expect(uuidValidate(nodeResult.result.id)).toBeTruthy();
      expect(uuidVersion(nodeResult.result.id)).toBe(1);
    });
  });
});