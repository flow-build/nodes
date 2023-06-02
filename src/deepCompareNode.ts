import { ProcessStatus, Nodes } from '@flowbuild/engine';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import { logger } from './utils/logger';
import { omit, isEqual, pick, uniqWith, filter, reject } from 'lodash';

class DeepCompareNode extends Nodes.SystemTaskNode {
  constructor(schema: any) {
    super(schema);
  }
  static get schema() {
    return {
      type: 'object',
      required: [
        'id',
        'name',
        'next',
        'type',
        'category',
        'lane_id',
        'parameters',
      ],
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
              required: ['base', 'candidate', 'commonKeys'],
              properties: {
                base: {
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
                candidate: {
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
                commonKeys: {
                  oneOf: [
                    {
                      type: 'array',
                      items: { type: 'string' },
                    },
                    {
                      type: 'object',
                    },
                  ],
                },
                ignoreKeys: {
                  oneOf: [
                    {
                      type: 'array',
                      items: { type: 'string' },
                    },
                    {
                      type: 'object',
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

  static validate(data: any, schema = null) {
    const ajv = new Ajv({ allErrors: true });
    addFormats(ajv);
    const validationSchema = schema || DeepCompareNode.schema;
    const validate = ajv.compile(validationSchema);
    const validation = validate(data);
    return [validation, JSON.stringify(validate.errors)];
  }

  validate() {
    return DeepCompareNode.validate(this._spec);
  }

  static validateExecutionData(data: any) {
    const schema = {
      type: 'object',
      required: ['base', 'candidate', 'commonKeys'],
      properties: {
        base: {
          type: 'array',
          items: { type: 'object' },
        },
        candidate: {
          type: 'array',
          items: { type: 'object' },
        },
        commonKeys: {
          type: 'array',
          items: { type: 'string' },
          minItems: 1,
        },
        ignoreKeys: {
          type: 'array',
          items: { type: 'string' },
        },
      },
    };
    return DeepCompareNode.validate(data, schema);
  }

  static clean(data: any[], keys: any, ignore = []) {
    logger.silly('Called DeepCompareNode clean');
    logger.silly(`[DeepCompareNode] data: ${JSON.stringify(data)}`);
    const withoutIgnore = data.map((item) => omit(item, ignore));
    logger.silly(
      `[DeepCompareNode] withoutIgnore: ${JSON.stringify(withoutIgnore)}`,
    );
    const cleanData = uniqWith(withoutIgnore, isEqual);
    logger.silly(`[DeepCompareNode] cleanData: ${JSON.stringify(cleanData)}`);
    const keysOnly = cleanData.map((item) => pick(item, keys));
    logger.silly(`[DeepCompareNode] keysOnly: ${JSON.stringify(keysOnly)}`);
    const keySet = uniqWith(keysOnly, isEqual);
    logger.silly(`[DeepCompareNode] keySet: ${JSON.stringify(keySet)}`);
    if (keySet.length < keysOnly.length) {
      return { duplicates: true };
    } else {
      return cleanData;
    }
  }

  async _run(executionData: any) {
    try {
      logger.debug('DeepCompare Node running');
      logger.silly(
        `[DeepCompare] executionData: ${JSON.stringify(executionData)}`,
      );
      const [is_valid, validation_errors]: any =
        DeepCompareNode.validateExecutionData(executionData);
      if (!is_valid) {
        const errors = JSON.parse(validation_errors).map(
          (err: any) => `field '${err.instancePath}' ${err.message}`,
        );
        return [
          {
            status: 'error',
            message: errors,
            data: [],
          },
          ProcessStatus.RUNNING,
        ];
      }
      logger.silly('[DeepCompare] Cleaning base');
      const base: any = DeepCompareNode.clean(
        executionData.base,
        executionData.commonKeys,
        executionData.ignoreKeys,
      );
      if (base.duplicates) {
        return [
          {
            status: 'error',
            message: 'conflict at base',
            data: [],
          },
          ProcessStatus.RUNNING,
        ];
      }
      logger.silly(`[DeepCompare] cleanBase: ${JSON.stringify(base)}`);

      logger.silly('Cleaning candidate');
      const candidate: any = DeepCompareNode.clean(
        executionData.candidate,
        executionData.commonKeys,
        executionData.ignoreKeys,
      );
      if (candidate.duplicates) {
        return [
          {
            status: 'error',
            message: 'conflict at candidate',
            data: [],
          },
          ProcessStatus.RUNNING,
        ];
      }

      logger.silly(
        `[DeepCompare] cleanCandidate: ${JSON.stringify(candidate)}`,
      );

      const result = {
        onlyAtCandidate: [],
        onlyAtBase: [],
        unchanged: [],
        changed: [],
      };

      let candidateList = candidate;
      for (const baseItem of base) {
        logger.silly(`[DeepCompare] baseItem: ${JSON.stringify(baseItem)}`);
        const keys = pick(baseItem, executionData.commonKeys);
        logger.silly(`[DeepCompare] keys: ${JSON.stringify(keys)}`);
        const matchingCandidate = filter(candidate, keys);
        logger.silly(
          `[DeepCompare] matchingCandidate: ${JSON.stringify(
            matchingCandidate,
          )}`,
        );
        if (matchingCandidate.length > 0) {
          if (isEqual(baseItem, matchingCandidate[0])) {
            logger.silly(`[DeepCompare] baseItem = UNCHANGED`);
            result.unchanged.push(keys);
          } else {
            logger.silly(`[DeepCompare] baseItem = CHANGED`);
            result.changed.push(keys);
          }
          candidateList = reject(candidateList, keys);
          logger.silly(
            `[DeepCompare] remaining candidates: ${JSON.stringify(
              candidateList,
            )}`,
          );
        } else {
          logger.silly(`[DeepCompare] baseItem = ONLY AT BASE`);
          result.onlyAtBase.push(keys);
        }
      }

      result.onlyAtCandidate = candidateList.map((item: any) =>
        pick(item, executionData.commonKeys),
      );
      return [
        {
          data: result,
        },
        ProcessStatus.RUNNING,
      ];
    } catch (err) {
      logger.error('deepCompareNode Node failed', err);
      throw new Error(err);
    }
  }
}

export default DeepCompareNode;
