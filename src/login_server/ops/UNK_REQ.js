module.exports = async function ({ socket }) {
  socket.send([
    0xFD, 0, 0
  ]);
}