/* Main model */
import Car from './car.model';

/* Helper services */
import CarGarageEntryService from "../carGarageEntry/carGarageEntry.service";
import GarageService from "../garage/garage.service";

/* Additional Helpers */
import IDHelper from '../../lib/IDHelper';

/* Our custom logger */
import Logger from '../../lib/Logger';

const logger = new Logger(__filename);

/**
 * Checks if a car exists
 * @param carId
 * @returns {Promise<boolean>}
 */
async function checkIfCarExists(carId) {
    logger.info(`checkIfCarExists CALLED with ${carId}`);
    return !!Car.query().select('id').findById(carId);
}

/**
 * Formats a car for API export
 * @param car
 * @param carGarages
 * @returns {{serviceType: ({type: string}|*), carName: *, garageName, garageId, scheduledDate: *, id, carId}|null}
 */
function formatCarForAPIExport(car, carGarages) {
    logger.info(`formatCarForAPIExport CALLED with ${car ? car.id : null}`);

    if (!car) {
        return null;
    }

    return {
        id: car.id,
        make: car.make,
        model: car.model,
        productionYear: car.production_year,
        licensePlate: car.license_plate,
        garages: carGarages.map(garage => GarageService.formatGarageForAPIExport(garage)),
    };
}

/**
 * Gets a car by id
 * @param carId
 * @returns {Promise<{}>}
 */
async function getCar(carId) {
    logger.info(`getCar CALLED with ${carId}`);

    const car = await Car.query().findById(carId);

    logger.verbose(`getCar FOUND ${car ? car.id : null}`);

    return car;
}

/**
 * Searches car by make, garage and production_year
 * @param carMake
 * @param garageId
 * @param fromYear
 * @param toYear
 * @returns {Promise<[]>}
 */
async function searchCars(carMake, garageId, fromYear, toYear) {
    logger.info(`searchCars CALLED with carMake - ${carMake} and garage - ${garageId} from ${fromYear} to ${toYear}`);

    const cars = await Car.query()
        .leftJoin('car_garage_entry as cge', 'car.id', 'cge.car_id')
        .leftJoin('garage as g', 'cge.garage_id', 'g.id')
        .where('cge.garage_id', garageId)
        .andWhere('make', carMake)
        .andWhere('production_year', '>=', fromYear)
        .andWhere('scheduled_date', '<=', toYear);

    logger.verbose(`searchCars FOUND ${cars.length} cars`);

    return cars;
}

/**
 * Creates a new car
 * @param make
 * @param model
 * @param productionYear
 * @param licensePlate
 * @param garageIds
 * @returns {Promise<Car>}
 */
async function createCar(make, model, productionYear, licensePlate, garageIds) {
    logger.info(`createCar CALLED with ${make} - ${model} - ${productionYear} - ${licensePlate} and garageIds ${garageIds}`);

    const car = await Car.query().insert({
        make,
        model,
        production_year: productionYear,
        license_plate: licensePlate,
    });

    logger.verbose(`createCar CREATED ${car.id}`);

    await CarGarageEntryService.setCarGarages(car.id, garageIds);

    logger.verbose(`createCar CREATED ${car.id}`);

    return car;
}

/**
 * Updates the specified car
 * @param carId
 * @param carId
 * @param make
 * @param model
 * @param productionYear
 * @param licensePlate
 * @returns {Promise<{}>}
 */
async function updateCar(carId, make, model, productionYear, licensePlate, garageIds) {
    logger.info(`updateCar CALLED with ${carId} - ${make} - ${model} - ${productionYear} - ${licensePlate} and garageIds ${garageIds}`);

    const car = await Car.query().patchAndFetchById(carId, {
        make: make,
        model: model,
        production_year: productionYear,
        licence_plate: licensePlate,
    });

    logger.verbose(`updateCar UPDATED ${car.id}`);

    await CarGarageEntryService.setCarGarages(car.id, garageIds);

    return car;
}

/**
 * Deletes the specified car and all of its car garage entries
 * @param carId
 * @returns {Promise<void>}
 */
async function deleteCar(carId) {
    logger.info(`deleteCar CALLED with ${carId}`);

    await Car.query().deleteById(carId);

    logger.verbose(`deleteCar DELETED ${carId}`);

    await CarGarageEntryService.deleteCarGarages(carId);
}

export default {
    checkIfCarExists,
    formatCarForAPIExport,

    getCar,
    searchCars,
    createCar,
    updateCar,
    deleteCar,
}