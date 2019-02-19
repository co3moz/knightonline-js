import { IGameEndpoint } from "../endpoint";
import { IGameSocket } from "../game_socket";
import { Queue } from "../../core/utils/unit";

export const LOGIN: IGameEndpoint = async function (socket: IGameSocket, body: Queue, opcode: number) {
  socket.send([
    opcode,
    1,
    0, 0, 0, 0 //unit.int(0)
  ]);
}