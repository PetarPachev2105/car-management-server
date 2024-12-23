import { Model } from 'objection';

/* Relationship models */
import Maintenance from '../maintenance/maintenance.model';
import CarGarageEntry from '../carGarageEntry/carGarageEntry.model';

export default class Car extends Model {
    static tableName = 'car';

    static jsonSchema = {
        type: 'object',
        required: ['make', 'model', 'production_year', 'license_plate'],

        properties: {
            id: { type: 'number' },

            make: { type: 'string' },

            model: { type: 'string' },

            production_year: { type: 'number' },

            license_plate: { type: 'string' },
        },
    };

    static get relationMappings() {
        return {
            maintenances: {
                relation: Model.HasManyRelation,
                modelClass: Maintenance,
                join: {
                    from: 'car.id',
                    to: 'maintenance.car_id',
                },
            },
            garages: {
                relation: Model.HasManyRelation,
                modelClass: CarGarageEntry,
                join: {
                    from: 'car.id',
                    to: 'car_garage_entry.car_id',
                },
            }
        };
    }
}