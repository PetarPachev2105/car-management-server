import { Model } from 'objection';

/* Relationship models */
import Car from '../car/car.model';
import Garage from '../garage/garage.model';

export default class Maintenance extends Model {
    static tableName = 'maintenance';

    static jsonSchema = {
        type: 'object',
        required: ['car_id', 'garage_id', 'service_type', 'scheduled_date'],

        properties: {
            id: { type: 'number' },

            car_id: { type: 'number' },

            garage_id: { type: 'number' },

            service_type: { type: 'string' },

            scheduled_date: { type: 'string', format: 'date-time' },
        },
    };

    static get relationMappings() {
        return {
            maintenanceCar: {
                relation: Model.HasOneRelation,
                modelClass: Car,
                join: {
                    from: 'maintenance.car_id',
                    to: 'car.id',
                },
            },
            maintenanceGarage: {
                relation: Model.HasOneRelation,
                modelClass: Garage,
                join: {
                    from: 'maintenance.garage_id',
                    to: 'garage.id',
                },
            },
        };
    }
}