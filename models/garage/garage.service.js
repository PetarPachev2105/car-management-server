import _ from 'lodash';
import asyncJS from 'async';

/* Main model */
import Garage from './garage.model';

/* Helper services */
import CarGarageEntryService from '../carGarageEntry/carGarageEntry.service';
import MaintenanceService from '../maintenance/maintenance.service';

/* Additional Helpers */
import DateHelper from '../../lib/DateHelper';
import IDHelper from '../../lib/IDHelper';

/* Our custom logger */
import Logger from '../../lib/Logger';

const logger = new Logger(__filename);

/**
 * Checks if a garage exists
 * @param garageId
 * @returns {Promise<boolean>}
 */
async function checkIfGarageExists(garageId) {
    logger.info(`checkIfGarageExists CALLED with ${garageId}`);

    const garageExists = await Garage.query().select('id').findById(garageId);

    logger.verbose(`checkIfGarageExists FOUND ${garageExists ? garageExists.id : null}`);

    return !!garageExists;
}

/**
 * Formats a garage for API export
 * @param garage
 * @returns {{}|null}
 */
function formatGarageForAPIExport(garage) {
    logger.info(`formatGarageForAPIExport CALLED with ${garage ? garage.id : null}`);

    if (!garage) {
        return null;
    }

    /* No need for now for formatting */
    return garage;
}

/**
 * Gets a garage by id
 * @param garageId
 * @returns {Promise<{}>}
 */
async function getGarage(garageId) {
    logger.info(`getGarage CALLED with ${garageId}`);

    const garage = await Garage.query().findById(garageId);

    logger.verbose(`getGarage FOUND ${garage ? garage.id : null}`);

    return garage;
}

/**
 * Gets garages by ids
 * @param garageIds
 * @returns {Promise<{}>}
 */
async function getGarages(garageIds) {
    logger.info(`getGarages CALLED with ${garageIds.length} garage ids`);

    const garages = [];

    /* Chunk the garages in case we receive too many ids */
    const chunksOfGarageIds = _.chunk(garageIds, 20);

    await asyncJS.eachSeries(chunksOfGarageIds, async (chunkOfGarageIds, eachChunkOfGaragesCallback) => {
        logger.verbose(`getGarages PROCESSING chunk of ${chunkOfGarageIds.length} garage ids`);

        const chunkGarages = await Garage.query().findByIds(chunkOfGarageIds);

        logger.verbose(`getGarages FOUND ${chunkGarages.length} garages in chunk`);

        garages.push(...chunkGarages);

        return eachChunkOfGaragesCallback(null);
    });

    logger.verbose(`getGarage FOUND ${garages.length}`);

    return garages;
}

/**
 * Searches garages by city
 * @returns {Promise<[]>}
 * @param city
 */
async function searchGarages(city) {
    logger.info(`searchGarages CALLED with city - ${city}`);

    const garages = await Garage.query()
        .where('city', city)

    logger.verbose(`searchGarages FOUND ${garages.length} garages`);

    return garages;
}

/**
 * Returns daily availability report for the specified garage
 * @param garage
 * @param startDate
 * @param endDate
 * @returns {Promise<{}>}
 */
async function dailyAvailabilityReport(garage, startDate, endDate) {
    logger.info(`dailyAvailabilityReport CALLED with ${garage.id} - ${startDate} - ${endDate}`);

    const maintenanceRequests = await MaintenanceService.getMaintenanceRequestsForGarage(garage.id, startDate, endDate);

    const daysChunk = DateHelper.chunkToDays(startDate, endDate);

    const results = [];

    daysChunk.forEach((chunk) => {
        logger.verbose(`dailyAvailabilityReport CHECKING chunk ${chunk.start} - ${chunk.end}`);

        const chunkStartDateTimestamp = chunk.start.getTime();
        const chunkEndDateTimestamp = chunk.end.getTime();

        const requests = maintenanceRequests.filter((request) => {
            const requestDateTimestamp = new Date(request.scheduled_date).getTime();
            return requestDateTimestamp >= chunkStartDateTimestamp && requestDateTimestamp <= chunkEndDateTimestamp;
        });

        logger.verbose(`dailyAvailabilityReport FOUND ${requests.length} requests in chunk`);

        results.push({
            date: DateHelper.transformToAPIFullDate(chunk.start),
            requests: requests.length,
            availableCapacity: garage.capacity - requests.length,
        });
    });

    return results;
}

/**
 * Creates a new garage
 * @returns {Promise<Garage>}
 * @param name
 * @param location
 * @param city
 * @param capacity
 */
async function createGarage(name, location, city, capacity) {
    logger.info(`createGarage CALLED with ${name} - ${location} - ${city} - ${capacity}`);

    const garage = await Garage.query().insert({
        name,
        location,
        city,
        capacity,
    });

    logger.verbose(`createGarage CREATED ${garage.id}`);

    return garage;
}

/**
 * Updates the specified garage
 * @returns {Promise<{}>}
 * @param garageId
 * @param name
 * @param location
 * @param city
 * @param capacity
 */
async function updateGarage(garageId, name, location, city, capacity) {
    logger.info(`updateGarage CALLED with ${garageId} - ${name} - ${location} - ${city} - ${capacity}`);

    const garage = await Garage.query().patchAndFetchById(garageId, {
        name,
        location,
        city,
        capacity,
    });

    logger.verbose(`updateGarage UPDATED ${garage.id}`);

    return garage;
}

/**
 * Deletes the specified garage and all of its garage car entries
 * @param garageId
 * @returns {Promise<void>}
 */
async function deleteGarage(garageId) {
    logger.info(`deleteGarage CALLED with ${garageId}`);

    await Garage.query().deleteById(garageId);

    logger.verbose(`deleteGarage DELETED ${garageId}`);

    await CarGarageEntryService.deleteGarageCars(garageId);
}

export default {
    checkIfGarageExists,
    formatGarageForAPIExport,
    getGarage,
    getGarages,
    searchGarages,
    dailyAvailabilityReport,
    createGarage,
    updateGarage,
    deleteGarage,
}