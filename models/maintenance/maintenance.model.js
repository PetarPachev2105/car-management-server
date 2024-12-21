import { Model } from 'objection';

/* Relationship models */
import Car from '../car/car.model';
import Garage from '../garage/garage.model';

export default class Maintenance extends Model {
    static tableName = 'maintenance';

    static jsonSchema = {
        type: 'object',
        required: ['id', 'car_id', 'garage_id', 'service_type', 'scheduled_date'],

        properties: {
            id: { type: 'number' },

            car_id: { type: 'number' },

            garage_id: { type: 'number' },

            service_type: { type: 'string' },

            scheduled_date: { type: 'timestamp' },
        },
    };

    static get relationMappings() {
        return {
            car: {
                relation: Model.HasOneRelation,
                modelClass: Car,
                join: {
                    from: 'maintenance.car_id',
                    to: 'car.id',
                },
            },
            garage: {
                relation: Model.HasOneRelation,
                modelClass: Garage,
                join: {
                    from: 'maintenance.garage',
                    to: 'garage.id',
                },
            },
        };
    }
}