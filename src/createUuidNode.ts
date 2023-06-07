import { JSONSchemaType } from 'ajv';
import { logger } from './utils/logger';
import { nanoid } from 'nanoid';
import { v1 as uuidv1, v4 as uuidv4 } from 'uuid';
import { SystemTaskNode, SystemTaskNodeSpec, SystemTaskNodeParameters } from './systemTask';
import { ProcessStatus } from './utils/type';

export interface CreateUuidNodeSpec extends SystemTaskNodeSpec {
  parameters: CreateUuidNodeParameters
}

type CreateUuidNodeParameters = {
  input: CreateUuidNodeInput
}

type CreateUuidNodeInput = {
  type: string
  options: OptionSchema
}

type OptionSchema = {
  version: string | {},
  size: number | {}
}

type ExecutionData = {
  type: string,
  options: CreateUuidOptions
}

type CreateUuidOptions = {
  version: string,
  size: number
}

type Result = {
  id: string
}

export class CreateUuidNode extends SystemTaskNode {
  static get schema(): JSONSchemaType<CreateUuidNodeSpec> {
    let mySchema = super.schema;
    mySchema.properties.parameters = {
      type: 'object',
      properties: {
        input: {
          type: 'object',
          required: ['type'],
          properties: {
            type: { type: 'string', enum: ['uuid', 'nanoid'] },
            options: {
              type: 'object',
              properties: {
                version: { type: 'string', enum: ['v1', 'v4'] },
                size: {
                  oneOf: [{ type: 'integer' }, { type: 'object' }],
                },
              },
            },
          },
        },
      },
    }
    return mySchema;
  }

  validate(): [boolean, string] {
    return CreateUuidNode.validate(this._spec, CreateUuidNode.schema);
  }

  async _run(executionData: ExecutionData): Promise<[Result, ProcessStatus]> {
    const result: Result = { id: '' };

    try {
      switch (executionData.type) {
        case 'v1':
        default:
          result.id = uuidv1();
          break;
        case 'v4':
          result.id = uuidv4();
          break;
        case 'nanoid':
          if (executionData.options?.size) {
            result.id = nanoid(executionData.options.size);
          } else {
            result.id = nanoid();
          }
      }
    } catch (error) {
      logger.error(`ERROR AT NID [${this.id}] | CREATE UUID | unexpected error`);
      logger.error(JSON.stringify(error));
      return [result, ProcessStatus.ERROR];
    }
    return [result, ProcessStatus.RUNNING];
  }
}
