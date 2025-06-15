import { Queue } from "../../core/utils/unit.js";
import type { ILoginSocket } from "../login_socket.js";
import type { ILoginEndpoint } from "../endpoint.js";

export const UNK_REQ: ILoginEndpoint = async function (
  socket: ILoginSocket,
  body: Queue,
  opcode: number
) {
  socket.send([0xfd, 0, 0]);
};
