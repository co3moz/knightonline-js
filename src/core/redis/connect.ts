import { redisClient, redisConnection } from "./index";

export async function RedisConnect() {
  await redisConnection;
  await redisClient.set("online", Date.now());
}
