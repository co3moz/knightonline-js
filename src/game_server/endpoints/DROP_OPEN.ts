import { IGameEndpoint } from "../endpoint";
import { IGameSocket } from "../game_socket";
import { Queue, int, short } from "../../core/utils/unit";
import { GetDrop } from "../drop";

export const DROP_OPEN: IGameEndpoint = async function (socket: IGameSocket, body: Queue, opcode: number) {
  let dropIndex = body.int();

  let drop = GetDrop(dropIndex);
  if (!drop) return;

  let session = socket.session;
  if (!drop.owners || drop.owners.findIndex(owner => owner == session) == -1) return;

  let result = [
    opcode,
    ...int(dropIndex), 1
  ];

  for (let i = 0; i < 6; i++) {
    let item = drop.dropped[i];
    if (item) {
      result.push(...int(item.item), ...short(item.amount));
    } else {
      result.push(0, 0, 0, 0, 0, 0);
    }
  }

  socket.send(result);
}