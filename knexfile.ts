import { config as dotenvConfig } from 'dotenv';
import * as path from 'path';

dotenvConfig();
const BASE_PATH = path.join(__dirname, 'db');

interface ConnectionConfig {
  host: string;
  port?: number | string;
  user: string;
  password: string;
  database: string;
  ssl?: { rejectUnauthorized: boolean };
}

export interface KnexConfig {
  client: string;
  connection: ConnectionConfig;
  migrations: {
    directory: string;
  };
  seeds: {
    directory: string;
  };
  pool?: {
    min: number;
    max: number;
    acquireTimeoutMillis: number;
    idleTimeoutMillis: number;
  };
}

const config: Record<string, KnexConfig> = {
  test: {
    client: 'pg',
    connection: {
      host: process.env.POSTGRES_HOST || '0.0.0.0',
      port: process.env.POSTGRES_PORT || '5432',
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DATABASE || 'workflow',
    },
    migrations: {
      directory: path.join(BASE_PATH, 'migrations'),
    },
    seeds: {
      directory: path.join(BASE_PATH, 'seeds'),
    },
  },
  docker: {
    client: 'pg',
    connection: {
      host: 'flowbuild_db',
      user: 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: 'workflow',
    },
    migrations: {
      directory: path.join(BASE_PATH, 'migrations'),
    },
    seeds: {
      directory: path.join(BASE_PATH, 'seeds'),
    },
  },
  dockerLocal: {
    client: 'pg',
    connection: {
      host: 'localhost',
      user: 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: 'workflow',
      port: 5432,
    },
    pool: {
      min: 0,
      max: 40,
      acquireTimeoutMillis: 60000,
      idleTimeoutMillis: 600000,
    },
    migrations: {
      directory: path.join(BASE_PATH, 'migrations'),
    },
    seeds: {
      directory: path.join(BASE_PATH, 'seeds'),
    },
  },
  prod: {
    client: 'pg',
    connection: {
      host: process.env.POSTGRES_HOST || 'localhost',
      port: process.env.POSTGRES_PORT,
      user: process.env.POSTGRES_USER || 'postgres',
      password: process.env.POSTGRES_PASSWORD || 'postgres',
      database: process.env.POSTGRES_DATABASE || 'workflow',
      ssl: { rejectUnauthorized: false },
    },
    migrations: {
      directory: path.join(BASE_PATH, 'migrations'),
    },
    seeds: {
      directory: path.join(BASE_PATH, 'seeds'),
    },
  },
};

export default config;
