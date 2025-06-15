import type { IGameEndpoint } from "../endpoint.js";
import type { IGameSocket } from "../game_socket.js";
import { Queue, short } from "../../core/utils/unit.js";
import { RegionSend } from "../region.js";

export const ROTATE: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  let c = socket.character;

  if (!c) return;

  let direction = body.short();
  c.direction = direction;

  RegionSend(socket, [opcode, ...short(socket.session), ...short(direction)]);
};
