const ops = require('../utils/knight_opcodes');

module.exports = async function ({ socket, opcode, body }) {
  let subOpcode = body.byte();

  switch (subOpcode) {
    case ops.KNIGHTS_TOP10:
      // this is dummy, implement it later
      return socket.sendWithHeaders([
        opcode,
        ops.KNIGHTS_TOP10,
        0, 0,
        ...[].concat(...Array(10).fill(0).map((x, i) => [
          0xFF, 0xFF, 0, 0, 0xFF, 0xFF, i > 4 ? i - 5 : i, 0
        ]))
      ]);
    default:
      //handle rest
      break;
  }
}