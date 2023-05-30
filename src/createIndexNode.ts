import { SystemTaskNode, ProcessStatus, utils } from '@flowbuild/engine';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { Index } from '@flowbuild/indexer';
import { logger } from './utils/logger';
import { db } from './utils/db';

class CreateIndexNode extends SystemTaskNode {
  [x: string]: any;
  static schema = {
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
            required: ['entity_type', 'entity_id'],
            properties: {
              entity_type: {
                oneOf: [{ type: 'string' }, { type: 'object' }],
              },
              entity_id: {
                oneOf: [{ type: 'string' }, { type: 'object' }],
              },
            },
          },
        },
      },
    },
  };

  static validate(spec) {
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    const validate = ajv.compile(CreateIndexNode.schema);
    const validation = validate(spec);
    return [validation, JSON.stringify(validate.errors)];
  }

  validate() {
    return CreateIndexNode.validate(this._spec);
  }

  _preProcessing({ bag, input, actor_data, environment, parameters }) {
    return utils.prepare(this._spec.parameters.input, {
      bag: bag,
      result: input,
      actor_data,
      environment,
      parameters,
    });
  }

  async run({
    bag = {},
    input = {},
    actor_data = {},
    environment = {},
    process_id = null,
    parameters = {},
  }) {
    const hrt_run_start = process.hrtime();
    try {
      logger.debug('[Indexer] createIndex Node');
      const executionData = this._preProcessing({
        bag,
        input,
        actor_data,
        environment,
        parameters,
      });
      const indexObj = {
        entity_type: executionData.entity_type,
        entity_id: executionData.entity_id,
        process_id,
      };
      const _idx = new Index(db);
      const result = await _idx.createIndex(indexObj);

      const hrt_run_interval = process.hrtime(hrt_run_start);
      const time_elapsed = Math.ceil(
        hrt_run_interval[0] * 1000 + hrt_run_interval[1] / 1000000,
      );

      return {
        node_id: this.id,
        bag: bag,
        external_input: null,
        result: result,
        error: null,
        status: ProcessStatus.RUNNING,
        next_node_id: this.next(executionData),
        time_elapsed: time_elapsed,
      };
    } catch (err) {
      logger.error('Indexer failed', err);
      return this._processError(err, { bag });
    }
  }
}

export default CreateIndexNode;
