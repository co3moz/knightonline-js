const unit = require('../../core/utils/unit');
const buildNPCDetail = require('./buildNPCDetail');

const sendRegionNPCShow = (socket, npc) => {
  if (!socket) return;

  let npcSessions = socket.npcSessions;
  if (!npcSessions) npcSessions = socket.npcSessions = [];

  let uuid = npc.uuid;
  let index = npcSessions.findIndex(x => x == uuid);

  if (index == -1) {
    npcSessions.push(uuid);

    socket.send([
      0x0A, // NPC_IN_OUT
      1, // IN
      ...unit.short(npc.uuid),
      ...buildNPCDetail(npc)
    ]);
  }
}

module.exports = sendRegionNPCShow;