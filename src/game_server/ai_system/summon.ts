import { INpc, ISpawn } from "../../core/database/models";
import { INPCInstance } from "./declare";
import { NPCUUID, NPCMap } from "./uuid";
import { RegionUpdateNPC } from "../region";


export function SummonNPC(npc: INpc, spawn: ISpawn) {
  let npcObj: INPCInstance = <any>{
    npc,
    spawn,

    status: 'init',
    uuid: NPCUUID.reserve(),
    timestamp: Date.now(),
    wait: 0
  };

  NPCMap[npcObj.uuid] = npcObj;

  return npcObj;
}