import type { IGameEndpoint } from "../endpoint.js";
import type { IGameSocket } from "../game_socket.js";
import { Queue, short } from "../../core/utils/unit.js";
import { RNPCMap } from "../region.js";
import { BuildNPCDetail } from "../functions/buildNPCDetail.js";

export const NPC_DETAILED_REQUEST: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  let length = body.short();
  if (length > 1000) length = 1000;

  let result = [opcode, 0, 0];
  let count = 0;

  for (let i = 0; i < length; i++) {
    let uuid = body.short();
    let npc = RNPCMap[uuid];
    if (npc) {
      count++;
      result.push(...short(uuid));
      result.push(...BuildNPCDetail(npc.npc));
    }
  }

  result[1] = count & 0xff;
  result[2] = count >>> 8;

  socket.send(result);
};
