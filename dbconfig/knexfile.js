import dotenv from 'dotenv';

dotenv.config();

/** VERY IMPORTANT */
/** If you are here this probably means that you cannot migrate properly new table */
/** Lucky for you, I know the solution */
/** Go to package.json and add -> "type": "module", */
/** Remember to remove it after you are done */
/** You are welcome */

/**
 * @type { Object.<string, import("knex").Knex.Config> }
 */
export default {
    development: {
        client: 'pg',
        connection: {
            database: process.env.DB_NAME,
            user:     process.env.DB_USERNAME,
            password: `${process.env.DB_PASSWORD}`,
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    },
    production: {
        client: 'pg',
        connection: {
            database: process.env.DB_NAME,
            user:     process.env.DB_USERNAME,
            password: `${process.env.DB_PASSWORD}`,
        },
        pool: {
            min: 2,
            max: 10
        },
        migrations: {
            tableName: 'knex_migrations'
        }
    },
};