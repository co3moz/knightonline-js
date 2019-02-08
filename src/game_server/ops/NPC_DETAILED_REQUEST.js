const unit = require('../../core/utils/unit');
const region = require('../region');
const buildNPCDetail = require('../functions/buildNPCDetail');

module.exports = async function ({ body, socket, opcode }) {
  let length = body.short();

  if (length > 1000) length = 1000;

  let result = [opcode, 0, 0];
  let count = 0;

  for (let i = 0; i < length; i++) {
    let uuid = body.short();
    let npc = region.npcs[uuid];
    if (npc) {
      count++;
      result.push(...unit.short(uuid));
      result.push(...buildNPCDetail(npc.npc));
    }
  }

  result[1] = count & 0xFF;
  result[2] = count >>> 8;

  socket.send(result);
}