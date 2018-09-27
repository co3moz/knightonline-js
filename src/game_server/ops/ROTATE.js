const unit = require('../../core/utils/unit');
const zoneCodes = require('../var/zone_codes');

module.exports = async function ({ body, socket, opcode }) {
  let c = socket.character;

  if (!c) return;

  let direction = body.short();
  c.direction = direction;

  socket.shared.region.regionSend(socket, [
    opcode,
    ...unit.short(socket.session),
    ...unit.short(direction),
  ]);
}