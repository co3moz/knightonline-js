import { string } from "../../core/utils/unit.js";
import { News } from "../../core/database/models/index.js";
import { RedisCaching } from "../../core/redis/cache.js";
import { addLoginServerEndpoint, LoginEndpointCodes } from "../endpoint.js";

addLoginServerEndpoint(LoginEndpointCodes.NEWS, async function () {
  let news = await RedisCaching("news", NewsCache);

  return [LoginEndpointCodes.NEWS, ...string("Login Notice"), ...news];
});

async function NewsCache() {
  let news = await News.find().exec();

  return string(news.map((x) => x.title + "#" + x.message + "#").join(""));
}
