import { IGameEndpoint } from "../endpoint";
import { IGameSocket } from "../game_socket";
import { Queue, string } from "../../core/utils/unit";

export const MAGIC_PROCESS: IGameEndpoint = async function (socket: IGameSocket, body: Queue, opcode: number) {
  console.log(body, opcode);
}