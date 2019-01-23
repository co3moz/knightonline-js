const unit = require('../../core/utils/unit');
const region = require('../region');
const { BREAST, LEG, HEAD, GLOVE, FOOT, SHOULDER, RIGHTHAND, LEFTHAND, CWING, CHELMET, CLEFT, CRIGHT, CTOP, FAIRY } = require('../var/item_slot');

module.exports = (socket, sessions) => {
  let result = [0x16, 0, 0];

  let userCount = 0;
  for (let session of sessions) {
    let userSocket = region.sessions[session];
    if (!userSocket) continue;
    if (userCount > 1000) continue; // don't send over 1000 data
    
    userCount++;
    let uu = userSocket.user;
    let uc = userSocket.character;
    result.push(0);
    result.push(...unit.short(userSocket.session));
    result.push(...unit.byte_string(uc.name));
    result.push(...unit.short(uu.nation));
    result.push(...unit.short(-1)); // clan Id
    result.push(0); // fame
    result.push(0, 0, 0, 0, 0, 0, 0, 0xFF, 0xFF, 0, 0, 0, 0, 0); // clan_details..
    result.push(uc.level);
    result.push(uc.race);
    result.push(...unit.short(uc.klass));
    result.push(...unit.short(uc.x * 10));
    result.push(...unit.short(uc.z * 10));
    result.push(...unit.short(uc.y * 10));
    result.push(uc.face);
    result.push(...unit.int(uc.hair));
    result.push(uc.hptype || 0);
    result.push(...unit.int(uc.abnormalType || 1));
    result.push(0); // need party
    result.push(uc.gm ? 0 : 1);
    result.push(0); // party leader?
    result.push(0); // invisibility state
    result.push(0); // teamcolor
    result.push(0); // helmet hiding
    result.push(0); // cospre hiding
    result.push(...unit.short(uc.direction));
    result.push(0); // chicken?
    result.push(uc.rank);
    result.push(1, 0);
    result.push(0, 0); // np rank

    for (let m of [BREAST, LEG, HEAD, GLOVE, FOOT, SHOULDER, RIGHTHAND, LEFTHAND, CWING, CHELMET, CLEFT, CRIGHT, CTOP, FAIRY]) {

      let item = uc.items[m];

      if (item) {
        result.push(...unit.int(item.id), ...unit.short(item.durability), item.flag);
      } else {
        result.push(0, 0, 0, 0, 0, 0, 0);
      }
    }

    result.push(uc.zone);
    result.push(0xFF, 0xFF, 0, 0, 0, 0, 0, 0, 0, 0/* genie */); //?
    result.push(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1); //?
  }

  result[1] = userCount & 0xFF;
  result[2] = userCount >>> 8;

  socket.sendCompressed(result);
}