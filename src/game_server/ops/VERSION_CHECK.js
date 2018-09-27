const unit = require('../../core/utils/unit');
const crypt = require('../../core/utils/crypt');
const config = require('config');

module.exports = async function ({ socket, opcode }) {
  if (!socket.cryption) {
    socket.cryption = crypt();
  }

  socket.send([
    opcode,
    0,
    ...unit.short(config.get('gameServer.clientExeVersion')), /** required client version */
    ...socket.cryption.public,
    0 /** 0 for success, 1 for error */
  ]);

  socket.cryption.enabled = true;
}