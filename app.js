import dotenv from 'dotenv';
import express from 'express';
import Database  from './dbconfig/database';
import Logger from './lib/logger'
import cors from 'cors';
import bodyParser from 'body-parser';
import routes from './api/routes';

dotenv.config();

const logger = new Logger(__filename);

const database = new Database();
database.connectToDb();

const app = express();

app.use(bodyParser.json({ limit: '150mb', extended: true }));
app.use(bodyParser.urlencoded({ limit: '150mb', extended: true }));

/* Development mode */
// console.log('Setting up DEVELOPMENT CORS');
app.use(cors());

app.options('*', cors());

app.use('/', routes);

app.listen(process.env.PORT, () => {
    logger.info(`server started on port ${process.env.PORT} (${process.env.NODE_ENV})`);
});