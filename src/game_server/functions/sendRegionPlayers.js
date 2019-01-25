const unit = require('../../core/utils/unit');
const region = require('../region');
const sendRegionHide = require('./sendRegionHide');
const sendRegionShow = require('./sendRegionShow');
const buildUserDetail = require('./buildUserDetail');

module.exports = (socket) => {
  socket.send([0x15, 0]);

  let knownSessions = socket.knownSessions = [];

  if (knownSessions.length) {
    for (let session of knownSessions) {
      let socket = region.sessions[session];

      if (!socket) continue;

      sendRegionHide(socket, session);
    }
  }

  let result = [0x15, 1, 0, 0];
  let userCount = 0;
  let userDetail = buildUserDetail(socket);

  for (let userSocket of region.query(socket)) {
    if (userSocket == socket) continue;
    userCount++;
    knownSessions.push(userSocket.session);
    result.push(...unit.short(userSocket.session));

    sendRegionShow(userSocket, socket.session, 1, userDetail);
  }

  result[2] = userCount & 0xFF;
  result[3] = userCount >>> 8;

  socket.send(result);
  socket.send([0x15, 2]);
}