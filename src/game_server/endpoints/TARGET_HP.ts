import type { IGameEndpoint } from "../endpoint.js";
import type { IGameSocket } from "../game_socket.js";
import { Queue } from "../../core/utils/unit.js";
import { SendMessageToPlayer } from "../functions/sendChatMessage.js";
import { RNPCMap } from "../region.js";
import { SendTargetHP } from "../functions/sendTargetHP.js";

export const TARGET_HP: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  let target = body.short();
  let echo = body.byte();

  socket.target = target;

  if (target >= 10000) {
    socket.targetType = "npc";

    if (socket.character.gm) {
      let regionNpc = RNPCMap[socket.target];
      if (regionNpc) {
        SendMessageToPlayer(
          socket,
          1,
          "[TARGET]",
          `id: ${regionNpc.npc.uuid}, name: ${regionNpc.npc.npc.name}, hp: ${regionNpc.npc.hp}`,
          undefined,
          -1
        );
      }
    }
  } else {
    socket.targetType = "user";
  }

  SendTargetHP(socket, echo, 0);
};
