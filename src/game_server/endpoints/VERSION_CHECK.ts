import config from "config";
import type { IGameEndpoint } from "../endpoint";
import type { IGameSocket } from "../game_socket";
import { Queue, short } from "../../core/utils/unit";
import { Crypt } from "../../core/utils/crypt";

const clientExeVersion = <number>config.get("gameServer.clientExeVersion");

export const VERSION_CHECK: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  if (!socket.cryption) {
    socket.cryption = Crypt.createInstance();
  }

  socket.send([
    opcode,
    0,
    ...short(clientExeVersion), // tell client the expected exe version
    ...socket.cryption.publicKey(),
    0, // 0: ok, 1: ng
  ]);
};
