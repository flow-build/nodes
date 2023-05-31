import addSystemTaskCategory from '@flowbuild/engine';
import BasicAuthNode from './basicAuthNode';
import DeepCompareNode from './deepCompareNode';
import createIndexNode from './createIndexNode';
import createUuidNode from './createUuidNode';
import filterDataNode from './filterDataNode';
import KafkaPublishNode from './kafkaPublishNode';
import remapDataNode from './remapDataNode';
import retrieveProcessNode from './retrieveProcessNode';
import tokenizeNode from './tokenizeNode';
import { logger } from './utils/logger';
import validateSchemaNode from './validateSchemaNode';

const setCustomNodes = () => {
  addSystemTaskCategory({ createIndex: createIndexNode });
  logger.info('added createIndexNode');
  addSystemTaskCategory({ findProcess: retrieveProcessNode });
  logger.info('added retrieveProcessNode');
  addSystemTaskCategory({ tokenize: tokenizeNode });
  logger.info('added tokenizeNode');
  addSystemTaskCategory({ validateSchema: validateSchemaNode });
  logger.info('added validateSchemaNode');
  addSystemTaskCategory({ createUuid: createUuidNode });
  logger.info('added createUuidNode');
  addSystemTaskCategory({ basicAuth: BasicAuthNode });
  logger.info('added basicAuthNode');
  addSystemTaskCategory({ remapData: remapDataNode });
  logger.info('added remapDataNode');
  addSystemTaskCategory({ filterData: filterDataNode });
  logger.info('added filterDataNode');
  addSystemTaskCategory({ deepCompare: DeepCompareNode });
  logger.info('added deepCompareNode');
  if (process.env.KAFKA) {
    addSystemTaskCategory({ kafkaPublish: KafkaPublishNode });
    logger.info('added kafkaPublishNode');
  }
};

module.exports.setCustomNodes = setCustomNodes;
