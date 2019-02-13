const unit = require('../../core/utils/unit');
const { getDrop } = require('../functions/dropHandler');
const { sendMessageToPlayer } = require('../functions/sendChatMessage');

module.exports = async function ({ body, socket, opcode }) {
  let dropIndex = body.int();

  let drop = getDrop(dropIndex);
  if (!drop) return;
  if (drop.session != socket.session) return;

  let result = [
    opcode,
    ...unit.int(dropIndex), 1
  ];

  sendMessageToPlayer(socket, 1, '[DROPS]', `total: ${drop.items.map(x=> x.item + '(' + x.amount + ')').join(' ')}`, undefined, -1);

  for (let i = 0; i < 6; i++) {
    let item = drop.items[i];
    if (item) {
      result.push(...unit.int(item.item), ...unit.short(item.amount));
    } else {
      result.push(0, 0, 0, 0, 0, 0);
    }
  }

  socket.send(result);
}