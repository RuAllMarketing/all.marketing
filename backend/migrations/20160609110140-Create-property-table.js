var dbm = global.dbm || require('db-migrate');
var type = dbm.dataType;

exports.up = function(db, callback) {
  db.createTable('property', {
    id: { type: 'int', primaryKey: true, autoIncrement: true },
    town: 'string',
    address: 'string',
    rooms_count: 'string',
    house_type: 'int',
    floor: 'int',
    floors_count: 'int',
    cadastral_id: 'string',
    description: 'text',
    area_size: 'int',
    price: 'int',
    publishing_time: 'int',
    owner_id: 'int',
    status: 'string'
  }, callback);
};

exports.down = function(db, callback) {
  db.dropTable('property', callback);
};
