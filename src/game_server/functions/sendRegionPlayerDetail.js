const unit = require('../../core/utils/unit');
const region = require('../region');
const buildUserDetail = require('./buildUserDetail');

module.exports = (socket, sessions) => {
  let result = [0x16, 0, 0];

  let userCount = 0;
  for (let session of sessions) {
    let userSocket = region.sessions[session];
    if (!userSocket) continue;
    if (userCount > 1000) continue; // don't send over 1000 data

    userCount++;

    result.push(0);
    result.push(...unit.short(session));
    result.push(...buildUserDetail(userSocket));
  }

  result[1] = userCount & 0xFF;
  result[2] = userCount >>> 8;

  socket.sendCompressed(result);
}