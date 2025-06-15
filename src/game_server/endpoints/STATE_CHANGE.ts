import type { IGameEndpoint } from "../endpoint.js";
import type { IGameSocket } from "../game_socket.js";
import { Queue } from "../../core/utils/unit.js";
import { SendStateChange } from "../functions/sendStateChange.js";

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
