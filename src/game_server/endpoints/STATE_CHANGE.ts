import type { IGameEndpoint } from "../endpoint";
import type { IGameSocket } from "../game_socket";
import { Queue } from "../../core/utils/unit";
import { SendStateChange } from "../functions/sendStateChange";

export const STATE_CHANGE: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  let subOpcode = body.byte();
  let value = body.int();

  if (subOpcode == 1) {
    SendStateChange(socket, subOpcode, value);
  }
};
