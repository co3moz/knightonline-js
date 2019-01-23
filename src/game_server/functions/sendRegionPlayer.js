const unit = require('../../core/utils/unit');
const region = require('../region');

module.exports = socket => {
  socket.send([0x15, 0]);

  let result = [0x15, 1, 0, 0];

  let userCount = 0;
  for (let userSocket of region.query(socket)) {
    userCount++;
    result.push(...unit.short(userSocket.session));
  }

  result[2] = userCount & 0xFF;
  result[3] = userCount >>> 8;

  socket.send(result);
  socket.send([0x15, 2]);
}