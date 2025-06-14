import { Queue } from "../../core/utils/unit";
import type { ILoginSocket } from "../login_socket";
import type { ILoginEndpoint } from "../endpoint";
import { Crypt } from "../../core/utils/crypt";

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
