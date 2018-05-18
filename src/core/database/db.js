const mongoose = require('mongoose');
const config = require('config');

mongoose.Promise = global.Promise;

module.exports = function () {
  return mongoose.connect(config.get('database.uri'), Object.assign({}, config.get('database.options')))
  .then((connection) => {
    console.log('connecting to database ok!');

    return module.exports = connection;
  }).catch(err => {
    console.log('connecting to database failed!');
    console.error(err);
  });
}