import { ProcessStatus, Nodes } from '@flowbuild/engine';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { logger } from './utils/logger';
import { get } from 'lodash';

class RemapDataNode extends Nodes.SystemTaskNode {
  [x: string]: any;
  constructor(schema: any) {
    super(schema);
  }
  static get schema() {
    return {
      type: 'object',
      properties: {
        id: { type: 'string' },
        name: { type: 'string' },
        next: { type: 'string' },
        type: { type: 'string' },
        category: { type: 'string' },
        lane_id: { type: 'string' },
        parameters: {
          type: 'object',
          required: ['input'],
          properties: {
            input: {
              type: 'object',
              required: ['data', 'dictionary'],
              properties: {
                data: {
                  oneOf: [
                    {
                      type: 'array',
                      items: { type: 'object' },
                    },
                    {
                      type: 'object',
                    },
                  ],
                },
                dictionary: {
                  type: 'object',
                },
              },
            },
          },
        },
      },
      required: ['id', 'name', 'next', 'type', 'lane_id', 'parameters'],
    };
  }

  static validate(spec: any, schema: any = null) {
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    const validationSchema = schema || RemapDataNode.schema;
    const validate = ajv.compile(validationSchema);
    const validation = validate(spec);
    return [validation, JSON.stringify(validate.errors)];
  }

  validate() {
    return RemapDataNode.validate(this._spec);
  }

  static validateExecutionData(spec: any) {
    const schema = {
      type: 'object',
      required: ['data', 'dictionary'],
      properties: {
        data: { type: 'array', items: { type: 'object' } },
        dictionary: { type: 'object' },
      },
    };
    return RemapDataNode.validate(spec, schema);
  }

  static remapData(data: any[], dictionary: any) {
    let messages: string[] = [];
    const remapped_data = data.map((item: any) => {
      const remapped_item: any = {};
      for (const [key, value] of Object.entries(dictionary)) {
        if (typeof value === 'object') {
          const nested_remapped_data = RemapDataNode.remapData(
            [item],
            dictionary[key],
          );
          remapped_item[key] = nested_remapped_data.remapped_data[0];
          messages = messages.concat(nested_remapped_data.messages);
        } else if (
          typeof value === 'string' &&
          value.length > 0 &&
          value.includes('.')
        ) {
          const object_value = get(item, value);
          if (object_value !== undefined) {
            remapped_item[key] = object_value;
          }
        } else if (
          value !== null &&
          typeof value === 'string' &&
          value.length > 0 &&
          item[value] !== undefined
        ) {
          remapped_item[key] = item[value];
        } else if (value === null || value === '') {
          remapped_item[key] = value;
        }

        if (remapped_item[key] === undefined) {
          messages.push(`'${value}' from dictionary not found in data`);
        }
      }
      return remapped_item;
    });
    return {
      remapped_data,
      messages,
    };
  }

  async _run(executionData: any) {
    try {
      logger.debug('remapData Node running');
      const [is_valid, validation_errors]: any =
        RemapDataNode.validateExecutionData(executionData);
      if (!is_valid) {
        const errors = JSON.parse(validation_errors).map(
          (err: any) => `field '${err.instancePath}' ${err.message}`,
        );
        throw JSON.stringify(errors);
      }
      const { data, dictionary } = executionData;
      let status = 'success';

      let { remapped_data } = RemapDataNode.remapData(data, dictionary);
      const { messages } = RemapDataNode.remapData(data, dictionary);

      if (messages.length > 0) {
        if (Object.keys(remapped_data[0]).length > 0) {
          status = 'warning';
        } else {
          status = 'error';
          remapped_data = [];
        }
      }
      return [
        {
          status,
          messages,
          data: remapped_data,
        },
        ProcessStatus.RUNNING,
      ];
    } catch (err) {
      logger.error('remapData Node failed', err);
      throw new Error(err);
    }
  }
}

export default RemapDataNode;
