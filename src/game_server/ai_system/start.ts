import { Npc } from "../../core/database/models";
import { NPCUUID } from "./uuid";
import { RegionUpdateNPC } from "../region";
import { INPCInstance } from "./declare";

let loaded = false;

export async function AISystemStart() {
  if (loaded) return;
  loaded = true;

  console.log("[NPC] loading..");
  let rawNpcs = await Npc.find({}).exec();

  let npcCount = 0;
  let monsterCount = 0;
  let skipped = 0;

  for (let npc of rawNpcs) {
    if (!npc.spawn.length) {
      skipped++;
      continue;
    }

    for (let spawn of npc.spawn) {
      if (spawn.zone == 21) { // rn do only moradon
        let amount = spawn.amount || 1;

        for (let i = 0; i < amount; i++) {
          npcCount++;
          if (npc.isMonster) monsterCount++;

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
            maxMp: npc.mp
          };


          RegionUpdateNPC(npcObj);
        }
      } else {
        let amount = spawn.amount || 1;

        for (let i = 0; i < amount; i++) {
          skipped++;
        }
      }
    }
  }

  console.log("[NPC] total: %d, mobs: %d, skipped: %d", npcCount, monsterCount, skipped);
}


function random(min, max) {
  return Math.random() * (max - min) + min;
}