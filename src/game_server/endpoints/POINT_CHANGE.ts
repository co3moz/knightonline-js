import { Queue, short } from "../../core/utils/unit";
import type { IGameEndpoint } from "../endpoint";
import type { IGameSocket } from "../game_socket";
import { SendAbility } from "../functions/sendAbility";

export const POINT_CHANGE: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  let type = body.byte();

  let stat = StatType[type - 1];

  let c = socket.character;
  let v = socket.variables;
  if (!stat || !c.statRemaining || c[stat] == 255) return;

  c[stat] += 1;
  c.statRemaining--;
  c.markModified(stat);

  SendAbility(socket);

  socket.send([
    opcode,
    type,
    ...short(c[stat]),
    ...short(v.maxHp),
    ...short(v.maxMp),
    ...short(v.totalHit),
    ...short(v.maxWeight),
  ]);
};

enum StatType {
  statStr = 0,
  statHp = 1,
  statDex = 2,
  statMp = 3,
  statInt = 4,
}
