module.exports = async function ({ socket, opcode }) {
  socket.send([
    opcode,
    1,
    0, 0, 0, 0 //unit.int(0)
  ]);
}