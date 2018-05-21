const config = require('config');
const server = require('../core/server');
const database = require('../core/database');
const connectRedis = require('../core/redis/connect');

const unit = require('../core/utils/unit');
const loadVersions = require('./utils/load_versions');
const opCodes = require('./utils/op_codes');


module.exports = async function () {
  console.log('login server is going to start...');
  let db = await database();
  await connectRedis();

  let versions = await loadVersions(db);
  let { version: serverVersion } = versions[0];

  console.log('looks like latest server version is ' + serverVersion);

  await server({
    ip: config.get('loginServer.ip'),
    ports: config.get('loginServer.ports'),
    debug: true,

    sendWithHeaders: function (response) {
      this.writeb([0xAA, 0x55, ...unit.short(response.length), ...response, 0x55, 0xAA]);
    },

    onData: async (data, socket) => {
      const length = unit.readShort(data, 2);
      const opcode = data[4];

      if (doesProtocolHeaderValid(data)) return socket.terminate('invalid protocol begin')
      if (doesProtocolFooterValid(data, length)) return socket.terminate('invalid protocol end');



      /* TODO: Not working please fix */
      // if (socket.cryption) {
      //   console.log(socket.cryption.decrypt(data.slice(5, 5 + length)));
      // }

      if (!opCodes[opcode]) return socket.debug('unknown opcode!');

      await require('./ops/' + opCodes[opcode])({ socket, data, versions, length, opcode, db, serverVersion });
    }
  });
}

function doesProtocolHeaderValid(data) {
  return data[0] != 0xAA || data[1] != 0x55;
}

function doesProtocolFooterValid(data, length) {
  return data[4 + length] != 0x55 || data[5 + length] != 0xAA
}