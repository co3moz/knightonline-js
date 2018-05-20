const unit = require('../../core/utils/unit');

module.exports = async function ({socket,  data, serverVersion}) {
  let clientVersion = unit.readShort(data, 5);
  socket.debug(`server version: ${serverVersion}, client version: ${clientVersion}`);

  socket.sendWithHeaders([
    0x1,
    ...unit.short(serverVersion)
  ]);
}