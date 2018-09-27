const unit = require('../../core/utils/unit');

module.exports = async function ({ socket, opcode }) {
  socket.send([
    opcode,
    1, 0,
    ...unit.short(1)
  ]);
}