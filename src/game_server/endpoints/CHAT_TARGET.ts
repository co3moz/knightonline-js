import type { IGameEndpoint } from "../endpoint.js";
import type { IGameSocket } from "../game_socket.js";
import { Queue, string } from "../../core/utils/unit.js";
import { GM_COMMANDS_HEADER } from "../functions/GMController.js";
import { RUserMap } from "../region.js";

export const CHAT_TARGET: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  let type = body.byte();

  if (type == 1) {
    let user = body.string();
    if (user == GM_COMMANDS_HEADER && socket.character.gm) {
      // allow gm chat with server
      socket.variables.chatTo = user;
      return socket.send([opcode, type, 1, 0, ...string(user)]);
    }

    let userSocket = RUserMap[user];
    if (!userSocket) {
      socket.variables.chatTo = null;
      return socket.send([opcode, type, 0, 0]);
    }

    // TODO: check blocking

    socket.variables.chatTo = user;

    return socket.send([opcode, type, 1, 0, ...string(user)]);
  }

  console.error(
    "CHAT_TARGET type#" + type + " data#" + body.array().join(", ")
  );
};
