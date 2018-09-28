const unit = require('../../core/utils/unit');
const crypt = require('../../core/utils/crypt');
const config = require('config');
const gmCommands = require('../../game_server/var/gm_commands');

module.exports = async function ({ body, socket, opcode }) {
  let type = body.byte();
  let message = body.string();
  // is message contain '+' sign and character has gm rights?
  let IS_GM_COMMAND = message.substr(0, 1) === '+' && !socket.character.gm;

  if (IS_GM_COMMAND) {
    // get first 3 characters for gm chat command
    let command = message.substr(1,3);

    if (message.length > 128) {
      message = message.substring(0, 128)
    }

    socket.shared.region.regionSend(socket, [
      opcode,
      gmCommands[command],
      socket.user.nation,
      ...unit.short(socket.session & 0xFFFF),
      ...unit.byte_string(socket.character.name),
      ...unit.string(message.substr(4, message.length), 'ascii')
    ]);
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