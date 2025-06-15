import type { IGameSocket } from "../game_socket.js";
import { RegionSend } from "../region.js";
import { short, int } from "../../core/utils/unit.js";

export function SendStateChange(
  socket: IGameSocket,
  type: number,
  value: number
): void {
  let c = socket.character;
  let v = socket.variables;

  if (type == 1) {
    v.hptype = value;
  } else if (type == 3) {
    // v.old_abnormalType = v.abnormalType;

    // if (c.gm) {
    //   sendStateChange(socket, 5, 1);
    // }

    v.abnormalType = value;
  } else if (type == 5) {
    v.abnormalType = value;
  }

  RegionSend(socket, [
    0x29, // STATE_CHANGE
    ...short(socket.session),
    type,
    ...int(value),
  ]);
}

export enum UserStates {
  STANDING = 1,
  SITDOWN = 2,
  DEAD = 3,
  BLINKING = 4,
}

export enum AbnormalStates {
  INVISIBLE = 0,
  NORMAL = 1,
  GIANT = 2,
  DWARF = 3,
  BLINKING = 4,
  GIANT_TARGET = 6,
}
