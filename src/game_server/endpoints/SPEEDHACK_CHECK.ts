import type { IGameEndpoint } from "../endpoint";
import type { IGameSocket } from "../game_socket";
import { Queue } from "../../core/utils/unit";

export const SPEEDHACK_CHECK: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  // TODO: solve this
};
