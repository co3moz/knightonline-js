import config from "config";
import { Database } from "../core/database/index.js";
import {
  KOServerFactory,
  type IKOServer,
  type IKOSocket,
} from "../core/server.js";
import { Queue } from "../core/utils/unit.js";
import {
  autoLoadLoginServerEndpoints,
  getLoginServerEndpoint,
} from "./endpoint.js";
import { RedisConnect } from "../core/redis/index.js";
import {
  getLatestVersion,
  getLoginServerIp,
  getLoginServerPorts,
} from "./login-config.js";

let loginServerCache: IKOServer[] = null;

export async function LoginServer() {
  if (loginServerCache) return loginServerCache;

  console.log("[SERVER] Login server is going to start...");
  await Database();
  await RedisConnect();

  console.log(
    "[SERVER] Looks like latest server version is " + getLatestVersion()
  );

  await autoLoadLoginServerEndpoints();

  return (loginServerCache = await KOServerFactory({
    ip: getLoginServerIp(),
    ports: getLoginServerPorts(),
    timeout: 5000,

    onData: async (socket: IKOSocket, data: Buffer) => {
      let body = Queue.from(data);
      let opcode = body.byte();

      const endpoint = getLoginServerEndpoint(opcode);
      if (!endpoint) return;

      const response = await endpoint.call({
        socket,
        body,
      });

      if (response && Array.isArray(response)) {
        socket.send(response);
      }
    },
  }));
}
