import _ from 'lodash';
import httpStatus from 'http-status';

/* Main service */
import MaintenanceService from '../../models/maintenance/maintenance.service';

/* Additional Services */
import CarService from '../../models/car/car.service';
import GarageService from '../../models/garage/garage.service';

/* Additional Helpers */
import DateHelper from '../../lib/DateHelper';

/* Custom Errors */
import { HyundaiAccentError, HyundaiAccentErrorTypes, ERROR_MESSAGES  } from '../../config/hyundaiAccentError';

/* Our custom logger */
import Logger from '../../lib/Logger';
import CarGarageEntryService from "../../models/carGarageEntry/carGarageEntry.service";

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

    const maintenance = await MaintenanceService.getMaintenance(req.params.maintenanceId);

    if (!maintenance) {
        logger.error(`getMaintenance CALLED with invalid maintenance ID ${req.params.maintenanceId}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.NOT_FOUND, ERROR_MESSAGES.RESOURCE_NOT_FOUND);
    }

    const formattedMaintenance = MaintenanceService.formatMaintenanceForAPIExport(maintenance);

    res.status(httpStatus.OK);
    res.json(formattedMaintenance);
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

    const startDateSpecified = DateHelper.transformAPIFullDate(cleanedQuery.startDate);

    if (startDateSpecified.toString() === 'Invalid Date') {
        logger.error(`searchMaintenance CALLED with invalid start date ${cleanedQuery.startDate}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.BAD_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const endDateSpecified = DateHelper.transformAPIFullDate(cleanedQuery.endDate);

    if (endDateSpecified.toString() === 'Invalid Date') {
        logger.error(`searchMaintenance CALLED with invalid end date ${cleanedQuery.endDate}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.BAD_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const startDate = DateHelper.setDateToStartOfTheDay(startDateSpecified);
    const endDate = DateHelper.setDateToEndOfTheDay(endDateSpecified);

    const maintenances = await MaintenanceService.searchMaintenance(cleanedQuery.carId, cleanedQuery.garageId, startDate, endDate);

    logger.verbose(`searchMaintenance FOUND ${maintenances.length} maintenance requests`);

    const formattedMaintenances = maintenances.map(maintenance => MaintenanceService.formatMaintenanceForAPIExport(maintenance));

    res.status(httpStatus.OK);
    res.json(formattedMaintenances);
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

    const startMonthSpecified = DateHelper.transformAPIMonthDate(cleanedQuery.startMonth);

    if (startMonthSpecified.toString() === 'Invalid Date') {
        logger.error(`monthlyRequestsReport CALLED with invalid start month ${cleanedQuery.startMonth}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.BAD_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const endMonthSpecified = DateHelper.transformAPIMonthDate(cleanedQuery.endMonth);

    if (endMonthSpecified.toString() === 'Invalid Date') {
        logger.error(`monthlyRequestsReport CALLED with invalid end month ${cleanedQuery.endMonth}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.BAD_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const startDate = DateHelper.setDateToBeginningOfMonth(startMonthSpecified);
    const endDate = DateHelper.setDateToEndOfMonth(endMonthSpecified);

    const report = await MaintenanceService.monthlyRequestsReport(cleanedQuery.garageId, startDate, endDate);

    logger.verbose(`monthlyRequestsReport FOUND ${report.length} months`);

    res.status(httpStatus.OK);
    res.json(report);
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

    const scheduledDateSpecified = DateHelper.transformAPIFullDate(cleanedPayload.scheduledDate);

    if (scheduledDateSpecified.toString() === 'Invalid Date') {
        logger.error(`createMaintenance CALLED with invalid scheduled date ${cleanedPayload.scheduledDate}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.BAD_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    /* Check if the car exists */
    const car = await CarService.getCar(cleanedPayload.carId);

    if (!car) {
        logger.error(`createMaintenance CALLED with invalid car ID ${cleanedPayload.carId}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.NOT_FOUND, ERROR_MESSAGES.RESOURCE_NOT_FOUND);
    }

    /* Get the garage */
    const garage = await GarageService.getGarage(cleanedPayload.garageId);

    /* If there is no garage return error */
    if (!garage) {
        logger.error(`createMaintenance CALLED with invalid garage ID ${cleanedPayload.garageId}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.NOT_FOUND, ERROR_MESSAGES.RESOURCE_NOT_FOUND);
    }

    /* Check if car is in garage */
    const isCarInGarage = await CarGarageEntryService.isCarInGarage(cleanedPayload.carId, cleanedPayload.garageId);

    if (!isCarInGarage) {
        logger.error(`createMaintenance CALLED with car not in garage ${cleanedPayload.carId} - ${cleanedPayload.garageId}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.BAD_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    /* Now check if the garage have the capacity */
    const startDate = DateHelper.setDateToStartOfTheDay(scheduledDateSpecified);
    const endDate = DateHelper.setDateToEndOfTheDay(scheduledDateSpecified);

    const dailyAvailability = await GarageService.dailyAvailabilityReport(garage, startDate, endDate);

    if (dailyAvailability[0].availableCapacity <= 0) {
        logger.error(`createMaintenance CALLED with no available capacity for garage ${cleanedPayload.garageId}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.BAD_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const createdMaintenance = await MaintenanceService.createMaintenance(cleanedPayload.carId, cleanedPayload.garageId, cleanedPayload.serviceType, scheduledDateSpecified);

    logger.verbose(`createMaintenance CREATED ${createdMaintenance.id}`);

    createdMaintenance.maintenanceCar = car;
    createdMaintenance.maintenanceGarage = garage;

    const formattedMaintenance = MaintenanceService.formatMaintenanceForAPIExport(createdMaintenance);

    res.status(httpStatus.OK);
    res.json(formattedMaintenance);
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

    const scheduledDateSpecified = DateHelper.transformAPIFullDate(cleanedPayload.scheduledDate);

    if (scheduledDateSpecified.toString() === 'Invalid Date') {
        logger.error(`createMaintenance CALLED with invalid scheduled date ${cleanedPayload.scheduledDate}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.BAD_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const maintenanceExist = await MaintenanceService.checkIfMaintenanceExists(req.params.maintenanceId);

    if (!maintenanceExist) {
        logger.error(`updateMaintenance CALLED with invalid maintenance ID ${req.params.maintenanceId}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.NOT_FOUND, ERROR_MESSAGES.RESOURCE_NOT_FOUND);
    }

    /* Check if the car exists */
    const car = await CarService.getCar(cleanedPayload.carId);

    if (!car) {
        logger.error(`updateMaintenance CALLED with invalid car ID ${cleanedPayload.carId}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.NOT_FOUND, ERROR_MESSAGES.RESOURCE_NOT_FOUND);
    }

    /* Get the garage */
    const garage = await GarageService.getGarage(cleanedPayload.garageId);

    /* If there is no garage return error */
    if (!garage) {
        logger.error(`updateMaintenance CALLED with invalid garage ID ${cleanedPayload.garageId}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.NOT_FOUND, ERROR_MESSAGES.RESOURCE_NOT_FOUND);
    }

    const isCarInGarage = await CarGarageEntryService.isCarInGarage(cleanedPayload.carId, cleanedPayload.garageId);

    if (!isCarInGarage) {
        logger.error(`updateMaintenance CALLED with car not in garage ${cleanedPayload.carId} - ${cleanedPayload.garageId}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.BAD_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    /* Now check if the garage have the capacity */
    const startDate = DateHelper.setDateToStartOfTheDay(scheduledDateSpecified);
    const endDate = DateHelper.setDateToEndOfTheDay(scheduledDateSpecified);

    const dailyAvailability = await GarageService.dailyAvailabilityReport(garage, startDate, endDate);

    if (dailyAvailability[0].availableCapacity <= 0) {
        logger.error(`updateMaintenance CALLED with no available capacity for garage ${cleanedPayload.garageId}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.BAD_INPUTS, ERROR_MESSAGES.BAD_REQUEST);
    }

    const updatedMaintenance = await MaintenanceService.updateMaintenance(req.params.maintenanceId, cleanedPayload.carId, cleanedPayload.garageId, cleanedPayload.serviceType, scheduledDateSpecified);

    updatedMaintenance.maintenanceCar = car;
    updatedMaintenance.maintenanceGarage = garage;

    const formattedMaintenance = MaintenanceService.formatMaintenanceForAPIExport(updatedMaintenance);

    res.status(httpStatus.OK);
    res.json(formattedMaintenance);
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

    const maintenanceExist = await MaintenanceService.checkIfMaintenanceExists(req.params.maintenanceId);

    if (!maintenanceExist) {
        logger.error(`updateMaintenance CALLED with invalid maintenance ID ${req.params.maintenanceId}`);
        throw new HyundaiAccentError(HyundaiAccentErrorTypes.NOT_FOUND, ERROR_MESSAGES.RESOURCE_NOT_FOUND);
    }

    await MaintenanceService.deleteMaintenance(req.params.maintenanceId);

    res.status(httpStatus.OK);
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