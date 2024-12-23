export function up(knex) {
    return Promise.all([
        knex.schema.createTable('maintenance', (table) => {
            table.increments('id').primary();
            table.integer('car_id');
            table.integer('garage_id');
            table.text('service_type');
            table.timestamp('scheduled_date');

            table.index(['garage_id', 'scheduled_date'], 'maintenance_garage_id_scheduled_date__index'); // Create an index on the garage_id and scheduled date for faster lookups
        }),
    ]);
}

export function down(knex) {
    return Promise.all([
        knex.schema.dropTable('maintenance'),
    ]);
}