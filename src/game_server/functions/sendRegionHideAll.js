const region = require('../region');
const sendRegionHide = require('./sendRegionHide');

module.exports = (socket) => {
  let knownSessions = socket.knownSessions;

  if (knownSessions) {
    let s = socket.session;

    for (let session of knownSessions.slice()) {
      let userSocket = region.sessions[session];

      if (!userSocket) continue;

      sendRegionHide(userSocket, s);
    }
  }
}