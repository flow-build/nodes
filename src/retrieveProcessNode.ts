import { ProcessStatus, Nodes } from '@flowbuild/engine';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { Index } from '@flowbuild/indexer';
import { logger } from './utils/logger';
import { db } from './utils/db';

class RetrieveProcessesNode extends Nodes.SystemTaskNode {
  [x: string]: any;
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
              required: ['entity_id'],
              properties: {
                entity_id: {
                  oneOf: [
                    { type: 'string', format: 'uuid' },
                    {
                      type: 'object',
                      properties: {
                        $ref: { type: 'string' },
                      },
                    },
                  ],
                },
              },
            },
          },
        },
      },
    };
  }

  static validate(spec: any) {
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    const validate = ajv.compile(RetrieveProcessesNode.schema);
    const validation = validate(spec);
    return [validation, JSON.stringify(validate.errors)];
  }

  validate() {
    return RetrieveProcessesNode.validate(this._spec);
  }

  async _run(executionData: any) {
    try {
      logger.debug('[Indexer] retrieveProcesses node');
      const _idx = new Index(db);
      const result = await _idx.fetchProcessByEntity(
        executionData.entity_id,
        executionData.limit,
      );
      return [{ data: result }, ProcessStatus.RUNNING];
    } catch (err) {
      logger.error('retrieveProcesses node failed', err);
      throw err;
    }
  }
}

export default RetrieveProcessesNode;
