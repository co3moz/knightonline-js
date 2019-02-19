import { INpc, ISpawn } from "../../core/database/models";
import { INPCInstance } from "./declare";
import { NPCUUID } from "./uuid";
import { RegionUpdateNPC } from "../region";


export async function SummonNPC(npc: INpc, spawn: ISpawn) {
  if (!npc) return;
  if (!spawn) return;

  let npcObj: INPCInstance = {
    npc,
    spawn,

    uuid: NPCUUID.reserve(),
    zone: spawn.zone,
    x: random(spawn.leftX, spawn.rightX),
    z: random(spawn.topZ, spawn.bottomZ),
    direction: spawn.direction,
    hp: npc.hp,
    mp: npc.mp,
    maxHp: npc.hp,
    maxMp: npc.mp,
  };

  RegionUpdateNPC(npcObj);

  return npcObj;
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}