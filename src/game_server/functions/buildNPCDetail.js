const unit = require('../../core/utils/unit');

function buildNPCDetail(npc) {
  // if (npc.cache) {
  //   return npc.cache;
  // }

  let model = npc.npc;
  const result = [];

  result.push(...unit.short(model.id));
  result.push(model.isMonster ? 1 : 2);
  result.push(...unit.short(model.pid));
  result.push(...unit.int(model.sellingGroup));
  result.push(model.type || 0);
  result.push(0, 0, 0, 0);
  result.push(...unit.short(model.size));
  result.push(...unit.int(model.weapon1));
  result.push(...unit.int(model.weapon2));
  result.push((model.isMonster ? 0 : model.group) || 0);
  result.push(model.level || 1);
  result.push(...unit.short(npc.x * 10));
  result.push(...unit.short(npc.z * 10));
  result.push(0, 0);
  result.push(0, 0, 0, 0); // FIXME: isGameOpen thing
  result.push(0); // FIXME: special npc
  result.push(0, 0, 0, 0);
  result.push(...unit.short(npc.direction));

  npc.cache = result;
  return result;
}

module.exports = buildNPCDetail;