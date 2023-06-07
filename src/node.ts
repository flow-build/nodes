/* eslint-disable indent */
/* eslint-disable no-unused-vars */
import _ from 'lodash';
import Ajv, { JSONSchemaType } from 'ajv';
import addFormats from 'ajv-formats';
import { ProcessStatus, ProcessState, NodeResult } from './utils/type';

export type NodeSpec = {
  id: string;
  name: string;
  type: string;
  lane_id: string;
  on_error?: string;
  extract?: string;
  parameters: {};
}

export class Node {
  _spec: NodeSpec;

  static get schema(): JSONSchemaType<NodeSpec> {
    return {
      type: "object",
      required: ["id", "name", "type", "lane_id", "parameters"],
      properties: {
        id: { type: "string" },
        name: { type: "string" },
        type: { type: "string" },
        lane_id: { type: "string" },
        on_error: { type: "string", enum: ["resumenext", "stop"], nullable: true },
        parameters: { type: "object" },
        extract: { type: "string", pattern: "^[a-zA-Z0-9_.]+$", nullable: true },
      },
    };
  }

  static validate(spec: any, schema: JSONSchemaType<any>): [boolean, string] {
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    const validate = ajv.compile(schema);
    const validation = validate(spec);
    return [validation, JSON.stringify(validate.errors)];
  }

  validate(): [boolean, string] {
    return Node.validate(this._spec, Node.schema);
  }

  constructor(node_spec: NodeSpec) {
    this._spec = node_spec;
  }

  get id(): string {
    return this._spec["id"];
  }

  next(result): string {
    return this._spec["next"];
  }

  async run({ bag = {}, input = {}, external_input = {}, actor_data = {}, environment = {}, parameters = { _extract: false } }): Promise<ProcessState> {
    const hrt_run_start = process.hrtime();
    try {
      const execution_data = this._preProcessing({ bag, input, actor_data, environment, parameters });
      const [result, status] = await this._run(execution_data);

      const hrt_run_interval = process.hrtime(hrt_run_start);
      const time_elapsed = Math.ceil(hrt_run_interval[0] * 1000 + hrt_run_interval[1] / 1000000);
      const node_extract = this._spec?.extract;

      return {
        node_id: this.id,
        bag: this._setBag(bag, result, parameters?._extract, node_extract),
        external_input: external_input,
        result: result,
        error: null,
        status: status,
        next_node_id: this.next(result),
        time_elapsed: time_elapsed,
      };
    } catch (err) {
      const hrt_run_interval = process.hrtime(hrt_run_start);
      const time_elapsed = Math.ceil(hrt_run_interval[0] * 1000 + hrt_run_interval[1] / 1000000);
      return this._processError(err, { bag, external_input, time_elapsed });
    }
  }

  // MUST RETURN [result, status]
  async _run(execution_data): Promise<[NodeResult, ProcessStatus]> {
    throw Error("Subclass and implement returning [result: {}, status: ProcessStatus]");
  }

  _preProcessing({ bag, input, actor_data, environment, parameters }) {
    return { ...bag, ...input, actor_data, environment, parameters };
  }

  _parseNodeId() {
    return this.id.toLowerCase().replaceAll("-", "_").replaceAll(" ", "_");
  }

  _mapResult(result) {
    return result;
  }

  _setBag(bag: any, result: any, _extract = false, node_extract = "") {
    const mapped_result = this._mapResult(result);
    if (node_extract?.length > 0) {
      _.set(bag, node_extract.toLowerCase(), mapped_result);
    } else if (_extract) {
      const bag_property = this._parseNodeId();
      _.set(bag, bag_property, mapped_result);
    }

    return bag;
  }

  _processError(error, { bag, external_input, time_elapsed }) {
    if (error instanceof Error) {
      console.log("NODE.ERROR", `ERROR AT NID [${this.id}]`, {
        node_id: this.id,
        error: error,
      });
      error = error.toString();
    }
    let on_error = this._spec.on_error;
    if (on_error && typeof on_error === "string") {
      on_error = on_error.toLowerCase();
    }

    let result;
    switch (on_error) {
      case "resumenext": {
        result = {
          node_id: this.id,
          bag: bag,
          external_input: external_input,
          result: {
            error: error,
            is_error: true,
          },
          error: null,
          status: ProcessStatus.RUNNING,
          next_node_id: this.id,
          time_elapsed,
        };
        break;
      }
      case "stop":
      default: {
        result = {
          node_id: this.id,
          bag: bag,
          external_input: external_input,
          result: null,
          error: error,
          status: ProcessStatus.ERROR,
          next_node_id: this.id,
          time_elapsed,
        };
        break;
      }
    }

    return result;
  }
}