const crypt = require('../../core/utils/crypt');

module.exports = async function ({ socket }) {
  if (!socket.cryption) {
    socket.cryption = crypt();
  }

  /*TODO: şifrelemeyi dahil et*/
  socket.sendWithHeaders([
    0xF2,
    ...socket.cryption.public
  ]);

  /*socket.sendWithHeaders([
    0xF2,
    0, 0, 0, 0, 0, 0, 0, 0
  ]);*/

  socket.cryption.enabled = true;
}