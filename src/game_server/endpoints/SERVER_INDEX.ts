import type { IGameEndpoint } from "../endpoint.js";
import type { IGameSocket } from "../game_socket.js";
import { Queue, short } from "../../core/utils/unit.js";

export const SERVER_INDEX: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  socket.send([opcode, 1, 0, ...short(1)]);
};
