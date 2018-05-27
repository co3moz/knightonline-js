module.exports = async function ({ socket, opcode }) {
  socket.sendWithHeaders([
    opcode,
    1,
    0, 0, 0, 0 //unit.int(0)
  ]);
}