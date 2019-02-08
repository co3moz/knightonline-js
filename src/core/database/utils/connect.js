const mongoose = require('mongoose');
const config = require('config');

mongoose.Promise = global.Promise;

module.exports = function () {
  console.log('database connection...');
  return mongoose.connect(config.get('database.uri'), Object.assign({}, config.get('database.options')))
  .then((connection) => {
    return module.exports = connection;
  }).catch(err => {
    console.log('connecting to database failed!');
    console.error(err);
    // eslint-disable-next-line no-process-exit
    process.exit(1);
  });
}