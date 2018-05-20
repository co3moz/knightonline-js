const redis = require('redis');
const config = require('config');

const bluebird = require('bluebird');

bluebird.promisifyAll(redis.RedisClient.prototype);
bluebird.promisifyAll(redis.Multi.prototype);

const client = redis.createClient(config.get('redis'));

module.exports = client;
