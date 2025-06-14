import { Queue, short } from "../../core/utils/unit";
import type { IGameEndpoint } from "../endpoint";
import type { IGameSocket } from "../game_socket";
import { RegionSend } from "../region";

export const HELMET_STATUS_CHANGE: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  if (socket.character.hp == 0) {
    return;
  }

  let v = socket.variables;
  v.isHelmetHiding = body.byte();
  v.isCospreHiding = body.byte();

  RegionSend(socket, [
    opcode,
    v.isHelmetHiding,
    v.isCospreHiding,
    ...short(socket.session),
  ]);
};
