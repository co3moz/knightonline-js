import type { IGameSocket } from "../game_socket.js";
import { GetLevelUp } from "./getLevelUp.js";
import { SendLevelChange } from "./sendLevelChange.js";
import { long } from "../../core/utils/unit.js";

export function SendExperienceChange(socket: IGameSocket, experience: number) {
  if (experience <= 0) return; // TODO: handle this case later

  let c = socket.character;

  // TODO: Handle premium exp percentage

  c.exp += experience;

  let maxExp = GetLevelUp(c.level);

  if (c.exp > maxExp) {
    if (c.level < 83) {
      c.exp -= maxExp;
      return SendLevelChange(socket, c.level + 1);
    } else {
      c.exp = maxExp;
    }
  }

  // Yeah, user might not gain any exp because of maxExp. But we will report no matter what..
  socket.send([
    0x1a, // EXP_CHANGE OPCODE
    0,
    ...long(c.exp),
  ]);
}
