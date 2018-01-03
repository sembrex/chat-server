exports.up = function(knex, Promise) {
  return knex.schema.createTable('users', table => {
    table.bigIncrements('id').primary()
    table.string('username').unique().notNullable()
    table.string('password').notNullable()
    table.bigInteger('avatar_id').unsigned().references('id').inTable('file_managers')
    table.timestamps(false, true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('users')
};
