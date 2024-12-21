import { Model } from 'objection';

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
}