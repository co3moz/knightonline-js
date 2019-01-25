const unit = require('../../core/utils/unit');
const region = require('../region');

module.exports = async function ({ body, socket, opcode }) {
  let subOpcode = body.byte();

  if (subOpcode == ZONE_CHANGE.LOADING) {
    region.update(socket);

    socket.send([
      opcode, ZONE_CHANGE.LOADED
    ]);
  }
}

const ZONE_CHANGE = {
  LOADING: 1,
  LOADED: 2,
  TELEPORT: 3,
  MILITARY: 4
};