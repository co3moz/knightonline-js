import type { IGameSocket } from "../game_socket";
import { short, int } from "../../core/utils/unit";
import { RegionSend } from "../region";
import type { ICharacterItem } from "../../core/database/models";

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
