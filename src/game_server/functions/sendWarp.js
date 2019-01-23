const unit = require('../../core/utils/unit');
const { sendMessageToPlayer } = require('../functions/sendChatMessage');

const startPositions = require('../var/zone_start_position');

exports.sendWarp = (socket, zone, x, z) => {
  if (zone && socket.character.zone !== zone) {
    if(typeof x == 'undefined') {
      let pos = exports.discover(zone);

      if (!pos) {
        return sendMessageToPlayer(socket, 1, '[SERVER]', 'Unknown zone!');
      }
  
      socket.send([
        0x27, // ZONE_CHANGE
        3, // ZONE_CHANGE_TELEPORT
        ...unit.short(zone),
        ...unit.short(pos.x),
        ...unit.short(pos.z),
      ])
    }
   
  } else {
    socket.send([
      0x1E, // WARP
      ...unit.short(x * 10),
      ...unit.short(z * 10)
    ]);
  }
}

exports.discover = (socket, zone) => {
  let u = socket.user;

  let startPosition = startPositions[zone];
  let x = 0;
  let z = 0;

  if (!startPosition) {
    return;
  }

  if (u.nation == 1) {
    x = startPosition['karus'][0];
    z = startPosition['karus'][1];
  } else {
    x = startPosition['elmorad'][0];
    z = startPosition['elmorad'][1];
  }

  x += (Math.random() - 0.5) * startPosition['range'][0];
  z += (Math.random() - 0.5) * startPosition['range'][1];

  return { x, z };
}