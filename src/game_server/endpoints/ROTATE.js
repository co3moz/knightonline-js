const unit = require('../../core/utils/unit');
const region = require('../region');
const { sendMessageToPlayer } = require('../functions/sendChatMessage')

const zoneCodes = require('../var/zone_codes');

module.exports = async function ({ body, socket, opcode }) {
  let c = socket.character;

  if (!c) return;

  let direction = body.short();
  c.direction = direction;

  sendMessageToPlayer(socket, 1, 'DIRECTION', 'value: ' + direction, socket.user.nation, -1)

  region.regionSend(socket, [
    opcode,
    ...unit.short(socket.session),
    ...unit.short(direction),
  ]);
}