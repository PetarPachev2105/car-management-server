import Router from 'express-promise-router';

import MaintenanceRoutes from './maintenance/maintenance.routes';
import GarageRoutes from './garage/garage.routes';
import CarRoutes from './car/car.routes';

import Logger from '../lib/Logger';

const logger = new Logger(__filename);

const router = Router();

/** Root endpoints * */
router.get('/status', (req, res) => res.send('OK'));

router.use('/maintenance', MaintenanceRoutes);
router.use('/garages', GarageRoutes);
router.use('/cars', CarRoutes);

/* Add our own error handler */
router.use((err, req, res, next) => {
    console.log(err);
    if (err.name === 'HyundaiAccentError') {
        /* A HyundaiAccentError was thrown. So just sent the status and message to the client as it's "safe" and won't leak information */
        logger.warn(`Express caught HyundaiAccentError => ${err.statusCode} => ${err.message} `);
        res.status(err.statusCode).send({ message: err.message });
    } else {
        /* For any other error - send a generic error to ensure that we don't leak information */
        logger.error(`Express caught unknown error => ${err} => ${err.message} `);
        logger.warn(`Express caught unknown error => ${err.statusCode} => ${err.message} => ${err.stack}`);
        res.status(500).send('Something went wrong');
    }
});

export default router;