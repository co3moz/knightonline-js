const crypto = require('crypto');
const config = require('config');

const unit = require('../../core/utils/unit');
const region = require('../region');
const internalCommunicationSecret = config.get('gameServer.internalCommunicationSecret')

module.exports = async function ({ body, socket, opcode }) {
  let hash = body.skip(20);

  if (hash.length != 20) {
    socket.terminate('internal_query_access!!!! invalid hash length');
    return;
  }

  let request = body.array();

  if (Buffer.from(hash).toString('hex') != crypto.createHmac('sha1', internalCommunicationSecret).update(Buffer.from(request)).digest('hex')) {
    socket.terminate('internal_query_access!!!! invalid hash');
    return;
  }

  let requestBody = unit.queue(request);
  let subOpcode = requestBody.byte();
  let result = null;

  if (subOpcode == 1) { // get user count
    let users = Object.keys(region.users);
    result = [
      subOpcode,
      ...unit.short(users.length)
    ];
  } else if (subOpcode == 2) { // check online
    let requestedAccount = body.string();

    result = [
      subOpcode,
      +!!socket.shared.userMap[requestedAccount]
    ];
  } else if (subOpcode == 3) { // terminate user
    let requestedAccount = body.string();
    let remoteAddress = body.string();
    let um = socket.shared.userMap[requestedAccount];
    result = [
      subOpcode,
      +!!um
    ];

    if (um) {

      um.send([
        0x10, 7, um.user.nation, 0, 0, 0,
        ...unit.string('[SERVER] Hesabiniza ' + remoteAddress + ' ip adresinden yeni bir baglanti yapildi!', 'ascii')
      ]);

      await new Promise(r => setTimeout(r, 100));
      await um.terminate('another login request');
    }
  } else {
    result = [
      0xFF
    ]
  }

  socket.send([
    opcode,
    ...result
  ]);
}