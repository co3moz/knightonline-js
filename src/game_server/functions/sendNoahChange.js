const unit = require('../../core/utils/unit');

const MAX_NOAH = 2100000000;
module.exports = (socket, noah, shouldISendPacket = true) => {
  let c = socket.character;
  if (noah < 0) {
    if (c.money + noah < 0) {
      return false;
    }
  }

  c.money = Math.min(MAX_NOAH, c.money + noah);

  if (shouldISendPacket) {
    socket.send([
      0x4A, // GOLD_CHANGE
      noah < 0 ? 2 : 1, // 1: GOLD GAIN, 2: GOLD LOSS, 5: GOLD EVENT
      ...unit.int(Math.abs(noah)),
      ...unit.int(c.money)
    ]);
  }

  return true;
}