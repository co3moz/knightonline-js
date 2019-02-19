import { IGameEndpoint } from "../endpoint";
import { IGameSocket } from "../game_socket";
import { Queue, short } from "../../core/utils/unit";


export const SERVER_INDEX: IGameEndpoint = async function (socket: IGameSocket, body: Queue, opcode: number) {
  socket.send([
    opcode,
    1, 0,
    ...short(1)
  ]);
}