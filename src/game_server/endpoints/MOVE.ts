import { IGameEndpoint } from "../endpoint";
import { IGameSocket } from "../game_socket";
import { Queue, short } from "../../core/utils/unit";
import { RegionUpdate, RegionSend } from "../region";
import { SendMessageToPlayer } from "../functions/sendChatMessage";

export const MOVE: IGameEndpoint = async function (socket: IGameSocket, body: Queue, opcode: number) {
  let c = socket.character;

  let willX = body.short();
  let willZ = body.short();
  let willY = body.short();
  let speed = body.short();
  let echo = body.byte();
  let newX = body.short();
  let newZ = body.short();
  let newY = body.short();

  let realX = newX / 10;
  let realZ = newZ / 10;
  let realY = newY / 10;


  let rwillX = willX / 10;
  let rwillZ = willZ / 10;
  let rwillY = willY / 10;

  c.x = realX;
  c.z = realZ;
  c.y = realY;

  // TODO: do this right way :)

  RegionUpdate(socket);

  RegionSend(socket, [
    opcode,
    ...short(socket.session),
    ...short(willX),
    ...short(willZ),
    ...short(willY),
    ...short(speed),
    echo,
    ...short(newX),
    ...short(newZ),
    ...short(newY)
  ]);



  let text = (realX + ' ' + realZ + ' ' + realY + ' | W ' + rwillX + ' ' + rwillZ + ' ' + rwillY + ' | ' + speed);
  console.log('MOVE REAL ' + text);
  SendMessageToPlayer(socket, 7, 'MOVE', text);
}