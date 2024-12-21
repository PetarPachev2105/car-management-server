import { Model } from 'objection';

/* Relationship models */
import Maintenance from '../maintenance/maintenance.model';

export default class Car extends Model {
    static tableName = 'car';

    static jsonSchema = {
        type: 'object',
        required: ['id', 'make', 'model', 'production_year', 'licence_plate'],

        properties: {
            id: { type: 'number' },

            make: { type: 'string' },

            model: { type: 'string' },

            production_year: { type: 'timestamp' },

            licence_plate: { type: 'string' },
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
        };
    }
}