import { Model } from 'objection';

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
}