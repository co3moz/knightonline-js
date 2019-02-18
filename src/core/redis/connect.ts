import redis from './index'

export function RedisConnect() {
  return redis.setAsync('online', Date.now());
}
