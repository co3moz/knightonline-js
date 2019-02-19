import * as config from 'config'
import { Database } from '../core/database'
import { RedisConnect } from '../core/redis/connect'
import { KOServerFactory } from '../core/server';
import { Queue } from '../core/utils/unit';
import { GameEndpointCodes, GameEndpoint } from './endpoint';
import { IGameSocket } from './game_socket';
import { UserMap, CharacterMap, LoadSetItems } from './shared';
import { RegionExit } from './region';
import { AISystemStart } from './ai_system/start';

export default async function GameServer() {
  console.log('game server is going to start...');
  await Database();
  await RedisConnect();

  await LoadSetItems(); // load set items to memory
  
  // region.setOnChange(require('./functions/onRegionUpdate'));
  // region.setOnExit(require('./functions/onUserExit'));
  
  await AISystemStart();

  return await KOServerFactory({
    ip: config.get('gameServer.ip'),
    ports: config.get('gameServer.ports'),
    timeout: 5000,

    onConnect: (socket: IGameSocket) => {
    },

    onDisconnect: async (socket: IGameSocket) => {
      if (socket.account) {
        if (UserMap[socket.account.account]) {
          delete UserMap[socket.account.account];
        }
      }

      if (socket.character) {
        RegionExit(socket);
        if (CharacterMap[socket.character.name]) {
          delete CharacterMap[socket.character.name];
        }
      }
    },

    onData: async (socket: IGameSocket, data: Buffer) => {
      let body = Queue.from(data);
      let opcode = body.byte();
      if (!GameEndpointCodes[opcode]) return;

      let endpoint = GameEndpoint(GameEndpointCodes[opcode]);
      if (!endpoint) return;

      // await endpoint(socket, body, opcode)
    }
  });
}



