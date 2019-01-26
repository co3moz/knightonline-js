const region = require('../region');
const { sendStateChange, ABNORMAL_STATES } = require('./sendStateChange');
const { ZONE_ARDREAM, ZONE_NEW_RONARK_EVENT, ZONE_RONARK_LAND, ZONE_UNDER_THE_CASTLE, ZONE_JURAD_MOUNTAIN, ZONE_CHAOS_DUNGEON, ZONE_BORDER_DEFENSE_WAR } = require('../var/zone_codes');
const { rules, flags } = require('../var/zone_rules');

const sendBlinkStart = exports.sendBlinkStart = (socket) => {
  let v = socket.variables;
  let c = socket.character;

  let zone = c.zone;

  if (zone == ZONE_ARDREAM
    || zone == ZONE_NEW_RONARK_EVENT
    || zone == ZONE_RONARK_LAND
    || zone == ZONE_UNDER_THE_CASTLE
    || zone == ZONE_JURAD_MOUNTAIN
    || zone == ZONE_CHAOS_DUNGEON
    || zone == ZONE_BORDER_DEFENSE_WAR) {
    return;
  }

  if (rules[zone].flags & flags.WAR_ZONE) return;

  if (v.blinkExpiry) {
    clearTimeout(v.blinkExpiry);
  }

  v.blinkExpiry = setTimeout(() => {
    sendStateChange(socket, 3, ABNORMAL_STATES.NORMAL);

    v.blinkExpiry = 0;
  }, 10000);

  sendStateChange(socket, 3, ABNORMAL_STATES.BLINKING);
}