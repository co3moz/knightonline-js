const crypt = require('../../core/utils/crypt');

module.exports = async function ({ socket, opcode }) {
  if (!socket.cryption) {
    socket.cryption = crypt();
  }

  socket.send([
    opcode,
    ...socket.cryption.public
  ]);

  socket.cryption.enabled = true;
}