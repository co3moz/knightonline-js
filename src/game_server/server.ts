import * as config from 'config'
import { Database } from '../core/database'
import { RedisConnect } from '../core/redis/connect'
import { KOServerFactory, IKOServer } from '../core/server';
import { Queue } from '../core/utils/unit';
import { GameEndpointCodes, GameEndpoint } from './endpoint';
import { IGameSocket } from './game_socket';
import { UserMap, CharacterMap, LoadSetItems } from './shared';
import { RegionRemove } from './region';
import { AISystemStart } from './ai_system/start';
import { OnUserExit } from './events/onUserExit';

export default async function GameServer() {
  console.log('[SERVER] Game server is going to start...');
  await Database();
  await RedisConnect();

  await LoadSetItems(); // load set items to memory

  await AISystemStart();

  return await KOServerFactory({
    ip: config.get('gameServer.ip'),
    ports: config.get('gameServer.ports'),
    timeout: 5000,

    onConnect: (socket: IGameSocket) => {
    },

    onDisconnect: async (socket: IGameSocket) => {
      try {
        await OnUserExit(socket);
      } catch (e) {
        console.error('[ERROR] Saving failed for user! ' + socket.session);
        console.error(e);
      }
      
      RegionRemove(socket);

      if (socket.user) {
        if (UserMap[socket.user.account]) {
          delete UserMap[socket.user.account];
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
      if (!GameEndpointCodes[opcode]) {
        return console.log('[SERVER] Unknown opcode received! (0x' + (opcode ? opcode.toString(16).padStart(2, '0') : '00') + ') | ' + body.array().map(x => (x < 16 ? '0' : '') + x.toString(16).toUpperCase()).join(' '));
      }

      let endpoint = GameEndpoint(GameEndpointCodes[opcode]);
      if (!endpoint) return;

      await endpoint(socket, body, opcode)
    }
  });
}



