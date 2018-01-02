exports.up = function(knex, Promise) {
  return knex.schema.createTable('rooms', table => {
    table.bigIncrements('id').primary()
    table.bigInteger('user_id1').unsigned().references('id').inTable('users')
    table.bigInteger('user_id2').unsigned().references('id').inTable('users')
    table.string('name').notNullable()
    table.timestamps(false, true)
    table.unique(['user_id1', 'user_id2'])
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('rooms')
};
