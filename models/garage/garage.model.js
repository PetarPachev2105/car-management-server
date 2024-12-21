import { Model } from 'objection';

/* Relationship models */
import Maintenance from '../maintenance/maintenance.model';

export default class Garage extends Model {
    static tableName = 'garage';

    static jsonSchema = {
        type: 'object',
        required: ['id', 'name', 'location', 'city', 'capacity'],

        properties: {
            id: { type: 'number' },

            name: { type: 'string' },

            location: { type: 'string' },

            city: { type: 'string' },

            capacity: { type: 'number' },
        },
    };

    static get relationMappings() {
        return {
            maintenances: {
                relation: Model.HasManyRelation,
                modelClass: Maintenance,
                join: {
                    from: 'garage.id',
                    to: 'maintenance.garage_id',
                },
            },
        };
    }
}