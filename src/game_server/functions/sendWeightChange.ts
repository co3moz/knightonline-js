import type { IGameSocket } from "../game_socket.js";
import { int } from "../../core/utils/unit.js";

export function SendWeightChange(socket: IGameSocket): void {
  socket.send([
    0x54, // WEIGHT_CHANGE
    ...int(socket.variables.itemWeight),
  ]);
}
