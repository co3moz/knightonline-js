import config from "config";
import fastify from "fastify";
import {
  avgNPC,
  avgGC,
  avgDrop,
  tick,
} from "../game_server/events/onServerTick.js";
import { GameServer } from "../game_server/server.js";
import { UserMap, CharacterMap } from "../game_server/shared.js";
import { NPCUUID } from "../game_server/ai_system/uuid.js";
import { Item, PrepareItems } from "../core/database/models/item.js";
import { SendItem } from "../game_server/functions/sendItem.js";

export async function WebServer() {
  const app = fastify({
    logger: true,
  });

  app.get("/stats", async (request, reply) => ({
    connected: {
      npc: NPCUUID.reservedSize(),
      session: (await GameServer()).params.idPool.reservedSize(),
      logon: Object.keys(UserMap).length,
      ingame: Object.keys(CharacterMap).length,
    },
    tick: {
      current: tick,
      gc: {
        avg: avgGC.avg(),
        values: avgGC.values().slice(0, 5),
      },
      npc: {
        avg: avgNPC.avg(),
        values: avgNPC.values().slice(0, 5),
      },
      drop: {
        avg: avgDrop.avg(),
        values: avgDrop.values().slice(0, 5),
      },
    },
  }));

  app.get("/users", async (request, reply) => Object.keys(CharacterMap));

  app.get<{
    Params: {
      id: string;
    };
  }>("/users/:id", async (request, reply) => {
    let socket = CharacterMap[request.params.id];

    if (socket) {
      return socket.character.toJSON();
    } else {
      reply.code(404);
      return null;
    }
  });

  app.get<{
    Params: {
      id: string;
      itemId: number;
    };
  }>("/users/:id/give-item/:itemId", async (request, reply) => {
    let socket = CharacterMap[request.params.id];

    if (socket) {
      await PrepareItems([+request.params.itemId]);
      const result = SendItem(socket, request.params.itemId, 1);

      return result;
    } else {
      reply.code(404);
      return null;
    }
  });

  console.log(
    "[WEB] Server started! (%s)",
    await app.listen({
      host: config.get("web.host"),
      port: config.get("web.port"),
    })
  );

  return app;
}
