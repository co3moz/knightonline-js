import { Queue } from "../../core/utils/unit.js";
import type { ILoginSocket } from "../login_socket.js";
import type { ILoginEndpoint } from "../endpoint.js";
import { Crypt } from "../../core/utils/crypt.js";

export const CRYPTION: ILoginEndpoint = async function (
  socket: ILoginSocket,
  body: Queue,
  opcode: number
) {
  if (!socket.cryption) {
    socket.cryption = Crypt.createInstance();
  }

  socket.send([opcode, ...socket.cryption.publicKey()]);
};
