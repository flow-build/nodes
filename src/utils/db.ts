import { config } from 'dotenv';
import knex from 'knex';
import knexConfig from '../../knexfile';

config();

const _config = knexConfig[process.env.KNEX_ENV || 'test'];

export const dbConfig = _config;
export const db = knex(_config);
