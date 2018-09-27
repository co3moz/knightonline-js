const unit = require('../../core/utils/unit');

module.exports = async function ({ body, socket, opcode }) {
  let c = socket.character;
  let subOpcode = body.byte();

  if (subOpcode == 0x01) { // send all user data in same zone
    let result = [opcode, subOpcode, 1, c.zone, 0, 0, 0]; // last 0, 0 is count
    let userCount = 0;
    for (let userSocket of socket.shared.region.query(socket, { zone: true })) { // request all users in the zone
      userCount++;

      let uc = userSocket.character;
      result.push(...unit.byte_string(uc.name));
      result.push(userSocket.user.nation);
      result.push(1, 0);
      result.push(...unit.short(uc.x * 10));
      result.push(...unit.short(uc.z * 10));
      result.push(0, 0, 0, 0, 0, 0); // TODO: clan info 
      result.push(4, 0);
    }

    result[5] = userCount % 0xFF >>> 0;
    result[6] = userCount >>> 8;

    socket.sendCompressed(result);
  }
}