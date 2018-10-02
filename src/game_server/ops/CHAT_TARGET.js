const unit = require('../../core/utils/unit');

module.exports = async function ({ body, socket, opcode }) {
  let type = body.byte();
  let user = body.string();

  if (type == 1) {
    let userSocket = socket.shared.region.users[user];
    if (!userSocket) {
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