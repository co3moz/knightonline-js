import { Queue } from "../../core/utils/unit";
import type { ILoginSocket } from "../login_socket";
import type { ILoginEndpoint } from "../endpoint";

export const UNK_REQ: ILoginEndpoint = async function (
  socket: ILoginSocket,
  body: Queue,
  opcode: number
) {
  socket.send([0xfd, 0, 0]);
};
