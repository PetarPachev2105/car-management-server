import _ from 'lodash';
import asyncJS from 'async';
import httpStatus from 'http-status';

/* Main Service */
import CarService from '../../models/car/car.service';

/* Additional Services */
import CarGarageEntryService from '../../models/carGarageEntry/carGarageEntry.service';
import GarageService from '../../models/garage/garage.service';

/* Custom Errors */
import { HyundaiAccentError, HyundaiAccentErrorTypes, ERROR_MESSAGES } from '../../config/hyundaiAccentError';

import Logger from '../../lib/Logger';

const logger = new Logger(__filename);

/**
 * Gets a car by id
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function getCar(req, res) {
    logger.info(`getCar CALLED with ${req.params.carId}`);

    if (!req.params || req.params.carId === undefined) {
        logger.error(`getCar CALLED with invalid car ID ${JSON.stringify(req.params)}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.MISSING_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const car = await CarService.getCar(req.params.carId);

    if (!car) {
        logger.error(`getCar NOT FOUND with ID ${req.params.carId}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.NOT_FOUND, ERROR_MESSAGES.RESOURCE_NOT_FOUND);
    }

    const carGarageEntries = await CarGarageEntryService.getCarGarages(car.id);
    const garageIds = carGarageEntries.map(entry => entry.garageId);

    const garages = await GarageService.getGarages(garageIds);

    const formattedCar = CarService.formatCarForAPIExport(car, garages);

    res.status(httpStatus.OK);
    res.json(formattedCar);
}

/**
 * Searches cars with the given query params
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function searchCars(req, res) {
    logger.info(`searchCars CALLED with ${JSON.stringify(req.query)}`);

    if (!req.query) {
        logger.error(`searchCars CALLED with no query ${req.query}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.MISSING_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const requiredFilters = ['carMake', 'garageId', 'fromYear', 'toYear'];

    const cleanedQuery = _.pick(req.query, requiredFilters);

    if (Object.keys(cleanedQuery).length !== requiredFilters.length) {
        logger.error(`searchCars CALLED with invalid search fields ${JSON.stringify(req.query)}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.BAD_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const cars = await CarService.searchCars(cleanedQuery.carMake, cleanedQuery.garageId, cleanedQuery.fromYear, cleanedQuery.toYear);

    /* Store all garages we retrieved so far */
    const garagesLUT = {};

    const formattedCars = [];

    /* Loop through all cars and set their garages for the api export */
    await asyncJS.eachSeries(cars, async (car, eachCarCallback) => {
        const carGarageEntries = await CarGarageEntryService.getCarGarages(car.id);

        const missingGarageIds = carGarageEntries.map(entry => entry.garageId).filter(garageId => !garagesLUT[garageId]);

        /* Find all missing garages and set it to the look-up table */
        /* This way we won't retrieve the same garage one million times */
        if (missingGarageIds.length > 0) {
            const missingGarages = await GarageService.getGarages(missingGarageIds);


            missingGarages.forEach((missingGarage) => {
                garagesLUT[missingGarage.id] = missingGarage;
            });

            const carGarages = carGarageEntries.map(entry => garagesLUT[entry.garageId]);

            const formattedCar = CarService.formatCarForAPIExport(car, carGarages);

            formattedCars.push(formattedCar);
        }

        return eachCarCallback(null);
    });

    res.status(httpStatus.OK);
    res.json(formattedCars);
}

/**
 * Creates a new car
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function createCar(req, res) {
    logger.info(`createCar CALLED with ${JSON.stringify(req.body)}`);

    if (!req.body) {
        logger.error(`createCar CALLED with no body - ${req.body}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.MISSING_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const requiredFields = ['make', 'model', 'productionYear', 'licensePlate', 'garageIds'];

    const cleanedPayload = _.pick(req.body, requiredFields);

    if (Object.keys(cleanedPayload).length !== requiredFields.length) {
        logger.error(`createCar CALLED with invalid fields ${JSON.stringify(req.body)}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.BAD_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const garageIds = cleanedPayload.garageIds;

    const garages = await GarageService.getGarages(garageIds);

    if (garages.length !== garageIds.length) {
        logger.error(`createCar CALLED with invalid garage ids ${JSON.stringify(req.body)}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.BAD_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const car = await CarService.createCar(cleanedPayload.make, cleanedPayload.model, cleanedPayload.productionYear, cleanedPayload.licensePlate, garageIds);

    const formattedCar = CarService.formatCarForAPIExport(car, garages);

    res.status(httpStatus.OK);
    res.json(formattedCar);
}

/**
 * Updates an existing car
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function updateCar(req, res) {
    logger.info(`updateCar CALLED with ${JSON.stringify(req.params)} and ${JSON.stringify(req.body)}`);

    if (!req.params || req.params.carId === undefined) {
        logger.error(`updateCar CALLED with invalid car ID - ${req.params.carId}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.MISSING_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    if (!req.body) {
        logger.error(`updateCar CALLED with no body - ${req.body}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.MISSING_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const requiredFields = ['make', 'model', 'productionYear', 'licensePlate', 'garageIds'];

    const cleanedPayload = _.pick(req.body, requiredFields);

    if (Object.keys(cleanedPayload).length !== requiredFields.length) {
        logger.error(`updateCar CALLED with invalid fields ${JSON.stringify(req.body)}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.BAD_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const carExists = await CarService.checkIfCarExists(req.params.carId);

    if (!carExists) {
        logger.error(`updateCar NOT FOUND with ID ${req.params.carId}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.NOT_FOUND, ERROR_MESSAGES.RESOURCE_NOT_FOUND);
    }

    const garageIds = cleanedPayload.garageIds;

    const garages = await GarageService.getGarages(garageIds);

    if (garages.length !== garageIds.length) {
        logger.error(`createCar CALLED with invalid garage ids ${JSON.stringify(req.body)}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.BAD_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const car = await CarService.updateCar(req.params.carId, cleanedPayload.make, cleanedPayload.model, cleanedPayload.productionYear, cleanedPayload.licensePlate, garageIds);

    const formattedCar = CarService.formatCarForAPIExport(car, garages);

    res.status(httpStatus.OK);
    res.json(formattedCar);
}

/**
 * Deletes a car by id
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function deleteCar(req, res) {
    logger.info(`deleteCar CALLED with ${req.params.carId}`);

    if (!req.params || req.params.carId === undefined) {
        logger.error(`deleteCar CALLED with invalid car ID ${JSON.stringify(req.params)}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.MISSING_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const carExists = await CarService.checkIfCarExists(req.params.carId);

    if (!carExists) {
        logger.error(`updateCar NOT FOUND with ID ${req.params.carId}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.NOT_FOUND, ERROR_MESSAGES.RESOURCE_NOT_FOUND);
    }

    await CarService.deleteCar(req.params.carId);

    res.status(httpStatus.OK);
    res.json(true);
}

export default {
    getCar,
    searchCars,
    createCar,
    updateCar,
    deleteCar,
}