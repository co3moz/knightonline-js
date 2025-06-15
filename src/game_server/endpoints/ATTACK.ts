import type { IGameEndpoint } from "../endpoint.js";
import type { IGameSocket } from "../game_socket.js";
import { Queue, short } from "../../core/utils/unit.js";
import { ItemSlot } from "../var/item_slot.js";
import { RNPCMap, RegionSend } from "../region.js";
import { GetDamageNPC } from "../functions/getDamage.js";
import { SendTargetHP } from "../functions/sendTargetHP.js";
import { OnNPCDead } from "../events/onNPCDead.js";

export const ATTACK: IGameEndpoint = async function (
  socket: IGameSocket,
  body: Queue,
  opcode: number
) {
  let type = body.byte();
  let result = body.byte();
  let tid = body.short();
  let delayTime = body.short();
  let distance = body.short();

  let klass = socket.character.strKlass;
  let rightHand = socket.character.items[ItemSlot.RIGHTHAND];

  if (rightHand && klass != "mage") {
    // FIXME: do controls
  } else if (delayTime < 100) return;

  // TODO: User cant attack more than 1 in 1 second..

  try {
    if (tid >= 10000) {
      // npc
      let npcRegion = RNPCMap[tid];

      if (npcRegion) {
        let npc = npcRegion.npc;

        let damage = GetDamageNPC(socket, npc);

        let oldHP = npc.hp;
        npc.hp = Math.max(0, npc.hp - damage);
        let realDamage = oldHP - npc.hp;

        if (realDamage > 0) {
          // TODO: Item wore etc..
        }

        if (!npc.damagedBy) {
          npc.damagedBy = {};
        }

        let session = socket.session;
        npc.damagedBy[session] = (npc.damagedBy[session] || 0) + realDamage;

        let status = 1;
        if (npc.hp == 0) {
          // dead lol
          status = 2;
        }

        SendTargetHP(socket, 0, -damage);
        RegionSend(socket, [
          opcode, // ATTACK,
          type,
          status, // ok
          ...short(socket.session),
          ...short(tid),
        ]);

        if (status == 2) {
          OnNPCDead(npc);
        }
        return;
      }
    }

    if (tid < 10000) {
      // user
    }

    throw new Error("miss");
  } catch (e) {
    RegionSend(socket, [
      opcode, // ATTACK,
      type,
      0, // failed
      ...short(socket.session),
      ...short(tid),
    ]);
  }
};
