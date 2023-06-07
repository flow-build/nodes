import { config } from 'dotenv';
import { createLogger, format, transports } from 'winston';

config();

const logger = createLogger({
  level: process.env.KOA_LOG_LEVEL || 'info',
  format: format.combine(
    format.colorize(),
    format.timestamp(),
    format.label({ label: 'NODES', message: true }),
    format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`),
  ),
  transports: [new transports.Console()],
  exceptionHandlers: [
    new transports.Console({
      format: format.errors(),
    }),
  ],
  rejectionHandlers: [new transports.Console()],
});

export { logger };
