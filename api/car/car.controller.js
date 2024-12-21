import _ from 'lodash';
import httpStatus from 'http-status';

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

    // TODO: Check if exists


    res.status(httpStatus.HTTP_STATUS_OK);
    res.json({});
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

    res.status(httpStatus.HTTP_STATUS_OK);
    res.json({});
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

    res.status(httpStatus.HTTP_STATUS_OK);
    res.json({});
}

/**
 * Updates an existing car
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function updateCar(req, res) {
    logger.info(`updateCar CALLED with ${req.params.carId} and ${JSON.stringify(req.body)}`);

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

    // TODO: Check if exist

    res.status(httpStatus.HTTP_STATUS_OK);
    res.json({});
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

    // TODO: Check if exists

    res.status(httpStatus.HTTP_STATUS_OK);
    res.json({});
}

export default {
    getCar,
    searchCars,
    createCar,
    updateCar,
    deleteCar,
}