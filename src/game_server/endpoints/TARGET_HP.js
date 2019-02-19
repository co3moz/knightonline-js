const region = require('../region');
const sendTargetHP = require('../functions/sendTargetHP');
const { sendMessageToPlayer } = require('../functions/sendChatMessage');

module.exports = async function ({ body, socket, opcode }) {
  let target = body.short();
  let echo = body.byte();

  socket.target = target;

  if (target >= 10000) {
    socket.targetType = 'npc';

    if (socket.character.gm) {
      let regionNpc = region.npcs[socket.target];
      if (regionNpc) {
        sendMessageToPlayer(socket, 1, '[TARGET]', `id: ${regionNpc.npc.uuid}, name: ${regionNpc.npc.npc.name}, hp: ${regionNpc.npc.hp}`, undefined, -1);
      }
    }
  } else {
    socket.targetType = 'user';
  }


  sendTargetHP(socket, echo, 0);
}