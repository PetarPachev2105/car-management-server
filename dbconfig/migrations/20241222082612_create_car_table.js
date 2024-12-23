export function up(knex) {
    return Promise.all([
        knex.schema.createTable('car', (table) => {
            table.increments('id').primary();
            table.text('make');
            table.text('model');
            table.integer('production_year');
            table.text('license_plate');

            table.index(['make', 'production_year'], 'car_make_production_year__index'); // Create an index on the make and production_year
        }),
    ]);
}

export function down(knex) {
    return Promise.all([
        knex.schema.dropTable('car'),
    ]);
}