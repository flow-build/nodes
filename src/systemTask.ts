import _ from 'lodash';
import { JSONSchemaType } from 'ajv';
import { ProcessStatus } from './utils/type';
import { ParameterizedNode, ParameterizedNodeSpec, Parameters } from "./parameterized";

export interface SystemTaskNodeSpec extends ParameterizedNodeSpec {
  next: string;
  category: string;
  parameters: SystemTaskNodeParameters
}

export interface SystemTaskNodeParameters extends Parameters {
  input: {}
}


export class SystemTaskNode extends ParameterizedNode {
  _spec: SystemTaskNodeSpec;

  static get schema(): JSONSchemaType<SystemTaskNodeSpec> {
    let mySchema = super.schema;
    mySchema.required.push('next', 'category');
    mySchema.properties.next = { type: "string" };
    mySchema.properties.category = { type: "string" };

    return mySchema;
  }

  validate(): [boolean, string] {
    return SystemTaskNode.validate(this._spec, SystemTaskNode.schema);
  }

  async _run(execution_data: any): Promise<[{}, ProcessStatus]> {
    return [execution_data, ProcessStatus.RUNNING];
  }
}
