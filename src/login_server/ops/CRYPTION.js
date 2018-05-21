const crypt = require('../../core/utils/crypt');

module.exports = async function ({ socket }) {
  if (!socket.cryption) {
    socket.cryption = crypt();
  }

  socket.sendWithHeaders([
    0xF2,
    ...socket.cryption.public
  ]);

  socket.cryption.enabled = true;
}