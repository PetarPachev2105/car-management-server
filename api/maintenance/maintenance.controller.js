import _ from 'lodash';
import httpStatus from 'http-status';

/* Custom Errors */
import { HyundaiAccentError, HyundaiAccentErrorTypes, ERROR_MESSAGES  } from '../../config/hyundaiAccentError';

/* Our custom logger */
import Logger from '../../lib/Logger';

const logger = new Logger(__filename);

/**
 * Gets a maintenance request by id
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function getMaintenance(req, res) {
    logger.info(`getMaintenance CALLED with ${JSON.stringify(req.params)}`);

    if (!req.params || req.params.maintenanceId === undefined) {
        logger.error(`getMaintenance CALLED with invalid maintenance ID ${JSON.stringify(req.params)}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.MISSING_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    res.status(httpStatus.HTTP_STATUS_OK);
    res.json({});
}

/**
 * Searches maintenance requests with the given query params
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function searchMaintenance(req, res) {
    logger.info(`searchMaintenance CALLED with ${JSON.stringify(req.query)}`);

    if (!req.query) {
        logger.error(`searchMaintenance CALLED with no query ${req.query}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.MISSING_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const requiredFilters = ['carId', 'garageId', 'startDate', 'endDate'];

    const cleanedQuery = _.pick(req.query, requiredFilters);

    if (Object.keys(cleanedQuery).length !== requiredFilters.length) {
        logger.error(`searchMaintenance CALLED with invalid search fields ${JSON.stringify(req.query)}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.BAD_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    // TODO: Check if exists

    res.status(httpStatus.HTTP_STATUS_OK);
    res.json({});
}

/**
 * Returns the monthly requests report - shows on each month how many maintenance requests were made
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function monthlyRequestsReport(req, res) {
    logger.info(`monthlyRequestsReport CALLED with ${JSON.stringify(req.query)}`);

    if (!req.query) {
        logger.error(`monthlyRequestsReport CALLED with no query ${req.query}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.MISSING_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const requiredFilters = ['garageId', 'startMonth', 'endMonth'];

    const cleanedQuery = _.pick(req.query, requiredFilters);

    if (Object.keys(cleanedQuery).length !== requiredFilters.length) {
        logger.error(`monthlyRequestsReport CALLED with invalid search fields ${JSON.stringify(req.query)}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.BAD_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    res.status(httpStatus.HTTP_STATUS_OK);
    res.json({});
}

/**
 * Creates a new maintenance request
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function createMaintenance(req, res) {
    logger.info(`createMaintenance CALLED with ${JSON.stringify(req.body)}`);

    if (!req.body) {
        logger.error(`createMaintenance CALLED with no body - ${req.body}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.MISSING_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const requiredFields = ['carId', 'garageId', 'serviceType', 'scheduledDate'];

    const cleanedPayload = _.pick(req.body, requiredFields);

    if (Object.keys(cleanedPayload).length !== requiredFields.length) {
        logger.error(`createMaintenance CALLED with invalid fields ${JSON.stringify(req.body)}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.BAD_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    res.status(httpStatus.HTTP_STATUS_OK);
    res.json({});
}

/**
 * Updates an existing maintenance request
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function updateMaintenance(req, res) {
    logger.info(`updateMaintenance CALLED with ${JSON.stringify(req.params)} and ${JSON.stringify(req.body)}`);

    if (!req.params || req.params.maintenanceId === undefined) {
        logger.error(`updateMaintenance CALLED with invalid maintenance ID ${JSON.stringify(req.params)}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.MISSING_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    if (!req.body) {
        logger.error(`updateMaintenance CALLED with no body - ${req.body}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.MISSING_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const requiredFields = ['carId', 'garageId', 'serviceType', 'scheduledDate'];

    const cleanedPayload = _.pick(req.body, requiredFields);

    if (Object.keys(cleanedPayload).length !== requiredFields.length) {
        logger.error(`updateMaintenance CALLED with invalid fields ${JSON.stringify(req.body)}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.BAD_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    // TODO: Check if exist

    res.status(httpStatus.HTTP_STATUS_OK);
    res.json({});
}

/**
 * Deletes a maintenance request by id
 * @param req
 * @param res
 * @returns {Promise<void>}
 */
async function deleteMaintenance(req, res) {
    logger.info(`deleteMaintenance CALLED with ${req.params.maintenanceId}`);

    if (!req.params || req.params.maintenanceId === undefined) {
        logger.error(`deleteMaintenance CALLED with invalid maintenance ID ${JSON.stringify(req.params)}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.MISSING_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    // TODO: Check if exist

    res.status(httpStatus.HTTP_STATUS_OK);
    res.json({});
}

export default {
    getMaintenance,
    searchMaintenance,
    monthlyRequestsReport,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
}