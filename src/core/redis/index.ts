import redis from "redis";
import config from "config";

export const redisClient = redis.createClient(config.get("redis"));

let redisConnection: Promise<any> | undefined = undefined;

export async function RedisConnect() {
  if (!redisConnection) {
    redisConnection = redisClient.connect();
  }
  await redisConnection;
}
