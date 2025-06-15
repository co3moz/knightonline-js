import type { IGameSocket } from "../game_socket.js";
import { short, int } from "../../core/utils/unit.js";
import { RegionSend } from "../region.js";
import type { ICharacterItem } from "../../core/database/models/index.js";

export function SendLookChange(
  socket: IGameSocket,
  pos: number,
  item: ICharacterItem
) {
  RegionSend(socket, [
    0x2d, // look change
    ...short(socket.session),
    pos,
    ...int(item ? item.id : 0),
    ...short(item ? item.durability : 0),
  ]);
}
