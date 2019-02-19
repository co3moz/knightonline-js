const unit = require('../../core/utils/unit');
const sendRegionHide = require('../functions/sendRegionHide');
const sendRegionShow = require('../functions/sendRegionShow');
const sendRegionNPCShow = require('../functions/sendRegionNPCShow');
const sendRegionNPCHide = require('../functions/sendRegionNPCHide');
const buildUserDetail = require('../functions/buildUserDetail');

module.exports = (region, socket, s) => {
  if (!socket.ingame) return;
  let names = [];
  let newSessions = [];
  let oldSessions = (socket.knownSessions || []).slice();
  let newNPCSessions = [];
  let oldNPCSessions = (socket.npcSessions || []).slice();

  for (let userSocket of region.query(socket)) {
    newSessions.push(userSocket.session);
    names.push(userSocket.character.name);
  }

  for (let npc of region.queryNpcs(socket)) {
    newNPCSessions.push(npc.uuid);
  }

  for (let oldSession of oldSessions) {
    if (!newSessions.find(x => x == oldSession)) {
      sendRegionHide(socket, oldSession);
    }
  }

  for (let oldNpcSession of oldNPCSessions) {
    if (!newNPCSessions.find(x => x == oldNpcSession)) {
      sendRegionNPCHide(socket, oldNpcSession);
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

  for (let newNPCSession of newNPCSessions) {
    if (!oldNPCSessions.find(x => x == newNPCSession)) {
      let npc = region.npcs[newNPCSession];

      if (npc) {
        sendRegionNPCShow(socket, npc.npc);
      }
    }
  }

  socket.send([
    0x10, 7, socket.user.nation,
    0xFF, 0xFF,
    ...unit.byte_string('REGION'),
    ...unit.string(`${s} users: ${names.join(', ')}`, 'ascii')
  ]);
}