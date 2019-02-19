import { Queue } from '../../core/utils/unit';
import { IGameEndpoint } from '../endpoint';
import { IGameSocket } from '../game_socket';

export const ZONE_CHANGE: IGameEndpoint = async function (socket: IGameSocket, body: Queue, opcode: number) {
  let subOpcode = body.byte();

  if (subOpcode == ZoneChangeEnum.LOADING) {
    socket.send([
      opcode, ZoneChangeEnum.LOADED
    ]);
  } else if (subOpcode == ZoneChangeEnum.LOADED) {
    sendRegionPlayers(socket, true);
    sendBlinkStart(socket);
  }
}

export enum ZoneChangeEnum {
  LOADING = 1,
  LOADED = 2,
  TELEPORT = 3,
  MILITARY = 4
}