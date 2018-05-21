const config = require('config');
const server = require('../core/server');
const database = require('../core/database');
const connectRedis = require('../core/redis/connect');

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

    onData: async ({ socket, opcode, length, data }) => {
      if (!opCodes[opcode]) return socket.debug('unknown opcode!');

      await require('./ops/' + opCodes[opcode])({ socket, data, versions, length, opcode, db, serverVersion });
    }
  });
}
