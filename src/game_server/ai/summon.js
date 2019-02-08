const uuid = require('./uuid');
const region = require('../region');

module.exports = async (npc, spawn) => {
  if (!npc) return;
  if (!spawn) return;

  let npcObj = {
    npc,
    spawn,

    uuid: uuid.reserve(),
    zone: spawn.zone,
    x: random(spawn.leftX, spawn.rightX),
    z: random(spawn.topZ, spawn.bottomZ),
    direction: spawn.direction,
    hp: npc.hp,
    mp: npc.mp,
    maxHp: npc.hp,
    maxMp: npc.mp
  };

  region.updateNpc(npcObj);

  return npcObj;
}

function random(min, max) {
  return Math.random() * (max - min) + min;
}