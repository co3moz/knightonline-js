const config = require('config');
const unit = require('../../core/utils/unit');
const levelUp = config.get('gameServer.levelUp');
const sendLevelChange = require('./sendLevelChange');

module.exports = (socket, exp) => {
  if (exp <= 0) return; // TODO: handle this case later

  let c = socket.character;

  // TODO: Handle premium exp percentage

  c.exp += exp;

  let maxExp = levelUp[c.level];

  if (c.exp > maxExp) {
    if (c.level < 83) {
      c.exp -= maxExp;
      return sendLevelChange(socket, c.level + 1);
    } else {
      c.exp = maxExp;
    }
  }

  // Yeah, user might not gain any exp because of maxExp. But we will report no matter what..
  socket.send([
    0x1A, // EXP_CHANGE OPCODE
    0,
    ...unit.long(c.exp)
  ]);
}