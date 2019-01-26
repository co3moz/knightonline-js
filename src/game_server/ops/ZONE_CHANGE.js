const unit = require('../../core/utils/unit');
const region = require('../region');
const sendRegionPlayers = require('../functions/sendRegionPlayers');

module.exports = async function ({ body, socket, opcode }) {
  let subOpcode = body.byte();

  if (subOpcode == ZONE_CHANGE.LOADING) {
    socket.send([
      opcode, ZONE_CHANGE.LOADED
    ]);
  } else if (subOpcode == ZONE_CHANGE.LOADED) {
    sendRegionPlayers(socket, true);
  }
}

const ZONE_CHANGE = {
  LOADING: 1,
  LOADED: 2,
  TELEPORT: 3,
  MILITARY: 4
};