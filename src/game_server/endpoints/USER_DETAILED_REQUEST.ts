import type { IGameEndpoint } from "../endpoint.js";
import type { IGameSocket } from "../game_socket.js";
import { Queue } from "../../core/utils/unit.js";
import { SendRegionUserInDetailMultiple } from "../functions/sendRegionInOut.js";

export const USER_DETAILED_REQUEST: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  let sessioncount = body.short();
  let sessions = [];

  for (let i = 0; i < sessioncount; i++) {
    sessions.push(body.short());
  }

  SendRegionUserInDetailMultiple(socket, sessions);
};
