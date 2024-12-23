export function up(knex) {
    return Promise.all([
        knex.schema.createTable('car_garage_entry', (table) => {
            table.increments('id').primary();
            table.integer('car_id');
            table.integer('garage_id');

            table.unique(['car_id', 'garage_id'], 'car_garage_entry_car_id_garage_id__uindex'); // Create a UNIQUE index on the garage_id and car_id
        }),
    ]);
}

export function down(knex) {
    return Promise.all([
        knex.schema.dropTable('car_garage_entry'),
    ]);
}