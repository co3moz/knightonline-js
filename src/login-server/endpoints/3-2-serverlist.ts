import { string, short } from "../../core/utils/unit.js";
import { Server } from "../../core/database/models/index.js";
import { RedisCaching } from "../../core/redis/cache.js";
import { addLoginServerEndpoint, LoginEndpointCodes } from "../endpoint.js";

addLoginServerEndpoint(LoginEndpointCodes.SERVERLIST, async function () {
  let echo = this.body.short();

  let servers = await RedisCaching("servers", ServersCache);

  return [LoginEndpointCodes.SERVERLIST, ...short(echo), ...servers];
});

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
