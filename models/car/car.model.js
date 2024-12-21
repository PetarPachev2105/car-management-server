import { Model } from 'objection';

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
}