import { Nodes, ProcessStatus } from '@flowbuild/engine';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { logger } from './utils/logger';
import { nanoid } from 'nanoid';
import { v1 as uuidv1, v4 as uuidv4 } from 'uuid';

class CreateUuidNode extends Nodes.SystemTaskNode {
  static get schema() {
    return {
      type: 'object',
      required: ['id', 'name', 'next', 'type', 'lane_id', 'parameters'],
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        next: { type: 'string' },
        type: { type: 'string' },
        category: { type: 'string' },
        lane_id: { type: 'string' },
        parameters: {
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
        },
      },
    };
  }

  static validate(spec) {
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    const validate = ajv.compile(CreateUuidNode.schema);
    const validation = validate(spec);
    return [validation, JSON.stringify(validate.errors)];
  }

  validate() {
    return CreateUuidNode.validate(this._spec);
  }

  async _run(executionData) {
    const result: any = {};

    function getVersion(uVersion: string) {
      if (!uVersion) {
        return uuidv1();
      }

      const version: { [key: string]: () => string } = {
        v1: () => uuidv1(),
        v4: () => uuidv4(),
      };

      return version[uVersion]?.() || uuidv1();
    }

    try {
      if (executionData.type === 'nanoid') {
        if (executionData.options?.size) {
          result.id = nanoid(executionData.options.size);
        } else {
          result.id = nanoid();
        }
      } else {
        result.id = getVersion(executionData.options?.version);
      }
    } catch (error) {
      logger.error(
        'NODE.ERROR',
        `ERROR AT NID [${this.id}] | CREATE UUID | unexpected error`,
        {
          node_id: this.id,
          error: error,
        },
      );
      throw new Error(error);
    }
    console.log('chegou aqui lib nodes create uuid node');
    return [result, ProcessStatus.RUNNING];
  }
}

export default CreateUuidNode;
