import { IGameSocket } from "../game_socket";
import { short } from "../../core/utils/unit";

export function SendTime(socket: IGameSocket): void {
  let now = new Date();

  // 0x13, then year, month, day, hours, mins as short
  socket.send([
    0x13,
    ...short(now.getFullYear()),
    now.getMonth() + 1, 0,
    now.getDate(), 0,
    now.getHours(), 0,
    now.getMinutes(), 0
  ]);
}