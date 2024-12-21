import Knex from 'knex';
import { Model } from 'objection';
import knexConfig from './knexfile';
import Logger from '../lib/Logger';

const logger = new Logger(__filename);

export default class Database {
    constructor() {
        this.connection = null;
    }

    connectToDb() {
        let knex = Knex(knexConfig[process.env.NODE_ENV]);

        if (process.env.NODE_ENV && process.env.NODE_ENV === 'production') {
            logger.info('*** Setting up Knex with Production settings ***');
            knex = Knex(knexConfig.production);
        } else if (process.env.NODE_ENV && process.env.NODE_ENV === 'staging') {
            logger.info('*** Setting up Knex with Production (STAGING) settings ***');
            knex = Knex(knexConfig.development);
        } else if (process.env.NODE_ENV && process.env.NODE_ENV === 'development') {
            logger.info('*** Setting up Knex with DEV settings ***');
            knex = Knex(knexConfig.development);
        }

        Model.knex(knex);

        this.connection = knex;

        return knex;
    }

    hasConnection() {
        return !!this.connection;
    }
}