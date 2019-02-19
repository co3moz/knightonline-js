const unit = require('../../core/utils/unit');
const region = require('../region');
const { USER_STATES, sendStateChange } = require('../functions/sendStateChange');

module.exports = async function ({ body, socket, opcode }) {
  let subOpcode = body.byte();
  let value = body.int();

  if (subOpcode == 1) {
    sendStateChange(socket, subOpcode, value);
  }
}

