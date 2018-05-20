const redis = require('./index');

module.exports = function () {
  return redis.setAsync('online', Date.now());
}