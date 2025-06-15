import type { INpc, ISpawn } from "@/models";
import type { INPCInstance } from "./declare.js";
import { NPCUUID, NPCMap } from "./uuid.js";

export function SummonNPC(npc: INpc, spawn: ISpawn) {
  let npcObj: INPCInstance = <any>{
    npc,
    spawn,

    status: "init",
    uuid: NPCUUID.reserve(),
    timestamp: Date.now(),
    wait: 0,
  };

  NPCMap[npcObj.uuid] = npcObj;

  return npcObj;
}
