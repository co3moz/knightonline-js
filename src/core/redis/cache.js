const redis = require('./index');

module.exports = async function (name, fn, timeout) {
  let data = await redis.getAsync('cache-' + name);

  if (data) {
    return JSON.parse(data);
  }

  data = await fn();
  await redis.setAsync('cache-' + name, JSON.stringify(data), 'EX', timeout || 60);
  return data;
}