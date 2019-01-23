const region = require('../region');

const sendRegionPlayer = require('../functions/sendRegionPlayer');
const sendQuests = require('../functions/sendQuests');
const sendNotices = require('../functions/sendNotices');
const sendTime = require('../functions/sendTime');
const sendWeather = require('../functions/sendWeather');
const sendMyInfo = require('../functions/sendMyInfo');
const sendZoneAbility = require('../functions/sendZoneAbility');

module.exports = async function ({ socket, opcode, body }) {
  let subOpCode = body.byte();

  if (socket.ingame) {
    return;
  }

  if (subOpCode == 1) {
    sendQuests(socket);
    sendNotices(socket);
    sendTime(socket);
    sendWeather(socket);
    sendMyInfo(socket);
    sendZoneAbility(socket);

    socket.send([
      opcode
    ]);
  } else if (subOpCode == 2) {
    region.update(socket); // put user in region
    sendRegionPlayer(socket);
    socket.ingame = true;
  }
}



