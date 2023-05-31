import { config } from 'dotenv';
import knex, { Knex } from 'knex';
import knexConfig, { KnexConfig } from '../../knexfile';

config();

const _config: KnexConfig = knexConfig[process.env.KNEX_ENV || 'test'];

export const dbConfig: KnexConfig = _config;
export const db: Knex = knex(_config);
