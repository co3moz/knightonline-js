import redis from './index'

export default function () {
  return redis.setAsync('online', Date.now());
}
