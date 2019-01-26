const zoneCodes = require('../var/zone_codes');
const { sendWarp } = require('../functions/sendWarp');

module.exports = async function ({ body, socket, opcode }) {
  let u = socket.user;
  let c = socket.character;
  let v = socket.variables;

  if (c.zone == zoneCodes.ZONE_CHAOS_DUNGEON || c.zone == zoneCodes.ZONE_JURAD_MOUNTAIN || c.zone == zoneCodes.ZONE_BORDER_DEFENSE_WAR) {
    return;
  }

  let now = Date.now();
  if (v.lastHome) {
    if (v.lastHome > now) return;
  }

  v.lastHome = now + 1000;

  
  // TODO: HOME add health controls etc..
  
  sendWarp(socket, c.zone);
}