import { config as dotenvConfig } from 'dotenv';
import { Kafka, Producer, RecordMetadata } from 'kafkajs';
import { logger } from './logger';

dotenvConfig();

const sasl: any = {
  mechanism: 'plain',
  username: process.env.KAFKA_CLUSTER_API_KEY,
  password: process.env.KAFKA_API_SECRET,
};

const ssl = !!sasl;

let client: Producer | undefined;

async function connect(): Promise<void> {
  try {
    logger.info('trying to connect to Kafka');
    const kafka = new Kafka({
      clientId: 'flowbuild',
      brokers: [process.env.KAFKA_BOOTSTRAP_SERVER || ''],
      ssl,
      sasl,
    });
    client = kafka.producer();
    await client.connect();
  } catch (error) {
    logger.error(error);
  }
}

async function publishMessage({
  topic,
  message,
  key,
}: {
  topic: string;
  message: object;
  key?: string;
}): Promise<RecordMetadata[]> {
  logger.info(`[kafka] publishing message to topic ${topic}`);
  if (!client) {
    logger.info('[kafka] No client');
    return [];
  }
  const messageBuf = Buffer.from(JSON.stringify(message));
  const result = await client.send({
    topic,
    messages: [
      {
        key,
        value: messageBuf,
        timestamp: JSON.stringify(Date.now()),
      },
    ],
  });
  return result;
}

function getClient(): Producer | undefined {
  return client;
}

async function disconnect(): Promise<void> {
  if (client) {
    await client.disconnect();
  }
}

export { getClient, publishMessage, connect, disconnect };
