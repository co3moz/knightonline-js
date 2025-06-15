import config from "config";
import { Database } from "../core/database/index.js";
import { KOServerFactory, type IKOServer } from "../core/server.js";
import { Queue } from "../core/utils/unit.js";
import { LoginEndpointCodes, LoginEndpoint } from "./endpoint.js";
import type { ILoginSocket } from "./login_socket.js";
import { RedisConnect } from "../core/redis/index.js";

let loginServerCache: IKOServer[] = null;

export async function LoginServer() {
  if (loginServerCache) return loginServerCache;

  console.log("[SERVER] Login server is going to start...");
  await Database();
  await RedisConnect();

  let versions: any[] = config.get("loginServer.versions");
  let { version: serverVersion } = versions[versions.length - 1];

  console.log("[SERVER] Looks like latest server version is " + serverVersion);

  return (loginServerCache = await KOServerFactory({
    ip: config.get("loginServer.ip"),
    ports: config.get("loginServer.ports"),
    timeout: 5000,

    onData: async (socket: ILoginSocket, data: Buffer) => {
      let body = Queue.from(data);
      let opcode = body.byte();
      if (!LoginEndpointCodes[opcode]) return;

      let endpoint = LoginEndpoint(LoginEndpointCodes[opcode]);
      if (!endpoint) return;

      await endpoint(socket, body, opcode);
    },
  }));
}
