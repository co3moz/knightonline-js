const unit = require('../../core/utils/unit');
const region = require('../region');

const MESSAGE_TYPES = exports.MESSAGE_TYPES = {
  GENERAL: 1,
  PRIVATE: 2,
  PARTY: 3,
  FORCE: 4,
  SHOUT: 5,
  KNIGHTS: 6,
  PUBLIC: 7,
  WAR_SYSTEM: 8,
  PERMANENT: 9,
  END_PERMANENT: 10,
  MONUMENT_NOTICE: 11,
  GM: 12,
  COMMAND: 13,
  MERCHANT: 14,
  ALLIANCE: 15,
  ANNOUNCEMENT: 17,
  SEEKING_PARTY: 19,
  GM_INFO: 21,    // info window : "Level: 0, UserCount:16649" (NOTE: Think this is the missing overhead info (probably in form of a command (with args))
  COMMAND_PM: 22,    // Commander Chat PM??
  CLAN_NOTICE: 24,
  KROWAZ_NOTICE: 25,
  DEATH_NOTICE: 26,
  CHAOS_STONE_ENEMY_NOTICE: 27,    // The enemy has destroyed the Chaos stone something (Red text, middle of screen)
  CHAOS_STONE_NOTICE: 28,
  ANNOUNCEMENT_WHITE: 29,    // what's it used for?
  CHATROM: 33,
  NOAH_KNIGHTS: 34
}

exports.sendMessageToPlayer = (socket, type, sender, message, nation, session) => {
  if (typeof nation == 'undefined' && socket && socket.user) nation = socket.user.nation || 0;
  else nation = 0;

  if (typeof session == 'undefined' && socket && socket.user) session = (socket.session & 0xFFFF) || 0;
  else session = 0;

  socket.send([
    0x10, type, nation,
    ...unit.short(session),
    ...unit.byte_string(sender),
    ...unit.string(message, 'ascii')
  ]);
}

exports.sendMessageToPlayerFromPlayer = (socket, fromSocket, type, message) => {
  socket.send([
    0x10, type, fromSocket.user.nation,
    ...unit.short(fromSocket.session),
    ...unit.byte_string(fromSocket.user.name),
    ...unit.string(message, 'ascii')
  ]);
}

exports.sendPlayerMessageToRegion = (socket, message) => {
  let type = 1;
  let nation = 0;

  if (socket && socket.user) {
    nation = socket.user.nation || 0;
    type = socket.user.gm ? MESSAGE_TYPES.GM : MESSAGE_TYPES.GENERAL
  }

  region.regionSend(socket, [
    0x10, type, nation,
    ...unit.short(socket.session & 0xFFFF),
    ...unit.byte_string(socket.character.name),
    ...unit.string(message, 'ascii')
  ]);
}
