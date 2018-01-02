
exports.up = function(knex, Promise) {
  return knex.schema.createTable('attachments', table => {
    table.bigInteger('attachment_id').unsigned().references('id').inTable('file_managers')
    table.bigInteger('message_id').unsigned().references('id').inTable('messages')
    table.primary(['attachment_id', 'message_id'])
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('attachments')
};
