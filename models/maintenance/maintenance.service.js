/* Main model */
import Maintenance from './maintenance.model';

/* Additional Helpers */
import DateHelper from '../../lib/DateHelper';
import IDHelper from '../../lib/IDHelper';

/* Our custom logger */
import Logger from '../../lib/Logger';

const logger = new Logger(__filename);

/**
 * Checks if a maintenance request exists
 * @param maintenanceId
 * @returns {Promise<boolean>}
 */
async function checkIfMaintenanceExists(maintenanceId) {
    logger.info(`checkIfMaintenanceExists CALLED with ${maintenanceId}`);
    return !!Maintenance.query().select('id').findById(maintenanceId);
}

/**
 * Formats a maintenance request for API export
 * @param maintenance
 * @returns {{serviceType: ({type: string}|*), carName: *, garageName, garageId, scheduledDate: *, id, carId}|null}
 */
function formatMaintenanceForAPIExport(maintenance) {
    logger.info(`formatMaintenanceForAPIExport CALLED with ${maintenance ? maintenance.id : null}`);

    if (!maintenance) {
        return null;
    }

    return {
        id: maintenance.id,
        carId: maintenance.maintenanceCar.id,
        carName: maintenance.maintenanceCar.make,
        serviceType: maintenance.service_type,
        scheduledDate: DateHelper.transformToAPIFullDate(maintenance.scheduled_date),
        garageId: maintenance.maintenanceGarage.id,
        garageName: maintenance.maintenanceGarage.name,
    };
}

/**
 * Gets a maintenance request by id
 * @param maintenanceId
 * @returns {Promise<{}>}
 */
async function getMaintenance(maintenanceId) {
    logger.info(`getMaintenance CALLED with ${maintenanceId}`);

    const maintenance = await Maintenance.query()
        .findById(maintenanceId)
        .withGraphFetched('[maintenanceGarage(idAndName), maintenanceCar(idAndMake)]')
        .modifiers({
            idAndName(builder) {
                builder.select('id', 'name');
            },
            idAndMake(builder) {
                builder.select('id', 'make');
            },
        });

    logger.verbose(`getMaintenance FOUND ${maintenance ? maintenance.id : null}`);

    return maintenance;
}

/**
 * Searches maintenance requests with the given query params
 * @param carId
 * @param garageId
 * @param startDate
 * @param endDate
 * @returns {Promise<[]>}
 */
async function searchMaintenance(carId, garageId, startDate, endDate) {
    logger.info(`searchMaintenance CALLED with car - ${carId} and garage - ${garageId} from ${startDate} to ${endDate}`);

    const maintenances = await Maintenance.query()
        .where('car_id', carId)
        .andWhere('garage_id', garageId)
        .andWhere('scheduled_date', '>=', startDate)
        .andWhere('scheduled_date', '<=', endDate)
        .withGraphFetched('[garage(idAndName), car(idAndMake)]')
        .modifiers({
            idAndName(builder) {
                builder.select('id', 'name');
            },
            idAndMake(builder) {
                builder.select('id', 'make');
            },
        });

    logger.verbose(`searchMaintenance FOUND ${maintenances.length} maintenance requests`);

    return maintenances;
}

/**
 * Returns the maintenance requests for the specified garage between the specified dates
 * @param garageId
 * @param startDate
 * @param endDate
 * @returns {Promise<Maintenance[]>}
 */
async function getMaintenanceRequestsForGarage(garageId, startDate, endDate) {
    logger.info(`getMaintenanceRequestsForGarage CALLED with ${garageId} - from ${startDate} to ${endDate}`);

    const maintenanceRequests = await Maintenance.query()
        .select('id', 'scheduled_date')
        .where('garage_id', garageId)
        .andWhere('scheduled_date', '>=', startDate)
        .andWhere('scheduled_date', '<=', endDate);

    logger.verbose(`getMaintenanceRequestsForGarage FOUND ${maintenanceRequests.length} maintenance requests`);

    return maintenanceRequests;
}

/**
 * Returns the monthly requests report - shows on each month how many maintenance requests were made
 * Shows also the months without any maintenance requests
 * @param garageId
 * @param startDate
 * @param endDate
 * @returns {Promise<*>}
 */
async function monthlyRequestsReport(garageId, startDate, endDate) {
    logger.info(`monthlyRequestsReport CALLED with ${garageId} - from ${startDate} to ${endDate}`);

    /* Better get all then chunk it here instead of making hundreds of db calls */
    const maintenanceRequests = await getMaintenanceRequestsForGarage(garageId, startDate, endDate);

    const monthChunks = DateHelper.chunkToMonths(startDate, endDate);

    const results = [];

    monthChunks.forEach((chunk) => {
        logger.verbose(`monthlyRequestsReport CHECKING chunk ${chunk.start} - ${chunk.end}`);
        const chunkStartDateTimestamp = chunk.start.getTime();
        const chunkEndDateTimestamp = chunk.end.getTime();

        const requests = maintenanceRequests.filter((request) => {
            const requestDateTimestamp = new Date(request.scheduled_date).getTime();
            return requestDateTimestamp >= chunkStartDateTimestamp && requestDateTimestamp <= chunkEndDateTimestamp;
        });

        logger.verbose(`monthlyRequestsReport FOUND ${requests.length} requests in chunk`);

        results.push({
            yearMonth: {
                year: chunk.year,
                month: chunk.month,
                leapYear: chunk.leapYear,
                monthValue: chunk.monthValue,
            },
            requests: requests.length,
        });
    });

    return results;
}

/**
 * Creates a new maintenance request
 * @param carId
 * @param garageId
 * @param serviceType
 * @param scheduledDate
 * @returns {Promise<Maintenance>}
 */
async function createMaintenance(carId, garageId, serviceType, scheduledDate) {
    logger.info(`createMaintenance CALLED with car - ${carId} and garage - ${garageId} - ${serviceType} on ${scheduledDate}`);

    const maintenance = await Maintenance.query().insertAndFetch({
        car_id: carId,
        garage_id: garageId,
        service_type: serviceType,
        scheduled_date: new Date(scheduledDate).toISOString(),
    });

    logger.verbose(`createMaintenance CREATED ${maintenance.id}`);

    return maintenance;
}

/**
 * Updates the specified maintenance request
 * @param maintenanceId
 * @param carId
 * @param garageId
 * @param serviceType
 * @param scheduledDate
 * @returns {Promise<{}>}
 */
async function updateMaintenance(maintenanceId, carId, garageId, serviceType, scheduledDate) {
    logger.info(`updateMaintenance CALLED with ${maintenanceId} - ${carId} - ${garageId} - ${serviceType} - ${scheduledDate}`);

    const maintenance = await Maintenance.query().patchAndFetchById(maintenanceId, {
        car_id: carId,
        garage_id: garageId,
        service_type: serviceType,
        scheduled_date: new Date(scheduledDate).toISOString(),
    });

    logger.verbose(`updateMaintenance UPDATED ${maintenance.id}`);

    return maintenance;
}

/**
 * Deletes the specified maintenance request
 * @param maintenanceId
 * @returns {Promise<void>}
 */
async function deleteMaintenance(maintenanceId) {
    logger.info(`deleteMaintenance CALLED with ${maintenanceId}`);

    await Maintenance.query().deleteById(maintenanceId);

    logger.verbose(`deleteMaintenance DELETED ${maintenanceId}`);
}

export default {
    checkIfMaintenanceExists,
    formatMaintenanceForAPIExport,
    getMaintenance,
    searchMaintenance,
    getMaintenanceRequestsForGarage,
    monthlyRequestsReport,
    createMaintenance,
    updateMaintenance,
    deleteMaintenance,
}