const unit = require('../../core/utils/unit');
const zoneCodes = require('../var/zone_codes');
const startPositions = require('../var/zone_start_position');

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


  let startPosition = startPositions[c.zone];
  let x = 0;
  let z = 0;

  if (!startPosition) {
    return;
  }

  if (u.nation == 1) {
    x = startPosition['karus'][0];
    z = startPosition['karus'][1];
  } else {
    x = startPosition['elmorad'][0];
    z = startPosition['elmorad'][1];
  }

  c.x = x;
  c.z = z;

  socket.shared.region.update(socket);

  // TODO: HOME add health controls etc..

  socket.send([
    0x1E, // WARP
    ...unit.short(x * 10),
    ...unit.short(z * 10)
  ]);
}