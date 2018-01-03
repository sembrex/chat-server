exports.up = function(knex, Promise) {
  return knex.schema.createTable('messages', table => {
    table.bigIncrements('id').primary()
    table.bigInteger('room_id').unsigned().notNullable().references('id').inTable('rooms')
    table.bigInteger('user_id').unsigned().notNullable().references('id').inTable('users')
    table.text('message').notNullable()
    table.timestamps(false, true)
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('messages')
};
