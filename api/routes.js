import Router from 'express-promise-router';

import MaintenanceRoutes from './maintenance/maintenance.routes';
import GarageRoutes from './garage/garage.routes';
import CarRoutes from './car/car.routes';

import Logger from '../lib/logger';

const logger = new Logger(__filename);

const router = Router();

/** Root endpoints * */
router.get('/status', (req, res) => res.send('OK'));

router.use('/maintenance', MaintenanceRoutes);
router.use('/garages', GarageRoutes);
router.use('/cars', CarRoutes);

/* Add our own error handler */
router.use((err, req, res, next) => {
    logger.error(`Express caught unknown error => ${err} => ${err.name} => ${err.message} `);
    logger.warn(`Express caught unknown error => ${err.statusCode} => ${err.message} => ${err.stack}`);
    res.status(500).send('Something went wrong');
});

export default router;