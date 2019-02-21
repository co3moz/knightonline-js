import { IGameEndpoint } from "../endpoint";
import { IGameSocket } from "../game_socket";
import { SendMessageToPlayer } from "../functions/sendChatMessage";
import { Queue, short } from "../../core/utils/unit";
import { RegionSend } from "../region";

export const ROTATE: IGameEndpoint = async function (socket: IGameSocket, body: Queue, opcode: number) {
  let c = socket.character;

  if (!c) return;

  let direction = body.short();
  c.direction = direction;

  SendMessageToPlayer(socket, 1, 'DIRECTION', 'value: ' + direction, socket.user.nation, -1)

  RegionSend(socket, [
    opcode,
    ...short(socket.session),
    ...short(direction),
  ]);
}