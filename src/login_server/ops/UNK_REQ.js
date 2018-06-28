module.exports = async function ({ socket }) {
  socket.sendWithHeaders([
    0xFD, 0, 0
  ]);
}