const unit = require('../../core/utils/unit');

const sendRegionNPCShow = (socket, npcUUID) => {
  if (!socket) return;

  let npcSessions = socket.npcSessions;
  if (!npcSessions) {
    npcSessions = socket.npcSessions = [];
  }

  let index = npcSessions.findIndex(x => x == npcUUID);

  if (index != -1) {
    npcSessions.splice(index, 1);

    socket.send([
      0x0A, // NPC_IN_OUT
      2, // OUT
      ...unit.short(npcUUID)
    ]);
  }
}

module.exports = sendRegionNPCShow;