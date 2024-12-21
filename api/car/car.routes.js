import Router from 'express-promise-router';

import CarController from './car.controller';

const router = Router();

/** GETS */
router
    .route('/:carId')
    .get(CarController.getCar)

router
    .route('/')
    .get(CarController.searchCars)

/** POST */
router
    .route('/')
    .post(CarController.createCar)

/** PUTS */
router
    .route('/:carId')
    .put(CarController.updateCar)

/** DELETES */
router
    .route('/:carId')
    .delete(CarController.deleteCar)

export default router;