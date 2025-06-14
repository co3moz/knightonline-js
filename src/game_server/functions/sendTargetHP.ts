import type { IGameSocket } from "../game_socket";
import { RSessionMap, RNPCMap } from "../region";
import { short, int } from "../../core/utils/unit";

export function SendTargetHP(
  socket: IGameSocket,
  echo: number,
  damage: number
): void {
  if (socket.targetType == "user") {
    let targetSocket = RSessionMap[socket.target];

    if (targetSocket && targetSocket.variables) {
      let c = targetSocket.character;
      let v = targetSocket.variables;

      socket.send([
        0x22, // TARGET_HP
        ...short(socket.target),
        echo,
        ...int(v.maxHp || 0),
        ...int(c.hp),
        ...short(damage || 0),
      ]);
    } else {
      socket.target = 0;
      socket.targetType = "notarget";
    }
  } else if (socket.targetType == "npc") {
    let regionNPC = RNPCMap[socket.target];

    if (regionNPC) {
      let npc = regionNPC.npc;

      socket.send([
        0x22, // TARGET_HP
        ...short(socket.target),
        echo,
        ...int(npc.maxHp || 0),
        ...int(npc.hp),
        ...short(damage || 0),
      ]);
    } else {
      socket.target = 0;
      socket.targetType = "notarget";
    }
  }
}
