import { IGameSocket } from "../game_socket";
import { short, int } from "../../core/utils/unit";

export function SendItemMove(socket: IGameSocket, command: number) {
  let v = socket.variables;

  if (!command) {
    socket.send([
      0x1F, 1
    ])
  } else {
    socket.send([
      0x1F, 1, command,
      ...short(v.totalHit),
      ...short(v.totalAc),
      ...int(v.maxWeight),
      1,
      ...short(v.maxHp),
      ...short(v.maxMp),
      ...short(v.statBonus[0] + v.statBuffBonus[0]),
      ...short(v.statBonus[1] + v.statBuffBonus[1]),
      ...short(v.statBonus[2] + v.statBuffBonus[2]),
      ...short(v.statBonus[3] + v.statBuffBonus[3]),
      ...short(v.statBonus[4] + v.statBuffBonus[4]),
      ...short(v.fireR),
      ...short(v.coldR),
      ...short(v.lightningR),
      ...short(v.magicR),
      ...short(v.curseR),
      ...short(v.poisonR)
    ])
  }
}