const unit = require('../../core/utils/unit');
const region = require('../region');
const buildUserDetail = require('./buildUserDetail');

const sendRegionShow = (socket, session, onlyOneWay, cached) => {
  if (!socket) return;
  if (socket.session == session) return;

  let knownSessions = socket.knownSessions;
  if (!knownSessions) knownSessions = socket.knownSessions = [];

  let index = knownSessions.findIndex(x => x == session);

  if (index == -1) {
    knownSessions.push(session);

    if (!cached) {
      let u = region.sessions[session];
      if (u) {
        cached = buildUserDetail(u);
      }
    }

    socket.send([
      0x07,  // USER_IN_OUT
      1, 0, // show
      ...unit.short(session),
      ...cached
    ]);
  }

  if (!onlyOneWay) {
    sendRegionShow(region.sessions[session], socket.session, 1);
  }
}

module.exports = sendRegionShow;