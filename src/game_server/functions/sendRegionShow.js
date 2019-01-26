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

    let showType = 1;

    if(onlyOneWay == 3) { // special case, when user login
      showType = 3;
    } else if(onlyOneWay == 4) { // special case, when user warps
      showType = 4;
    }

    socket.send([
      0x07,  // USER_IN_OUT
      showType, 0, // show
      ...unit.short(session),
      ...cached
    ]);
  }

  if (!onlyOneWay) {
    sendRegionShow(region.sessions[session], socket.session, 1);
  }
}

module.exports = sendRegionShow;