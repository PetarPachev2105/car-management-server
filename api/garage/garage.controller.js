import _ from 'lodash';
import httpStatus from 'http-status';

/* Main service */
import GarageService from '../../models/garage/garage.service';

/* Custom Errors */
import { HyundaiAccentError, HyundaiAccentErrorTypes, ERROR_MESSAGES  } from '../../config/hyundaiAccentError';

import Logger from '../../lib/Logger';
import DateHelper from "../../lib/DateHelper";

const logger = new Logger(__filename);

/**
 * Gets a garage by id
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function getGarage(req, res) {
    logger.info(`getGarage CALLED with ${req.params.garageId}`);

    if (!req.params || req.params.garageId === undefined) {
        logger.error(`getGarage CALLED with invalid garage ID ${JSON.stringify(req.params)}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.MISSING_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const garage = await GarageService.getGarage(req.params.garageId);

    if (!garage) {
        logger.error(`getGarage NOT FOUND with ID ${req.params.garageId}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.NOT_FOUND, ERROR_MESSAGES.RESOURCE_NOT_FOUND);
    }

    res.status(httpStatus.OK);
    res.json(garage);
}

/**
 * Searches garages with the given query params
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function searchGarages(req, res) {
    logger.info(`searchGarages CALLED with ${JSON.stringify(req.query)}`);

    if (!req.query) {
        logger.error(`searchGarages CALLED with no query ${req.query}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.MISSING_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const requiredFilters = ['city'];

    const cleanedQuery = _.pick(req.query, requiredFilters);

    if (Object.keys(cleanedQuery).length !== requiredFilters.length) {
        logger.error(`searchGarages CALLED with invalid search fields ${JSON.stringify(req.query)}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.BAD_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const garages = await GarageService.searchGarages(cleanedQuery.city);

    res.status(httpStatus.OK);
    res.json(garages);
}

/**
 * Returns the daily availability report - shows on each date how many maintenance requests are scheduled
 * and how many slots are available
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function dailyAvailabilityReport(req, res) {
    logger.info(`dailyAvailabilityReport CALLED with ${JSON.stringify(req.query)}`);

    if (!req.query) {
        logger.error(`dailyAvailabilityReport CALLED with no query ${req.query}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.MISSING_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const requiredFilters = ['garageId', 'startDate', 'endDate'];

    const cleanedQuery = _.pick(req.query, requiredFilters);

    if (Object.keys(cleanedQuery).length !== requiredFilters.length) {
        logger.error(`dailyAvailabilityReport CALLED with invalid search fields ${JSON.stringify(req.query)}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.BAD_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const startDate = DateHelper.transformAPIFullDate(cleanedQuery.startDate);

    if (startDate.toString() === 'Invalid Date') {
        logger.error(`dailyAvailabilityReport CALLED with invalid start date ${cleanedQuery.startDate}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.BAD_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const endDate = DateHelper.transformAPIFullDate(cleanedQuery.endDate);

    if (endDate.toString() === 'Invalid Date') {
        logger.error(`dailyAvailabilityReport CALLED with invalid end date ${cleanedQuery.endDate}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.BAD_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const garage = await GarageService.getGarage(cleanedQuery.garageId);

    const report = await GarageService.dailyAvailabilityReport(garage, startDate, endDate);

    res.status(httpStatus.OK);
    res.json(report);
}

/**
 * Creates a new garage
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function createGarage(req, res) {
    logger.info(`createGarage CALLED with ${JSON.stringify(req.body)}`);

    if (!req.body) {
        logger.error(`createGarage CALLED with no body ${req.body}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.MISSING_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const requiredFields = ['name', 'location', 'capacity', 'city'];

    const cleanedPayload = _.pick(req.body, requiredFields);

    if (Object.keys(cleanedPayload).length !== requiredFields.length) {
        logger.error(`createGarage CALLED with invalid fields ${JSON.stringify(req.body)}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.BAD_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const garage = await GarageService.createGarage(cleanedPayload.name, cleanedPayload.location, cleanedPayload.city, cleanedPayload.capacity);

    res.status(httpStatus.OK);
    res.json(garage);
}

/**
 * Updates an existing garage
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function updateGarage(req, res) {
    logger.info(`updateGarage CALLED with ${req.params.garageId} and ${JSON.stringify(req.body)}`);

    if (!req.params || req.params.garageId === undefined) {
        logger.error(`updateGarage CALLED with invalid garage ID ${JSON.stringify(req.params)}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.MISSING_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    if (!req.body) {
        logger.error(`updateGarage CALLED with no body ${req.body}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.BAD_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const requiredFields = ['name', 'location', 'capacity', 'city'];

    const cleanedPayload = _.pick(req.body, requiredFields);

    if (Object.keys(cleanedPayload).length !== requiredFields.length) {
        logger.error(`updateGarage CALLED with invalid fields ${JSON.stringify(req.body)}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.BAD_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const existingGarage = await GarageService.checkIfGarageExists(req.params.garageId)

    if (!existingGarage) {
        logger.error(`updateGarage NOT FOUND with ID ${req.params.garageId}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.NOT_FOUND, ERROR_MESSAGES.RESOURCE_NOT_FOUND);
    }

    const garage = await GarageService.updateGarage(req.params.garageId, cleanedPayload.name, cleanedPayload.location, cleanedPayload.city, cleanedPayload.capacity);

    res.status(httpStatus.OK);
    res.json(garage);
}

/**
 * Deletes a garage by id
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function deleteGarage(req, res) {
    logger.info(`deleteGarage CALLED with ${req.params.garageId}`);

    if (!req.params || req.params.garageId === undefined) {
        logger.error(`deleteGarage CALLED with invalid garage ID ${JSON.stringify(req.params)}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.MISSING_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const existingGarage = await GarageService.checkIfGarageExists(req.params.garageId)

    if (!existingGarage) {
        logger.error(`updateGarage NOT FOUND with ID ${req.params.garageId}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.NOT_FOUND, ERROR_MESSAGES.RESOURCE_NOT_FOUND);
    }

    await GarageService.deleteGarage(req.params.garageId);

    res.status(httpStatus.OK);
    res.json(true);
}

export default {
    getGarage,
    searchGarages,
    dailyAvailabilityReport,
    createGarage,
    updateGarage,
    deleteGarage,
}