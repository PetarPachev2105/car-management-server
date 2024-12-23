import _ from 'lodash';
import asyncJS from 'async';

/* Main model */
import CarGarageEntry from './carGarageEntry.model';

/* Additional Helpers */
import IDHelper from '../../lib/IDHelper';

/* Our custom logger */
import Logger from '../../lib/Logger';

const logger = new Logger(__filename);

/**
 * Checks if car is in garage
 * @param carId
 * @param garageId
 * @returns {Promise<boolean>}
 */
async function isCarInGarage(carId, garageId) {
    logger.info(`isCarInGarage CALLED with ${carId} and ${garageId}`);

    const entry = await CarGarageEntry.query()
        .select('id')
        .where('car_id', carId)
        .andWhere('garage_id', garageId)
        .first()
        .limit(1);

    logger.verbose(`isCarInGarage RESULT: ${!!entry}`);

    return !!entry;
}

/**
 * Receives cars and filters them by the garage id.
 * @param cars
 * @param garageId
 * @returns {Promise<*[]>}
 */
async function filterCarsByGarage(cars, garageId) {
    logger.info(`filterCarsByGarage CALLED with ${cars.length} cars and ${garageId}`);

    const filteredCars = [];
    const chunksOfCars = _.chunk(cars, 20);

    await asyncJS.eachSeries(chunksOfCars, async (chunkOfCars, eachChunkCallback) => {
        logger.verbose(`filterCarsByGarage @eachChunkCallback PROCESSING ${chunkOfCars.length} cars`);

        const carEntries = await CarGarageEntry.query()
            .select('car_id')
            .where('car_id', 'in', chunkOfCars.map(car => car.id))
            .andWhere('garage_id', garageId);

        const carIdsInGarage = new Set();

        carEntries.forEach((carEntry) => {
           carIdsInGarage.add(carEntry.car_id);
        });

        chunkOfCars.forEach((car) => {
            if (carIdsInGarage.has(car.id)) {
                filteredCars.push(car);
            }
        });

        return eachChunkCallback(null);
    });

    return filteredCars;
}

/**
 * Gets all garages for a car
 * @param carId
 * @returns {Promise<*[]>}
 */
async function getCarGarages(carId) {
    logger.info(`getCarGarages CALLED with ${carId}`);

    const entries = await CarGarageEntry.query()
        .select('garage_id')
        .where('car_id', carId);

    return entries.map(entry => entry.garage_id);
}

/**
 * Gets all cars in garage
 * @param garageId
 * @returns {Promise<*[]>}
 */
async function getGarageCars(garageId) {
    logger.info(`getGarageCars CALLED with ${garageId}`);

    const entries = await CarGarageEntry.query()
        .select('car_id')
        .where('garage_id', garageId);

    return entries.map(entry => entry.car_id);
}

/**
 * Adds a car garage entry
 * @param carId
 * @param garageId
 * @returns {Promise<void>}
 */
async function addCarGarageEntry(carId, garageId) {
    logger.info(`addCarGarageEntry CALLED with ${carId} and ${garageId}`);

    await CarGarageEntry.query().insert({
        car_id: carId,
        garage_id: garageId,
    });
}

/**
 * Delete all garages for a car
 * @param carId
 * @returns {Promise<void>}
 */
async function deleteCarGarages(carId) {
    logger.info(`deleteCarGarages CALLED with ${carId}`);

    await CarGarageEntry.query().delete().where('car_id', carId);
}

/**
 * Delete all cars for a garage
 * @param garageId
 * @returns {Promise<void>}
 */
async function deleteGarageCars(garageId) {
    logger.info(`deleteCarGarages CALLED with ${garageId}`);

    await CarGarageEntry.query().delete().where('garage_id', garageId);
}

/**
 * Checks if a car garage entry exists
 * @param carId
 * @param garageIds
 * @returns {Promise<void>}
 */
async function setCarGarages(carId, garageIds) {
    logger.info(`setCarGarages CALLED with ${carId} and ${garageIds}`);

    await deleteCarGarages(carId);

    await asyncJS.eachLimit(garageIds, 5, async (garageId, eachGarageIdCallback) => {
        logger.verbose(`setCarGarages @eachGarageIdCallback PROCESSING ${garageId}`);

        await addCarGarageEntry(carId, garageId);

        return eachGarageIdCallback(null);
    });
}

export default {
    isCarInGarage,
    getCarGarages,
    getGarageCars,
    filterCarsByGarage,
    deleteCarGarages,
    deleteGarageCars,
    setCarGarages,
}
