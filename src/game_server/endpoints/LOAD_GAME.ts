import type { IGameEndpoint } from "../endpoint.js";
import type { IGameSocket } from "../game_socket.js";
import { Queue } from "../../core/utils/unit.js";

export const LOAD_GAME: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  socket.send([
    opcode,
    1,
    0,
    0,
    0,
    0, //unit.int(0)
  ]);
};
