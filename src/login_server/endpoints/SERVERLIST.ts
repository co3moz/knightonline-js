import { Queue, string, short } from "../../core/utils/unit";
import type { ILoginSocket } from "../login_socket";
import { Server } from "../../core/database/models";
import { RedisCaching } from "../../core/redis/cache";
import type { ILoginEndpoint } from "../endpoint";

export const SERVERLIST: ILoginEndpoint = async function (
  socket: ILoginSocket,
  body: Queue,
  opcode: number
) {
  let echo = body.short();

  let servers = await RedisCaching("servers", ServersCache);

  socket.send([opcode, ...short(echo), ...servers]);
};

async function ServersCache() {
  let servers = await Server.find().lean().exec();

  return [servers.length].concat(
    ...servers.map((server) => [
      ...string(server.ip),
      ...string(server.lanip),
      ...string(server.name),
      ...short(server.onlineCount),
      ...short(1 /** server id */),
      ...short(1 /** group id */),
      ...short(server.userPremiumLimit),
      ...short(server.userFreeLimit),
      0,
      ...string(server.karusKing),
      ...string(server.karusNotice),
      ...string(server.elmoradKing),
      ...string(server.elmoradNotice),
    ])
  );
}
