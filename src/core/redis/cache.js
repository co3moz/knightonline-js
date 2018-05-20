const redis = require('./index');

module.exports = async function (name, fn, timeout) {
  let data = await redis.getAsync('cache-' + name);

  if (data) {
    return JSON.parse(data);
  }

  if (await waitLock(name)) {
    let data = await redis.getAsync('cache-' + name);

    if (data) {
      return JSON.parse(data);
    }
  }

  lock(name);

  try {
    data = await fn();
    await redis.setAsync('cache-' + name, JSON.stringify(data), 'EX', timeout || 60);
  } finally {
    unlock(name);
  }

  return data;
}

const _locks = {};
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
async function waitLock(name) {
  if (!_locks[name]) {
    return false;
  }
  let timeout = 120; // 30 sec
  for (; ;) {
    await delay(250);
    if (!_locks[name]) {
      return true;
    }

    if (timeout-- <= 0) {
      return false;
    }
  }
}

function lock(name) {
  _locks[name] = true;
}

function unlock(name) {
  _locks[name] = false;
}