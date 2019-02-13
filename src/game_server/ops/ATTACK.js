const unit = require('../../core/utils/unit');
const region = require('../region');
const { RIGHTHAND } = require('../var/item_slot');
const { getDamageNPC } = require('../functions/getDamage');
const sendTargetHP = require('../functions/sendTargetHP');
const onNPCDead = require('../functions/onNPCDead');

module.exports = async function ({ body, socket, opcode }) {
  let type = body.byte();
  let result = body.byte();
  let tid = body.short();
  let delayTime = body.short();
  let distance = body.short();

  let klass = socket.character.strKlass;
  let rightHand = socket.character.items[RIGHTHAND];

  if (rightHand && klass != 'mage') {
    // FIXME: do controls
  } else if (delayTime < 100) return;

  // TODO: User cant attack more than 1 in 1 second..  

  try {
    if (tid >= 10000) { // npc
      let npcRegion = region.npcs[tid];

      if (npcRegion) {
        let npc = npcRegion.npc;

        let damage = getDamageNPC(socket, npc);

        let oldHP = npc.hp;
        npc.hp = Math.max(0, npc.hp - damage);
        let realDamage = oldHP - npc.hp

        if (realDamage > 0) {
          // TODO: Item wore etc..
        }

        if (!npc.damagedBy) {
          npc.damagedBy = {};
        }

        let session = socket.session;
        npc.damagedBy[session] = (npc.damagedBy[session] || 0) + realDamage;

        let status = 1;
        if (npc.hp == 0) { // dead lol
          status = 2;
        }

        sendTargetHP(socket, 0, -damage);
        region.regionSend(socket, [
          opcode, // ATTACK,
          type, status, // ok
          ...unit.short(socket.session),
          ...unit.short(tid)
        ]);

        if (status == 2) {
          onNPCDead(npc);
        }
        return;
      }
    }

    if (tid < 10000) { // user

    }

    throw new Error('miss');
  } catch (e) {
    region.regionSend(socket, [
      opcode, // ATTACK,
      type, 0, // failed
      ...unit.short(socket.session),
      ...unit.short(tid)
    ]);
  }
}