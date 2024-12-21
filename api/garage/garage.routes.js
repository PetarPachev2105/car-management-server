import Router from 'express-promise-router';

import GarageController from './garage.controller';

const router = Router();

/** GETS */
router
    .route('/:garageId')
    .get(GarageController.getGarage)

router
    .route('/')
    .get(GarageController.searchGarages)

router
    .route('/dailyAvailabilityReport')
    .get(GarageController.dailyAvailabilityReport)

/** POST */
router
    .route('/')
    .post(GarageController.createGarage)

/** PUTS */
router
    .route('/:garageId')
    .put(GarageController.updateGarage)

/** DELETES */
router
    .route('/:garageId')
    .delete(GarageController.deleteGarage)

export default router;