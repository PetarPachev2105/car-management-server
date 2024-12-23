import { Model } from 'objection';

export default class CarGarageEntry extends Model {
    static tableName = 'car_garage_entry';

    static jsonSchema = {
        type: 'object',
        required: ['car_id', 'garage_id'],

        properties: {
            id: { type: 'number' },

            car_id: { type: 'number' },

            garage_id: { type: 'number' },
        },
    };
}