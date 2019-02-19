
const sendRegionHide = require('../functions/sendRegionHide');

module.exports = (region, socket) => {
  let sessions = (socket.knownSessions || []);
  let me = socket.session;

  for (let session of sessions) {
    let u = region.sessions[session];

    if (u) {
      sendRegionHide(u, me, 1);
    }
  }

  socket.knownSessions = [];

  if (socket.variables.blinkExpiry) {
    clearTimeout(socket.variables.blinkExpiry);
  }

  socket.character.save();
}