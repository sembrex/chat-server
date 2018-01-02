exports.up = function(knex, Promise) {
  return knex.schema.createTable('file_managers', table => {
    table.bigIncrements('id').primary()
    table.string('mime')
    table.integer('size')
    table.string('path').notNullable()
    table.timestamps(false, true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('file_managers')
};
