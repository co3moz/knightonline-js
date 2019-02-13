const unit = require('../../core/utils/unit');
const { getDrop } = require('../functions/dropHandler');

module.exports = async function ({ body, socket, opcode }) {
  let dropIndex = body.int();
  let item = body.int();

  let drop = getDrop(dropIndex);
  if (!drop) return;
  if (drop.session != socket.session) return;
}