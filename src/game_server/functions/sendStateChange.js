const unit = require('../../core/utils/unit');
const region = require('../region');

const sendStateChange = exports.sendStateChange = (socket, type, value) => {
  let c = socket.character;
  let v = socket.variables;

  if (type == 1) {
    v.hptype = value;
  } else if (type == 3) {
    v.old_bnormalType = v.abnormalType;

    if (c.gm) {
      sendStateChange(socket, 5, 1);
    }

    v.abnormalType = value;
  } else if(type == 5) {
    v.abnormalType = value;
  }

  region.regionSend(socket, [
    0x29, // STATE_CHANGE
    ...unit.short(socket.session),
    type,
    ...unit.int(value)
  ]);
}
