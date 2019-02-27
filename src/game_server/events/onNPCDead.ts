import { INPCInstance } from "../ai_system/declare";
import { RegionRemoveNPC, RegionSendByNpc, RSessionMap, RegionQueryUsersByNpc } from "../region";
import { short, int } from "../../core/utils/unit";
import { SendExperienceChange } from "../functions/sendExperienceChange";
import { ItemDropGroups } from "../var/item_drop_groups";
import { SendMessageToPlayer } from "../functions/sendChatMessage";
import { Item } from "../../core/database/models";
import { CreateDrop } from "../drop";
import { IGameSocket } from "../game_socket";
import { NPCMap, NPCUUID } from "../ai_system/uuid";

const ARROW_MIN = 391010000;
const ARROW_MAX = 392010000;

export function OnNPCDead(npc: INPCInstance) {
  if (npc.status == 'dead') return;

  npc.status = 'dead';

  RegionRemoveNPC(npc);

  const npcDeadPacket = [
    0x11, // dead
    ...short(npc.uuid)
  ];

  for (let s of RegionQueryUsersByNpc(npc)) {
    delete s.visibleNPCs[npc.uuid];
    s.send(npcDeadPacket);
  }

  if (npc.spawn.respawnTime) {
    npc.wait = npc.spawn.respawnTime * 1000;
  } else {
    delete NPCMap[npc.uuid];

    setTimeout(function () {
      NPCUUID.free(npc.uuid);
    }, 2000);
  }

  let exp = npc.npc.exp;
  let hp = npc.npc.hp;
  let greatestDamage: number = 0;
  let greatestSession: IGameSocket = null;
  for (let session in npc.damagedBy) {
    let userSocket = RSessionMap[session];

    if (userSocket) { // still online
      let damage = npc.damagedBy[session];
      if (greatestDamage < damage) {
        greatestDamage = damage;
        greatestSession = userSocket;
      }

      SendExperienceChange(userSocket, (exp * damage / hp) | 0);
    }
  }

  delete npc.damagedBy;

  if (greatestSession) { // you earned the drop :)
    let dropped = [];

    if (npc.npc.money) {
      let money = npc.npc.money * (Math.random() * 0.3 + 0.7);

      if (money > 0) {
        dropped.push({
          item: 900000000,
          amount: Math.min(32000, money | 0) // amount is short, so we limit the max output
        });
      }
    }

    if (npc.npc.drops && npc.npc.drops.length > 0) {
      for (let drop of npc.npc.drops) {
        let idx = drop.item;
        let luck = Math.random();
        if (luck > drop.rate) { // unlucky
          continue;
        }

        if (idx > 100000000) { // regular item so we can give it directly
          let amount = 1;

          if (idx >= ARROW_MIN && idx <= ARROW_MAX) {
            amount = 20 + ((Math.random() * 30) | 0);
          }

          dropped.push({
            item: idx,
            amount: amount
          })
        } else if (idx < 100) { // this range is for 

        } else { // item has to be in a group, if it isnt than we dont care
          let pickItemInGroup: number[] = ItemDropGroups[idx];
          if (pickItemInGroup) {
            let picked = pickItemInGroup[Math.random() * pickItemInGroup.length | 0];

            dropped.push({
              item: picked,
              amount: 1
            });
          }
        }
      }
    }

    if (dropped.length) {
      SendMessageToPlayer(greatestSession, 1, 'DROP', 'should be visible', undefined, -1);

      let itemIds = dropped.map(x => x.item).filter(x => x != 900000000);


      if (itemIds.length > 0) {
        Item.find({
          id: {
            $in: itemIds
          }
        }).then(items => {
          let wrap = CreateDrop([greatestSession.session], dropped, items);

          greatestSession.send([
            0x23, // ITEM_DROP
            ...short(npc.uuid),
            ...int(wrap), // bundle id
            2
          ]);
        }).catch(x => {

        });
      } else {
        greatestSession.send([
          0x23, // ITEM_DROP
          ...short(npc.uuid),
          ...int(CreateDrop([greatestSession.session], dropped)), // bundle id
          2
        ]);
      }


    }
  }
}