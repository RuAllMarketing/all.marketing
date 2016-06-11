var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('users', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    name: 'string',
    email: 'string',
    phone: 'string',
    active: 'boolean',
    password: 'string',
    activation_hash: 'string'
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('users', callback);
};
