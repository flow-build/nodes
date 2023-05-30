import { config } from 'dotenv';
import { NodeSDK } from '@opentelemetry/sdk-node';
import { getNodeAutoInstrumentations } from '@opentelemetry/auto-instrumentations-node';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import {
  BasicTracerProvider,
  SimpleSpanProcessor,
} from '@opentelemetry/sdk-trace-base';
import { OTLPTraceExporter } from '@opentelemetry/exporter-trace-otlp-grpc';
import { grpc } from '@grpc/grpc-js';
import { logger } from './logger';

config();

const openTelemetry = process.env.OTEL_ENABLED === 'true';

const metadata = new grpc.Metadata();
const collectorOptions: any = {};

if (openTelemetry) {
  if (process.env.NEW_RELIC_ENABLED === 'true') {
    logger.info('Enabling New Relic');
    metadata.set('api-key', process.env.NEW_RELIC_API_KEY);
    collectorOptions.metadata = metadata;
    collectorOptions.credentials = grpc.credentials.createSsl();
  }
  // http://localhost:4317 is the default value for the otlp grpc package'
  collectorOptions.url =
    process.env.OTEL_COLLECTOR_URL || 'http://localhost:4317';
}

const exporter = new OTLPTraceExporter(collectorOptions);

const provider = new BasicTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: process.env.OTEL_SERVICE_NAME,
  }),
});
provider.addSpanProcessor(new SimpleSpanProcessor(exporter));

const sdk = new NodeSDK({
  traceExporter: exporter,
  instrumentations: [getNodeAutoInstrumentations()],
  serviceName: 'flowbuild-local',
});

if (openTelemetry) {
  sdk.start().then(() => {
    logger.info('Open Telemetry Started');
    logger.info(`Service Name: ${process.env.OTEL_SERVICE_NAME}`);
  });

  provider.register();
  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    logger.info(`Open Telemetry Provider ${signal}`);
    process.on(signal, () => provider.shutdown().catch(console.error));
  });
} else {
  logger.info('Open Telemetry Disabled');
}
