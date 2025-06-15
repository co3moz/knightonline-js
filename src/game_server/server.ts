import config from "config";
import { Database } from "@/database";
import { KOServerFactory, type IKOServer } from "../core/server.js";
import { Queue } from "../core/utils/unit.js";
import { GameEndpointCodes, GameEndpoint } from "./endpoint.js";
import type { IGameSocket } from "./game_socket.js";
import { UserMap, CharacterMap, LoadSetItems } from "./shared.js";
import { RegionRemove } from "./region.js";
import { AISystemStart } from "./ai_system/start.js";
import { OnUserExit } from "./events/onUserExit.js";
import { RedisConnect } from "@/redis";

let gameServerCache: IKOServer = null;
export async function GameServer() {
  if (gameServerCache) return gameServerCache;

  console.log("[SERVER] Game server is going to start...");
  await Database();
  await RedisConnect();

  await LoadSetItems(); // load set items to memory

  await AISystemStart();

  return (gameServerCache = (
    await KOServerFactory({
      ip: config.get("gameServer.ip"),
      ports: config.get("gameServer.ports"),
      timeout: 5000,

      onConnect: (socket: IGameSocket) => {},

      onDisconnect: async (socket: IGameSocket) => {
        try {
          await OnUserExit(socket);
        } catch (e) {
          console.error("[ERROR] Saving failed for user! " + socket.session);
          console.error(e);
        }

        RegionRemove(socket);

        if (socket.user) {
          if (UserMap[socket.user.account]) {
            delete UserMap[socket.user.account];
          }

          if (socket.character) {
            console.log(
              "[GAME] Character disconnected (%s) from %s",
              socket.character.name,
              socket.remoteAddress
            );
          } else {
            console.log(
              "[GAME] Account disconnected (%s) from %s",
              socket.user.account,
              socket.remoteAddress
            );
          }
        }

        if (socket.character) {
          if (CharacterMap[socket.character.name]) {
            delete CharacterMap[socket.character.name];
          }
        }
      },

      onData: async (socket: IGameSocket, data: Buffer) => {
        let body = Queue.from(data);
        let opcode = body.byte();
        let endpointCode = GameEndpointCodes[opcode];
        if (!endpointCode) {
          return console.log(
            "[SERVER] Unknown opcode received! (0x" +
              (opcode ? opcode.toString(16).padStart(2, "0") : "00") +
              ") | " +
              body
                .array()
                .map((x) => (x < 16 ? "0" : "") + x.toString(16).toUpperCase())
                .join(" ")
          );
        }

        let endpoint = GameEndpoint(endpointCode);
        if (!endpoint) {
          return console.log(
            "[SERVER] Missing endpoint definition on endpoints/index.ts file! name: " +
              endpointCode
          );
        }

        await endpoint(socket, body, opcode);
      },
    })
  )[0]);
}
