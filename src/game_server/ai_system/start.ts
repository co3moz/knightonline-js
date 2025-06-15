import { Npc } from "@/models";
import { NPCUUID, NPCMap } from "./uuid.js";
import type { INPCInstance } from "./declare.js";

let loaded = false;

export async function AISystemStart() {
  if (loaded) return;
  loaded = true;

  console.log("[NPC] loading..");
  let rawNpcs = await Npc.find({}).lean().select(["-_id"]).exec();

  let npcCount = 0;
  let monsterCount = 0;
  let skipped = 0;

  let now = Date.now();
  for (let npc of rawNpcs) {
    if (!npc.spawn.length) {
      skipped++;
      continue;
    }

    for (let spawn of npc.spawn) {
      if (spawn.zone == 21) {
        // rn do only moradon
        let amount = spawn.amount || 1;

        for (let i = 0; i < amount; i++) {
          npcCount++;
          if (npc.isMonster) monsterCount++;

          let npcObj: INPCInstance = <any>{
            npc,
            spawn,

            uuid: NPCUUID.reserve(),
            status: "init",
            timestamp: now,
            wait: 0,
          };

          NPCMap[npcObj.uuid] = npcObj;
        }
      } else {
        let amount = spawn.amount || 1;

        for (let i = 0; i < amount; i++) {
          skipped++;
        }
      }
    }
  }

  console.log(
    "[NPC] total: %d, mobs: %d, skipped: %d",
    npcCount,
    monsterCount,
    skipped
  );
}
