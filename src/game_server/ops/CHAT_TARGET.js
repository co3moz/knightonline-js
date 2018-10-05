const unit = require('../../core/utils/unit');
const GM_COMMANDS_HEADER = require('./CHAT.js').GM_COMMANDS_HEADER;

module.exports = async function ({ body, socket, opcode }) {
  let type = body.byte();
  let user = body.string();

  if (type == 1) {
    if (user == GM_COMMANDS_HEADER && socket.character.gm) { // allow gm chat with server
      socket.variables.chatTo = user;
      return socket.send([
        opcode, type, 1, 0, ...unit.string(user)
      ]);
    }

    let userSocket = socket.shared.region.users[user];
    if (!userSocket) {
      socket.variables.chatTo = null;
      return socket.send([
        opcode, type, 0, 0
      ]);
    }

    // TODO: check blocking

    socket.variables.chatTo = user;

    return socket.send([
      opcode, type, 1, 0, ...unit.string(user)
    ]);
  }


  console.error('CHAT_TARGET type#' + type);
}