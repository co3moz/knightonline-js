const unit = require('../../core/utils/unit');
const region = require('../region');
const sendRegionHideAll = require('./sendRegionHideAll');
const sendRegionShow = require('./sendRegionShow');
const buildUserDetail = require('./buildUserDetail');

module.exports = (socket, warp) => {
  socket.send([0x15, 0]);

  sendRegionHideAll(socket);

  let knownSessions = [];

  let result = [0x15, 1, 0, 0];
  let userCount = 0;
  let userDetail = buildUserDetail(socket);

  for (let userSocket of region.query(socket)) {
    if (userSocket == socket) continue;
    userCount++;
    knownSessions.push(userSocket.session);
    result.push(...unit.short(userSocket.session));

    sendRegionShow(userSocket, socket.session, warp ? 4 : 3, userDetail);
  }


  socket.knownSessions = knownSessions;

  result[2] = userCount & 0xFF;
  result[3] = userCount >>> 8;

  socket.send(result);
  socket.send([0x15, 2]);
}