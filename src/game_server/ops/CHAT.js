const unit = require('../../core/utils/unit');
const crypt = require('../../core/utils/crypt');
const config = require('config');

module.exports = async function ({ body, socket, opcode }) {
  let type = body.byte();
  let message = body.string();
  // is message contain '+' sign and character has gm rights?
  let IS_GM_COMMAND = socket.character.gm && message[0] === '+';

  if (IS_GM_COMMAND) {
    let command = message.split(" ")[0].substr(1, message.split(" ")[0].length);
    GM_COMMANDS[command](message, socket, opcode);
  }

  // don't send message as public if it is valid gm command
  if (!IS_GM_COMMAND && type == MESSAGE_TYPES.GENERAL) {
    if (message.length > 128) {
      message = message.substring(0, 128)
    }

    socket.shared.region.regionSend(socket, [
      opcode,
      type,
      socket.user.nation,
      ...unit.short(socket.session & 0xFFFF),
      ...unit.byte_string(socket.character.name),
      ...unit.string(message, 'ascii')
    ]);
  }

}

const MESSAGE_TYPES = {
  GENERAL: 1
}

const GM_COMMANDS = {
  notice: (message, socket, opcode) => {
    // get first 3 characters for gm chat command
      socket.shared.region.regionSend(socket, [
        opcode,
        8,
        0, 0, 0, 0,
        ...unit.string(message.substr(7, message.length), 'ascii')
      ]);
  }
}