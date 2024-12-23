export function up(knex) {
    return Promise.all([
        knex.schema.createTable('garage', (table) => {
            table.increments('id').primary();
            table.text('name');
            table.text('location');
            table.text('city');
            table.integer('capacity');
        }),
    ]);
}

export function down(knex) {
    return Promise.all([
        knex.schema.dropTable('garage'),
    ]);
}