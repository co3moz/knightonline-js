const unit = require('../../core/utils/unit');
const region = require('../region');

module.exports = (socket, echo, damage) => {
  if (socket.targetType == 'user') {
    let targetSocket = region.sessions[socket.target];

    if (targetSocket && targetSocket.variables) {
      let c = targetSocket.character;
      let v = targetSocket.variables;

      socket.send([
        0x22, // TARGET_HP
        ...unit.short(socket.target),
        echo,
        ...unit.int(v.maxHp || 0),
        ...unit.int(c.hp),
        ...unit.short(damage || 0)
      ]);
    } else {
      socket.target = null;
      socket.targetType = 'notarget';
    }
  } else if (socket.targetType == 'npc') {
    let regionNPC = region.npcs[socket.target];

    if (regionNPC) {
      let npc = regionNPC.npc;

      socket.send([
        0x22, // TARGET_HP
        ...unit.short(socket.target),
        echo,
        ...unit.int(npc.maxHp || 0),
        ...unit.int(npc.hp),
        ...unit.short(damage || 0)
      ]);
    } else {
      socket.target = null;
      socket.targetType = 'notarget';
    }
  }
}