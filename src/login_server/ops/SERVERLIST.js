const unit = require('../../core/utils/unit');
const cache = require('../../core/redis/cache');

module.exports = async function ({ socket, db, data }) {
  let echo = unit.readShort(data, 5);

  let servers = await cache('servers', async () => {
    let { Server } = db.models;

    let servers = await Server.find().exec();

    return [servers.length].concat(...servers.map(server => [
      ...unit.string(server.ip),
      ...unit.string(server.lanip),
      ...unit.string(server.name),
      ...unit.short(server.onlineCount),
      ...unit.short(1 /** server id */),
      ...unit.short(1 /** group id */),
      ...unit.short(server.userPremiumLimit),
      ...unit.short(server.userFreeLimit),
      0,
      ...unit.string(server.karusKing),
      ...unit.string(server.karusNotice),
      ...unit.string(server.elmoradKing),
      ...unit.string(server.elmoradNotice)
    ]));
  });

  socket.sendWithHeaders([
    0xF5,
    ...unit.short(echo),
    ...servers
  ]);
}