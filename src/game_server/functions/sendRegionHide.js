const unit = require('../../core/utils/unit');
const region = require('../region');

const sendRegionHide = (socket, session, onlyOneWay) => {
  if (!socket) return;
  if (socket.session == session) return;

  let knownSessions = socket.knownSessions;
  if (!knownSessions) {
    knownSessions = socket.knownSessions = [];
  }

  let index = knownSessions.findIndex(x => x == session);

  if (index != -1) {
    knownSessions.splice(index, 1);

    socket.send([
      0x07,  // USER_IN_OUT
      2, 0, // hide
      ...unit.short(session)
    ]);
  }
  
  if (!onlyOneWay) {
    sendRegionHide(region.sessions[session], socket.session, 1);
  }
}

module.exports = sendRegionHide;