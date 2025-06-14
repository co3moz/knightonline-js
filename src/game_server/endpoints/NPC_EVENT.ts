import { Queue, short, int } from "../../core/utils/unit";
import type { IGameEndpoint } from "../endpoint";
import type { IGameSocket } from "../game_socket";
import { type INPCInstance, NPCType } from "../ai_system/declare";
import { NPCMap } from "../ai_system/uuid";

export const NPC_EVENT: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  let unk = body.byte();
  let npcID = body.short();
  let questID = body.int();

  let npc: INPCInstance = NPCMap[npcID];

  if (!npc) return; // TODO: make more controls

  let npcType: NPCType = npc.npc.type;
  switch (npcType) {
    case NPCType.NPC_MERCHANT:
    case NPCType.NPC_TINKER:
      socket.send([
        NPCType.NPC_MERCHANT ? 0x25 : 0x3a,
        ...int(npc.npc.sellingGroup | 0),
      ]);
      break;
    case NPCType.NPC_MARK:
    case NPCType.NPC_RENTAL:
    case NPCType.NPC_ELECTION:
    case NPCType.NPC_TREASURY:
    case NPCType.NPC_SIEGE:
    case NPCType.NPC_SIEGE_1:
    case NPCType.NPC_VICTORY_GATE:
    case NPCType.NPC_BORDER_MONUMENT:
    case NPCType.NPC_CLAN:
      // TODO: HANDLE
      break;
    case NPCType.NPC_CAPTAIN:
      socket.send([0x34, 0x01]);
      break;
    case NPCType.NPC_WAREHOUSE:
      socket.send([0x45, 0x10]);
      break;
    case NPCType.NPC_CHAOTIC_GENERATOR:
    case NPCType.NPC_CHAOTIC_GENERATOR2:
      socket.send([0x5b, 4, ...short(npc.uuid)]);
      break;
    case NPCType.NPC_KJWAR:
      socket.send([0x85, 1, 7]);
      break;
    default:
      console.log(
        "[NPC_EVENT] Handle this request. npc:" + npcID + " quest:" + questID
      );
      break;
  }
};
