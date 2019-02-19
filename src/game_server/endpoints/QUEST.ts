import { IGameEndpoint } from "../endpoint";
import { IGameSocket } from "../game_socket";
import { Queue } from "../../core/utils/unit";

export const QUEST: IGameEndpoint = async function (socket: IGameSocket, body: Queue, opcode: number) {
  // TODO: solve this
}