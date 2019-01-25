
const sendRegionHide = require('./sendRegionHide');

module.exports = (region, socket) => {
  let sessions = (socket.knownSessions || []);
  let me = socket.session;

  for (let session of sessions) {
    let u = region.sessions[session];

    if (u) {
      sendRegionHide(u, me, 1);
    }
  }
}