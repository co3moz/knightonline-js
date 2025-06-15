import type { IGameSocket } from "../game_socket.js";
import { SendAbility } from "./sendAbility.js";
import { RegionSend } from "../region.js";
import { short, long, int } from "../../core/utils/unit.js";
import { GetLevelUp } from "./getLevelUp.js";

export function SendLevelChange(socket: IGameSocket, newLevel: number) {
  if (newLevel < 1 || newLevel > 83) return;

  let c = socket.character;
  let currentLevel = c.level;
  if (currentLevel == newLevel) return;

  let statTotal = 300 + (newLevel - 1) * 3; // each level gives 3 stat point
  let skillTotal = (newLevel - 9) * 2;

  if (newLevel > 60) {
    statTotal += 2 * (newLevel - 60); // after 60 level each level gives 5 so we increment "+2"
  }

  if (newLevel > currentLevel) {
    let { statStr, statHp, statDex, statMp, statInt, statRemaining } = c;
    let userStatTotal =
      statStr + statHp + statDex + statMp + statInt + statRemaining;

    let {
      skillPointCat1,
      skillPointCat2,
      skillPointCat3,
      skillPointMaster,
      skillPointFree,
    } = c;
    let userSkillTotal =
      skillPointCat1 +
      skillPointCat2 +
      skillPointCat3 +
      skillPointMaster +
      skillPointFree;

    let statGain = Math.max(0, statTotal - userStatTotal);
    let skillGain = Math.max(0, skillTotal - userSkillTotal);

    c.statRemaining += statGain;
    c.skillPointFree += skillGain;
  }

  c.level = newLevel;

  SendAbility(socket, false);

  let v = socket.variables;

  c.hp = v.maxHp; // level up so give hp
  c.mp = v.maxMp; // level up so give mp

  RegionSend(socket, [
    0x1b, // Level change
    ...short(socket.session),
    newLevel,
    ...short(c.statRemaining),
    c.skillPointFree,
    ...long(GetLevelUp(newLevel)),
    ...long(c.exp),
    ...short(v.maxHp || 0),
    ...short(c.hp),
    ...short(v.maxMp || 0),
    ...short(c.mp),
    ...int(v.maxWeight),
    ...int(v.itemWeight),
  ]);
}
