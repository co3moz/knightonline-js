const unit = require('../../core/utils/unit');
const region = require('../region');
const { GM_COMMANDS_HEADER } = require('../functions/GMController');

module.exports = async function ({ body, socket, opcode }) {
  let type = body.byte();

  if (type == 1) {
    let user = body.string();
    if (user == GM_COMMANDS_HEADER && socket.character.gm) { // allow gm chat with server
      socket.variables.chatTo = user;
      return socket.send([
        opcode, type, 1, 0, ...unit.string(user)
      ]);
    }

    let userSocket = region.users[user];
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


  console.error('CHAT_TARGET type#' + type + ' data#' + body.array().join(', '));
}