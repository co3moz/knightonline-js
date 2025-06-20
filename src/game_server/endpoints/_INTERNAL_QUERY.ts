import type { IGameEndpoint } from "../endpoint.js";
import type { IGameSocket } from "../game_socket.js";
import { Queue, short, string } from "../../core/utils/unit.js";
import crypto from "crypto";
import config from "config";
import { RUserMap } from "../region.js";
import { UserMap } from "../shared.js";

const internalCommunicationSecret = <string>(
  config.get("gameServer.internalCommunicationSecret")
);
// TODO: DESTROY THIS FILE, IMPLEMENT BETTER WAY like IPC or redis subscription

export const _INTERNAL_QUERY: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  let hash = body.sub(20);

  if (hash.length != 20) {
    socket.terminate("internal_query_access!!!! invalid hash length");
    return;
  }

  if (
    Buffer.from(hash).toString("hex") !=
    crypto
      .createHmac("sha1", internalCommunicationSecret)
      .update(Buffer.from(body.array()))
      .digest("hex")
  ) {
    socket.terminate("internal_query_access!!!! invalid hash");
    return;
  }

  let subOpcode = body.byte();
  let result = null;

  if (subOpcode == 1) {
    // get user count
    let users = Object.keys(RUserMap);
    result = [subOpcode, ...short(users.length)];
  } else if (subOpcode == 2) {
    // check online
    let requestedAccount = body.string();

    result = [subOpcode, +!!UserMap[requestedAccount]];
  } else if (subOpcode == 3) {
    // terminate user
    let requestedAccount = body.string();
    let remoteAddress = body.string();
    let um = UserMap[requestedAccount];
    result = [subOpcode, +!!um];

    if (um) {
      um.send([
        0x10,
        7,
        um.user.nation,
        0,
        0,
        0,
        ...string(
          "[SERVER] Hesabiniza " +
            remoteAddress +
            " ip adresinden yeni bir baglanti yapildi!",
          "ascii"
        ),
      ]);

      await new Promise((r) => setTimeout(r, 100));
      await um.terminate("another login request");
    }
  } else {
    result = [0xff];
  }

  socket.send([opcode, ...result]);
};
