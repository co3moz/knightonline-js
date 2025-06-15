import type { IGameEndpoint } from "../endpoint.js";
import type { IGameSocket } from "../game_socket.js";
import { Queue, short, int } from "../../core/utils/unit.js";

export const SKILLDATA: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  let subOpcode = body.byte();
  let c = socket.character;

  if (subOpcode == 2) {
    // load
    if (c.skillBar.length == 0) {
      return socket.send([
        opcode,
        2, // load
        0,
        0, // 0
      ]);
    }

    return socket.send([
      opcode,
      2, // load
      ...short(c.skillBar.length),
      ...[].concat(...c.skillBar.map((x) => int(x))),
    ]);
  } else if (subOpcode == 1) {
    // save
    let count = body.short();
    if (count < 0 || count > 64) {
      return;
    }

    let skills = [];

    for (let i = 0; i < count; i++) {
      skills.push(body.int());
    }

    c.skillBar = skills;
    c.markModified("skillBar");

    // no need to response
  }
};
