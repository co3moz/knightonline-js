import { redisClient } from "./index.js";

export async function RedisCaching(
  name: string,
  action: () => Promise<any>,
  cacheTime: number = 60
) {
  let data = await redisClient.get("cache-" + name);

  if (data) {
    return JSON.parse(data as string);
  }

  if (await waitLock(name)) {
    let data = await redisClient.get("cache-" + name);

    if (data) {
      return JSON.parse(data as string);
    }
  }

  lock(name);

  try {
    data = await action();
    await redisClient.setEx("cache-" + name, cacheTime, JSON.stringify(data));
  } finally {
    unlock(name);
  }

  return data;
}

const _locks = {};
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function waitLock(name, timeout = 120) {
  if (!_locks[name]) {
    return false;
  }
  for (;;) {
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
