import { Queue, string } from "../../core/utils/unit.js";
import type { ILoginSocket } from "../login_socket.js";
import { News } from "../../core/database/models/index.js";
import { RedisCaching } from "../../core/redis/cache.js";
import type { ILoginEndpoint } from "../endpoint.js";

export const NEWS: ILoginEndpoint = async function (
  socket: ILoginSocket,
  body: Queue,
  opcode: number
) {
  let news = await RedisCaching("news", NewsCache);

  socket.send([opcode, ...string("Login Notice"), ...news]);
};

async function NewsCache() {
  let news = await News.find().exec();

  return string(news.map((x) => x.title + "#" + x.message + "#").join(""));
}
