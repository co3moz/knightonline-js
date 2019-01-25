const sendTargetHP = require('../functions/sendTargetHP');

module.exports = async function ({ body, socket, opcode }) {
  let target = body.short();
  let echo = body.byte();

  socket.target = target;

  if (target >= 10000) {
    socket.targetType = 'npc';
  } else {
    socket.targetType = 'user';
  }


  sendTargetHP(socket, echo, 0);
}