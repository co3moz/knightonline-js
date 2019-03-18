import * as config from 'config'
import * as fastify from 'fastify'
import { avgNPC, avgGC, avgDrop, tick } from '../game_server/events/onServerTick';
import GameServer from '../game_server/server';
import { UserMap, CharacterMap } from '../game_server/shared';
import { RUserMap } from '../game_server/region';
import { NPCUUID } from '../game_server/ai_system/uuid';

export default async function WebServer() {
  const app = fastify();

  app.get('/stats', async (request, reply) => ({
    connected: {
      npc: NPCUUID.reservedSize(),
      session: (await GameServer()).params.idPool.reservedSize(),
      logon: Object.keys(UserMap).length,
      ingame: Object.keys(CharacterMap).length
    },
    tick: {
      current: tick,
      gc: {
        avg: avgGC.avg(),
        values: avgGC.values().slice(0, 5)
      },
      npc: {
        avg: avgNPC.avg(),
        values: avgNPC.values().slice(0, 5)
      },
      drop: {
        avg: avgDrop.avg(),
        values: avgDrop.values().slice(0, 5)
      }
    }
  }));

  app.get('/users', async (request, reply) => (Object.keys(CharacterMap)));

  app.get('/users/:id', async (request, reply) => {
    let socket = CharacterMap[request.params.id];

    if (socket) {
      return socket.character.toJSON();
    } else {
      reply.code(404);
      return null;
    }
  });

  console.log('[WEB] Server started! (%s)', await app.listen(config.get('web.port'), config.get('web.ip')));

  return app;
}  