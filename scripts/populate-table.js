import asyncJS from 'async';
import dotenv from 'dotenv';

import GarageService from '../models/garage/garage.service';
import CarService from '../models/car/car.service';
import MaintenanceService from '../models/maintenance/maintenance.service';

import Database from '../dbconfig/database';
import Logger from '../lib/Logger';

dotenv.config( { path: '../.env' });

/* The Winston logger */
let logger = null;

function getRandomInt(min, max) {
    return parseInt(Math.random() * (max - min) + min);
}

async function work() {
    /* Connect to db * */
    const dbClient = new Database();
    await dbClient.connectToDb();

    const GARAGES_CITIES = [
        'Plovdiv', 'Sofia', 'Varna',
        'Burgas', 'Ruse', 'Stara Zagora',
        'Pleven', 'Blagoevgrad', 'Peshtera',
        'Karnobat',
    ];

    const GARAGES_LOCATIONS = [
      'Center - 1', 'North - 1', 'South - 1', 'East - 1', 'West - 1',
      'Center - 2', 'North - 2', 'South - 2', 'East - 2', 'West - 2',
    ];

    const garages = [];

    await asyncJS.eachLimit(GARAGES_CITIES, 2, async (city, eachCityCallback) => {
        logger.verbose(`populateTable @eachCityCallback processing - ${city}`);

        await asyncJS.eachLimit(GARAGES_LOCATIONS, 5, async (location, eachLocationCallback) => {
            logger.verbose(`populateTable @eachLocationCallback processing - ${location}`);

            const capacity = getRandomInt(10, 100);

            const garage = await GarageService.createGarage(`${city} - ${location}`, location, city, capacity);

            garages.push(garage);

            return eachLocationCallback(null);
        });
        return eachCityCallback(null);
    });

    logger.verbose(`populateTable created ${garages.length} garages`);

    const CARS_MAKES = [
        'Toyota', 'Honda', 'Mercedes',
        'BMW', 'Audi', 'VW',
        'Ford', 'Chevrolet', 'Fiat',
        'Renault', 'Hyundai', 'Kia',
        'Talbot', 'Lada', 'Zastava',
    ];

    const CARS_MODELS = [
        'A1', 'A2', 'A3', 'A4', 'A5',
        'A6', 'A7', 'A8', 'A9', 'A10',
    ];

    const cars = [];

    await asyncJS.eachLimit(CARS_MAKES, 2, async (make, eachMakeCallback) => {
        logger.verbose(`populateTable @eachMakeCallback processing - ${make}`);

        await asyncJS.eachLimit(CARS_MODELS, 5, async (model, eachModelCallback) => {
            logger.verbose(`populateTable @eachModelCallback processing - ${model}`);

            const productionYear = getRandomInt(1990, 2020);

            const garageStartIndex = getRandomInt(0, garages.length - 11);
            const garagesCount = getRandomInt(1, 10);
            const garageIds = garages.slice(garageStartIndex, garageStartIndex + garagesCount).map(garage => garage.id);

            for (let i = 1000; i < 1100; i++) {
                const licensePlate = `${make}-${model}-${i}`;
                const car = await CarService.createCar(make, model, productionYear, licensePlate, garageIds);
                cars.push(car);
            }

            return eachModelCallback(null);
        });
        return eachMakeCallback(null);
    });

    logger.verbose(`populateTable created ${cars.length} cars`);

    process.exit(0);
}

/** *****
 --- Startup code below ---
 ****** */

/* Initialize the logger */
logger = new Logger(__filename);

/* Start work */

work();