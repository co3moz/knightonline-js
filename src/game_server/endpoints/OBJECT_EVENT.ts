import { Queue, int } from '../../core/utils/unit';
import { IGameEndpoint } from '../endpoint';
import { IGameSocket } from '../game_socket';
import { ObjectEvent } from '../var/object_event';

export const OBJECT_EVENT: IGameEndpoint = async function (socket: IGameSocket, body: Queue, opcode: number) {
  console.log(opcode);

  const objectIndex = body.short();
  const nId = body.short();

  console.log(objectIndex, nId);
}