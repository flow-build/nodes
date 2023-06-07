import _ from 'lodash';
import { JSONSchemaType } from 'ajv';
import { utils } from "@flowbuild/engine";
import { Node, NodeSpec } from "./node";

export interface ParameterizedNodeSpec extends NodeSpec {
  parameters: Parameters;
}

export type Parameters = {
  input: {}
}

type ProcessContext = {
  bag: {};
  input: {};
  actor_data: {};
  environment: {};
  parameters: Parameters;
}

export class ParameterizedNode extends Node {
  _spec: ParameterizedNodeSpec;

  static get schema(): JSONSchemaType<ParameterizedNodeSpec> {
    let parameterizedSchema = super.schema;
    parameterizedSchema.properties.parameters.type = {
      type: "object",
      required: ["input"],
      properties: {
        input: { type: "object" },
      },
    };
    return parameterizedSchema
  }

  validate(): [boolean, string] {
    return ParameterizedNode.validate(this._spec, ParameterizedNode.schema);
  }

  _preProcessing({ bag, input, actor_data, environment, parameters = { input: {} } }: ProcessContext) {
    return utils.prepare(this._spec.parameters.input, {
      bag,
      result: input,
      actor_data,
      environment,
      parameters,
    });
  }
}