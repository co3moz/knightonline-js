const unit = require('../../core/utils/unit');
const sendRegionHide = require('./sendRegionHide');
const sendRegionShow = require('./sendRegionShow');
const buildUserDetail = require('./buildUserDetail');

module.exports = (region, socket, s) => {
  if(!socket.ingame) return;
  let names = [];
  let newSessions = [];
  let oldSessions = (socket.knownSessions || []).slice();

  for (let userSocket of region.query(socket)) {
    newSessions.push(userSocket.session);
    names.push(userSocket.character.name);
  }

  for (let oldSession of oldSessions) {
    if (!newSessions.find(x => x == oldSession)) {
      sendRegionHide(socket, oldSession);
    }
  }


  let cache;

  for (let newSession of newSessions) {
    if (!oldSessions.find(x => x == newSession)) {
      let userSocket = region.sessions[newSession];

      if (userSocket) {
        if (!cache) {
          cache = buildUserDetail(socket);
        }
        
        sendRegionShow(userSocket, socket.session, 0, cache);
      }
    }
  }

  socket.send([
    0x10, 7, socket.user.nation,
    0, 0,
    ...unit.byte_string('REGION'),
    ...unit.string(`${s} users: ${names.join(', ')}`, 'ascii')
  ]);
}