import type { IGameSocket } from "../game_socket.js";
import { int, short } from "../../core/utils/unit.js";
import { CalculateUserAbilities } from "./sendAbility.js";
import { SendWeightChange } from "./sendWeightChange.js";

export function SendStackChange(
  socket: IGameSocket,
  itemId: number,
  count: number,
  durability: number,
  pos: number,
  newItem: boolean,
  expirationTime: number
) {
  socket.send([
    0x3d, // ITEM COUNT CHANGE
    ...short(1),
    1,
    pos,
    ...int(itemId),
    ...int(count),
    newItem ? 100 : 0,
    ...short(durability),
    ...int(0),
    ...int(expirationTime),
    0,
    0,
  ]);

  CalculateUserAbilities(socket);
  SendWeightChange(socket);

  return true;
}
