import { IGameSocket } from "../game_socket";
import { int } from "../../core/utils/unit";

export function SendWeightChange(socket: IGameSocket): void {
  socket.send([
    0x54, // WEIGHT_CHANGE
    ...int(socket.variables.itemWeight)
  ])
}