import { IGameEndpoint } from "../endpoint";
import { IGameSocket } from "../game_socket";
import { Queue } from "../../core/utils/unit";
import { SendRegionUserInDetailMultiple } from "../functions/sendRegionInOut";

export const USER_DETAILED_REQUEST: IGameEndpoint = async function (socket: IGameSocket, body: Queue, opcode: number) {
  let sessioncount = body.short();
  let sessions = [];

  for (let i = 0; i < sessioncount; i++) {
    sessions.push(body.short());
  }

  SendRegionUserInDetailMultiple(socket, sessions);
}