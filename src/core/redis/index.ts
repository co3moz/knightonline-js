import redis from "redis";
import config from "config";

export const redisClient = redis.createClient(config.get("redis"));

export const redisConnection = redisClient.connect();
